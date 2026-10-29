import { IProjectRepository } from '../../../project-config/domain/repositories/project.repository.interface';
import { PdfReportGenerator, GeneratedPdfResult, ReportBrandingOptions } from '../../infrastructure/generators/pdf-report.generator';
import { ExcelReportGenerator, GeneratedExcelResult } from '../../infrastructure/generators/excel-report.generator';
import { ReportScopeType, IReportScopeFilter } from '../../domain/entities/scoped-report.entity';
export interface GenerateReportInput {
    reportId?: string;
    projectId: string;
    campaignId: string;
    format?: 'PDF' | 'EXCEL' | 'POWERPOINT' | 'CSV';
    reportType?: string;
    title?: string;
    scopeType?: ReportScopeType;
    scopeFilter?: IReportScopeFilter;
    includeAiSentimentSummary?: boolean;
    includeBenchmarkComparison?: boolean;
    passwordProtected?: boolean;
    pdfPassword?: string;
    requestedBy?: string;
    branding?: ReportBrandingOptions;
    benchmark?: number | null;
}
export declare class GenerateReportUseCase {
    private projectRepo?;
    private pdfGenerator;
    private excelGenerator;
    constructor(projectRepo?: IProjectRepository | undefined, pdfGenerator?: PdfReportGenerator, excelGenerator?: ExcelReportGenerator);
    execute(input: GenerateReportInput): Promise<GeneratedPdfResult | GeneratedExcelResult>;
}
