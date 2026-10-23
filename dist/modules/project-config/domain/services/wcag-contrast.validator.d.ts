export interface ContrastCheckResult {
    contrastRatio: number;
    passesWcagAa: boolean;
    recommendation?: string;
}
export declare class WcagContrastValidator {
    /**
     * Calculates relative luminance of a HEX color code according to WCAG 2.1 specifications.
     */
    private static getRelativeLuminance;
    /**
     * Calculates contrast ratio between two hex colors.
     */
    static calculateContrastRatio(hexColor1: string, hexColor2: string): number;
    /**
     * Validates color contrast against white (#FFFFFF) background for WCAG 2.1 AA compliance (min 4.5:1 for normal text).
     */
    static validateContrastAgainstWhite(hexColor: string): ContrastCheckResult;
}
