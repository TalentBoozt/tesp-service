"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelReportGenerator = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const scoped_data_aggregator_service_1 = require("../services/scoped-data-aggregator.service");
class ExcelReportGenerator {
    aggregator = new scoped_data_aggregator_service_1.ScopedDataAggregatorService();
    async generateExcel(options) {
        const { reportId, projectId, campaignId, title, scopeType, scopeFilter } = options;
        const reportsDir = path_1.default.join(process.cwd(), 'tmp', 'reports');
        await fs_1.default.promises.mkdir(reportsDir, { recursive: true });
        const metrics = await this.aggregator.aggregate(projectId, campaignId, scopeType, scopeFilter);
        const fileName = `${reportId}.xlsx`;
        const filePath = path_1.default.join(reportsDir, fileName);
        const xmlWorkbook = this.buildMultiTabWorkbook(title, metrics, options);
        await fs_1.default.promises.writeFile(filePath, xmlWorkbook, 'utf-8');
        const fileSizeBytes = Buffer.byteLength(xmlWorkbook, 'utf-8');
        return {
            filePath,
            fileName,
            fileSizeBytes,
            downloadUrl: `/api/v1/reports/${reportId}/download`,
            metrics,
        };
    }
    escapeXml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
    buildMultiTabWorkbook(title, metrics, options) {
        const isSuppressed = metrics.isSuppressed;
        // Sheet 1: Summary
        const summaryRows = `
      <Row>
        <Cell ss:StyleID="HeaderTitle"><Data ss:Type="String">${this.escapeXml(title)}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Tenant Workspace ID:</Data></Cell>
        <Cell><Data ss:Type="String">${this.escapeXml(metrics.projectId)}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Campaign Identifier:</Data></Cell>
        <Cell><Data ss:Type="String">${this.escapeXml(metrics.campaignId)}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Report Scope:</Data></Cell>
        <Cell><Data ss:Type="String">${this.escapeXml(metrics.scopeType)} ${this.escapeXml(options.scopeFilter?.nodeName || '')}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Total Sample Size (N):</Data></Cell>
        <Cell><Data ss:Type="Number">${metrics.sampleSize}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Participation Turnout:</Data></Cell>
        <Cell><Data ss:Type="String">${metrics.participationRate}%</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Net Promoter Score (eNPS):</Data></Cell>
        <Cell><Data ss:Type="String">${isSuppressed ? '[SUPPRESSED - N < 5]' : (metrics.enpsScore > 0 ? '+' : '') + metrics.enpsScore}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Overall Engagement Index:</Data></Cell>
        <Cell><Data ss:Type="String">${isSuppressed ? '[SUPPRESSED - N < 5]' : metrics.overallEngagementScore.toFixed(1) + ' / 5.0'}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Privacy Anonymity Status:</Data></Cell>
        <Cell><Data ss:Type="String">${isSuppressed ? 'SUPPRESSED (N < 5 Guard Active)' : 'COMPLIANT (Differential Privacy Preserved)'}</Data></Cell>
      </Row>
    `;
        // Sheet 2: Driver Analysis
        let driverRows = `
      <Row ss:StyleID="TableHeader">
        <Cell><Data ss:Type="String">Dimension Driver</Data></Cell>
        <Cell><Data ss:Type="String">Tenant Score (out of 5)</Data></Cell>
        <Cell><Data ss:Type="String">Industry Benchmark</Data></Cell>
        <Cell><Data ss:Type="String">Variance</Data></Cell>
        <Cell><Data ss:Type="String">Evaluation Status</Data></Cell>
      </Row>
    `;
        if (isSuppressed) {
            driverRows += `
        <Row>
          <Cell><Data ss:Type="String">[SUPPRESSED]</Data></Cell>
          <Cell><Data ss:Type="String">***</Data></Cell>
          <Cell><Data ss:Type="String">***</Data></Cell>
          <Cell><Data ss:Type="String">***</Data></Cell>
          <Cell><Data ss:Type="String">Sample size N &lt; 5 violates differential privacy threshold.</Data></Cell>
        </Row>
      `;
        }
        else {
            metrics.driverScores.forEach((d) => {
                const status = d.variance >= 0.2 ? 'Outperforming' : d.variance >= -0.1 ? 'On Par' : 'Attention Required';
                driverRows += `
          <Row>
            <Cell><Data ss:Type="String">${this.escapeXml(d.name)}</Data></Cell>
            <Cell><Data ss:Type="Number">${d.score}</Data></Cell>
            <Cell><Data ss:Type="Number">${d.benchmark}</Data></Cell>
            <Cell><Data ss:Type="Number">${d.variance}</Data></Cell>
            <Cell><Data ss:Type="String">${this.escapeXml(status)}</Data></Cell>
          </Row>
        `;
            });
        }
        // Sheet 3: Department Variances
        let deptRows = `
      <Row ss:StyleID="TableHeader">
        <Cell><Data ss:Type="String">Department / Business Segment</Data></Cell>
        <Cell><Data ss:Type="String">Sample Size (N)</Data></Cell>
        <Cell><Data ss:Type="String">eNPS Score</Data></Cell>
        <Cell><Data ss:Type="String">Engagement Mean</Data></Cell>
        <Cell><Data ss:Type="String">Privacy Status</Data></Cell>
      </Row>
    `;
        metrics.departmentBreakdown.forEach((dept) => {
            if (dept.isSuppressed || isSuppressed) {
                deptRows += `
          <Row>
            <Cell><Data ss:Type="String">${this.escapeXml(dept.department)}</Data></Cell>
            <Cell><Data ss:Type="Number">${dept.sampleSize}</Data></Cell>
            <Cell><Data ss:Type="String">[SUPPRESSED - N &lt; 5]</Data></Cell>
            <Cell><Data ss:Type="String">[SUPPRESSED - N &lt; 5]</Data></Cell>
            <Cell><Data ss:Type="String">Privacy Guard: Cell suppressed</Data></Cell>
          </Row>
        `;
            }
            else {
                deptRows += `
          <Row>
            <Cell><Data ss:Type="String">${this.escapeXml(dept.department)}</Data></Cell>
            <Cell><Data ss:Type="Number">${dept.sampleSize}</Data></Cell>
            <Cell><Data ss:Type="String">${dept.enpsScore > 0 ? '+' : ''}${dept.enpsScore}</Data></Cell>
            <Cell><Data ss:Type="Number">${dept.engagementScore}</Data></Cell>
            <Cell><Data ss:Type="String">Unmasked</Data></Cell>
          </Row>
        `;
            }
        });
        // Sheet 4: Demographic Cross-Tabs
        let demoRows = `
      <Row ss:StyleID="TableHeader">
        <Cell><Data ss:Type="String">Demographic Category</Data></Cell>
        <Cell><Data ss:Type="String">Cohort Value</Data></Cell>
        <Cell><Data ss:Type="String">Sample Size (N)</Data></Cell>
        <Cell><Data ss:Type="String">Engagement Score</Data></Cell>
        <Cell><Data ss:Type="String">Differential Privacy Status</Data></Cell>
      </Row>
    `;
        metrics.demographicBreakdown.forEach((demo) => {
            if (demo.isSuppressed || isSuppressed) {
                demoRows += `
          <Row>
            <Cell><Data ss:Type="String">${this.escapeXml(demo.segment)}</Data></Cell>
            <Cell><Data ss:Type="String">${this.escapeXml(demo.value)}</Data></Cell>
            <Cell><Data ss:Type="Number">${demo.sampleSize}</Data></Cell>
            <Cell><Data ss:Type="String">[SUPPRESSED]</Data></Cell>
            <Cell><Data ss:Type="String">Redacted (N &lt; 5)</Data></Cell>
          </Row>
        `;
            }
            else {
                demoRows += `
          <Row>
            <Cell><Data ss:Type="String">${this.escapeXml(demo.segment)}</Data></Cell>
            <Cell><Data ss:Type="String">${this.escapeXml(demo.value)}</Data></Cell>
            <Cell><Data ss:Type="Number">${demo.sampleSize}</Data></Cell>
            <Cell><Data ss:Type="Number">${demo.score}</Data></Cell>
            <Cell><Data ss:Type="String">Verified Anonymized</Data></Cell>
          </Row>
        `;
            }
        });
        // Sheet 5: AI Themes
        let aiRows = `
      <Row ss:StyleID="TableHeader">
        <Cell><Data ss:Type="String">NLP Qualitative Theme</Data></Cell>
        <Cell><Data ss:Type="String">Sentiment Category</Data></Cell>
        <Cell><Data ss:Type="String">Frequency Count</Data></Cell>
        <Cell><Data ss:Type="String">Representative Extract</Data></Cell>
      </Row>
    `;
        if (isSuppressed) {
            aiRows += `
        <Row>
          <Cell><Data ss:Type="String">[SUPPRESSED - N &lt; 5]</Data></Cell>
          <Cell><Data ss:Type="String">***</Data></Cell>
          <Cell><Data ss:Type="String">***</Data></Cell>
          <Cell><Data ss:Type="String">Verbatim text suppressed to protect respondent anonymity.</Data></Cell>
        </Row>
      `;
        }
        else {
            metrics.aiSentiment.topThemes.forEach((t, i) => {
                const verbatim = metrics.aiSentiment.verbatimHighlights[i] || 'N/A';
                aiRows += `
          <Row>
            <Cell><Data ss:Type="String">${this.escapeXml(t.theme)}</Data></Cell>
            <Cell><Data ss:Type="String">${this.escapeXml(t.sentiment)}</Data></Cell>
            <Cell><Data ss:Type="Number">${t.count}</Data></Cell>
            <Cell><Data ss:Type="String">${this.escapeXml(verbatim)}</Data></Cell>
          </Row>
        `;
            });
        }
        return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="HeaderTitle">
   <Font ss:FontName="Calibri" ss:Size="14" ss:Bold="1" ss:Color="#1e293b"/>
  </Style>
  <Style ss:ID="TableHeader">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#ffffff"/>
   <Interior ss:Color="#1e293b" ss:Pattern="Solid"/>
  </Style>
 </Styles>

 <Worksheet ss:Name="Summary">
  <Table ss:DefaultColumnWidth="180">
   ${summaryRows}
  </Table>
 </Worksheet>

 <Worksheet ss:Name="Driver Analysis">
  <Table ss:DefaultColumnWidth="160">
   ${driverRows}
  </Table>
 </Worksheet>

 <Worksheet ss:Name="Department Variances">
  <Table ss:DefaultColumnWidth="160">
   ${deptRows}
  </Table>
 </Worksheet>

 <Worksheet ss:Name="Demographic Cross-Tabs">
  <Table ss:DefaultColumnWidth="160">
   ${demoRows}
  </Table>
 </Worksheet>

 <Worksheet ss:Name="AI Themes">
  <Table ss:DefaultColumnWidth="220">
   ${aiRows}
  </Table>
 </Worksheet>
</Workbook>`;
    }
}
exports.ExcelReportGenerator = ExcelReportGenerator;
//# sourceMappingURL=excel-report.generator.js.map