"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WcagContrastValidator = void 0;
class WcagContrastValidator {
    /**
     * Calculates relative luminance of a HEX color code according to WCAG 2.1 specifications.
     */
    static getRelativeLuminance(hexColor) {
        const cleanHex = hexColor.replace('#', '');
        const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
        const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
        const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
        const sRGB = [r, g, b].map((col) => {
            return col <= 0.03928 ? col / 12.92 : Math.pow((col + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    }
    /**
     * Calculates contrast ratio between two hex colors.
     */
    static calculateContrastRatio(hexColor1, hexColor2) {
        const l1 = this.getRelativeLuminance(hexColor1);
        const l2 = this.getRelativeLuminance(hexColor2);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        const ratio = (lighter + 0.05) / (darker + 0.05);
        return Math.round(ratio * 100) / 100;
    }
    /**
     * Validates color contrast against white (#FFFFFF) background for WCAG 2.1 AA compliance (min 4.5:1 for normal text).
     */
    static validateContrastAgainstWhite(hexColor) {
        const ratio = this.calculateContrastRatio(hexColor, '#FFFFFF');
        const passes = ratio >= 4.5;
        return {
            contrastRatio: ratio,
            passesWcagAa: passes,
            ...(passes
                ? {}
                : {
                    recommendation: `Contrast ratio ${ratio}:1 is below WCAG 2.1 AA requirement of 4.5:1 against light background. Consider darkening the color.`,
                }),
        };
    }
}
exports.WcagContrastValidator = WcagContrastValidator;
//# sourceMappingURL=wcag-contrast.validator.js.map