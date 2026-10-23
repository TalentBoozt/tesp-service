"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Branding = void 0;
class Branding {
    static HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6})$/;
    companyName;
    primaryColor;
    secondaryColor;
    logoUrl;
    customCssUrl;
    constructor(props) {
        if (!props.companyName || props.companyName.trim().length === 0) {
            throw new Error('Company name is required');
        }
        if (!Branding.HEX_COLOR_REGEX.test(props.primaryColor)) {
            throw new Error('Invalid HEX color format for primaryColor. Expected format: #RRGGBB');
        }
        if (!Branding.HEX_COLOR_REGEX.test(props.secondaryColor)) {
            throw new Error('Invalid HEX color format for secondaryColor. Expected format: #RRGGBB');
        }
        if (props.logoUrl) {
            if (!props.logoUrl.startsWith('https://')) {
                throw new Error('Logo URL must use HTTPS');
            }
        }
        if (props.customCssUrl) {
            if (!props.customCssUrl.startsWith('https://')) {
                throw new Error('Custom CSS URL must use HTTPS');
            }
        }
        this.companyName = props.companyName.trim();
        this.primaryColor = props.primaryColor.toUpperCase();
        this.secondaryColor = props.secondaryColor.toUpperCase();
        this.logoUrl = props.logoUrl;
        this.customCssUrl = props.customCssUrl;
    }
    toPublicDTO() {
        return {
            companyName: this.companyName,
            primaryColor: this.primaryColor,
            secondaryColor: this.secondaryColor,
            logoUrl: this.logoUrl,
        };
    }
    toJSON() {
        return {
            companyName: this.companyName,
            primaryColor: this.primaryColor,
            secondaryColor: this.secondaryColor,
            logoUrl: this.logoUrl,
            customCssUrl: this.customCssUrl,
        };
    }
}
exports.Branding = Branding;
//# sourceMappingURL=branding.vo.js.map