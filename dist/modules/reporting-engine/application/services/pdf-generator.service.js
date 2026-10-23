"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfGeneratorService = void 0;
class PdfGeneratorService {
    async generateExecutivePdf(branding, data) {
        const isSuppressed = data.status === 'SUPPRESSED' || data.responseCount < 5;
        const displayEnps = isSuppressed ? '* N/A (N < 5)' : `+${data.overallEnps}`;
        const displayIndex = isSuppressed ? '* N/A (N < 5)' : `${data.overallEngagementIndex}%`;
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: ${branding.fontFamily}; margin: 40px; color: #1F2937; }
    .header { border-bottom: 3px solid ${branding.primaryColorHex}; padding-bottom: 20px; display: flex; justify-content: space-between; }
    .title { color: ${branding.primaryColorHex}; font-size: 24px; font-weight: bold; }
    .card { background: #F3F4F6; border-radius: 8px; padding: 20px; margin-top: 20px; border-left: 5px solid ${branding.secondaryColorHex}; }
    .suppressed { color: #DC2626; font-weight: bold; }
    .footer { margin-top: 50px; font-size: 12px; color: #6B7280; border-top: 1px solid #E5E7EB; padding-top: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">${branding.companyName} Executive Briefing</div>
      <div>Campaign ID: ${data.campaignId} | Scope Node: ${data.nodeId}</div>
    </div>
    <img src="${branding.logoUrl}" height="40" alt="Logo" />
  </div>

  <div class="card">
    <h2>Engagement Overview</h2>
    <p>Total Responses: ${data.responseCount}</p>
    <p>eNPS Score: <span class="${isSuppressed ? 'suppressed' : ''}">${displayEnps}</span></p>
    <p>Engagement Index: <span class="${isSuppressed ? 'suppressed' : ''}">${displayIndex}</span></p>
  </div>

  <div class="footer">${branding.footerText}</div>
</body>
</html>
`;
        return Buffer.from(htmlContent, 'utf-8');
    }
}
exports.PdfGeneratorService = PdfGeneratorService;
//# sourceMappingURL=pdf-generator.service.js.map