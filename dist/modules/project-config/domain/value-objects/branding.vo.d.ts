export interface IBrandingProps {
    companyName: string;
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string;
    customCssUrl?: string;
}
export declare class Branding {
    private static HEX_COLOR_REGEX;
    readonly companyName: string;
    readonly primaryColor: string;
    readonly secondaryColor: string;
    readonly logoUrl?: string;
    readonly customCssUrl?: string;
    constructor(props: IBrandingProps);
    toPublicDTO(): {
        companyName: string;
        primaryColor: string;
        secondaryColor: string;
        logoUrl: string | undefined;
    };
    toJSON(): IBrandingProps;
}
