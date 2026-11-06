import { SupportedSocialStyleLanguage } from '../../domain/constants/answer-key-v1.definition';
import { InterpretationTemplatesCatalog } from '../../domain/constants/style-interpretations.definition';
import { SocialStyleAssessmentRecord, SocialStyleResultRecord } from '../persistence/mongoose/social-styles.repository';
export interface GenerateSocialStylePdfInput {
    reportId: string;
    reportVersion?: string;
    language: SupportedSocialStyleLanguage;
    assessment: SocialStyleAssessmentRecord;
    result: SocialStyleResultRecord;
    interpretationCatalog?: InterpretationTemplatesCatalog;
    generatedAt?: Date;
}
export interface GeneratedSocialStylePdfOutput {
    reportId: string;
    fileName: string;
    pdfBuffer: Buffer;
    fileSizeBytes: number;
    checksumSha256: string;
    language: SupportedSocialStyleLanguage;
    reportVersion: string;
    interpretationVersion: string;
    generatedAt: Date;
}
interface FontRegistryPaths {
    latinRegular?: string;
    latinBold?: string;
    sinhalaRegular?: string;
    sinhalaBold?: string;
    tamilRegular?: string;
    tamilBold?: string;
}
type ScriptRunType = 'LATIN' | 'SINHALA' | 'TAMIL';
interface ScriptTextRun {
    script: ScriptRunType;
    text: string;
}
/**
 * Dedicated PDF Report Generator for the DAASH Global / Talnova Social Styles Assessment Module.
 * - Renders both approved visualizations (Visualization A: Four-Axis Profile & Visualization B: Net Balance Coordinate)
 *   using deterministic vector graphics.
 * - Embeds OFL-licensed Noto Sans, Noto Sans Sinhala, and Noto Sans Tamil TrueType fonts with script-run switching
 *   so mixed English + Sinhala/Tamil strings render with 100% glyph coverage.
 */
export declare class SocialStylePdfGenerator {
    private readonly graphService;
    private static sharedSimulateNextFailure;
    injectFaultNextGeneration(): void;
    setSimulateFailureOnce(enabled: boolean): void;
    generateReportPdf(input: GenerateSocialStylePdfInput): Promise<GeneratedSocialStylePdfOutput>;
    /**
     * Resolves bundled Noto Sans TrueType font paths across dev (src/) and build (dist/) layouts.
     */
    resolveBundledFonts(): FontRegistryPaths;
    /**
     * Splits a string containing mixed Latin + Sinhala (U+0D80..U+0DFF) + Tamil (U+0B80..U+0BFF)
     * into contiguous script runs so each run is rendered with the exact font containing its glyphs.
     */
    splitIntoScriptRuns(text: string): ScriptTextRun[];
    private ifExists;
    private renderPdfDocument;
    private drawFourAxisProfileVectorChart;
    private drawNetBalanceVectorChart;
}
export {};
