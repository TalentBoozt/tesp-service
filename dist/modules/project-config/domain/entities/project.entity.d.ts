import { Branding, IBrandingProps } from '../value-objects/branding.vo';
import { FeatureFlags, IFeatureFlagsProps } from '../value-objects/feature-flags.vo';
import { CustomAttributeDefinition, ICustomAttributeDefinitionProps } from '../value-objects/custom-attribute.vo';
import { EmailConfig, IEmailConfigProps } from '../value-objects/email-config.vo';
import { AiConfig, IAiConfigProps } from '../value-objects/ai-config.vo';
export type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
export { IEmailConfigProps, IAiConfigProps };
export interface ICustomDomainProps {
    hostname: string;
    verified: boolean;
    verifiedAt?: Date;
    cnameTarget?: string;
    sslStatus?: 'ACTIVE' | 'PENDING_DNS' | 'FAILED';
}
export interface ISamlConfigProps {
    enabled: boolean;
    protocol?: 'SAML_2' | 'OIDC_PKCE';
    issuerUrl?: string;
    clientIdOrEntityId?: string;
    metadataUrlOrCert?: string;
    enforceSsoOnly?: boolean;
    ssoLoginUrl?: string;
}
export interface IBenchmarkSettingsProps {
    overallScoreBenchmark?: number;
    dimensionBenchmarks?: Record<string, number>;
}
export interface IProjectProps {
    projectId: string;
    name: string;
    status?: ProjectStatus;
    branding: IBrandingProps;
    supportedLocales: string[];
    defaultLocale: string;
    features?: Partial<IFeatureFlagsProps>;
    customAttributeDefinitions?: ICustomAttributeDefinitionProps[];
    aiConfig?: Partial<IAiConfigProps>;
    emailConfig?: Partial<IEmailConfigProps>;
    customDomain?: Partial<ICustomDomainProps>;
    samlConfig?: Partial<ISamlConfigProps>;
    benchmarkSettings?: Partial<IBenchmarkSettingsProps>;
    version?: number;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class ProjectEntity {
    static PROJECT_ID_REGEX: RegExp;
    readonly projectId: string;
    private _name;
    private _status;
    private _branding;
    private _supportedLocales;
    private _defaultLocale;
    private _features;
    private _customAttributeDefinitions;
    private _aiConfig;
    private _emailConfig;
    private _customDomain?;
    private _samlConfig?;
    private _benchmarkSettings?;
    private _version;
    private _isDeleted;
    readonly createdAt: Date;
    private _updatedAt;
    constructor(props: IProjectProps);
    get name(): string;
    get status(): ProjectStatus;
    get branding(): Branding;
    get supportedLocales(): string[];
    get defaultLocale(): string;
    get aiConfig(): IAiConfigProps;
    get emailConfig(): IEmailConfigProps;
    get emailConfigVO(): EmailConfig;
    get aiConfigVO(): AiConfig;
    updateEmailConfig(params: Partial<IEmailConfigProps>): void;
    updateAiConfig(params: Partial<IAiConfigProps>): void;
    get features(): FeatureFlags;
    get customAttributeDefinitions(): CustomAttributeDefinition[];
    get version(): number;
    get isDeleted(): boolean;
    get updatedAt(): Date;
    updateDetails(params: {
        name?: string;
        branding?: IBrandingProps;
        supportedLocales?: string[];
        defaultLocale?: string;
        customAttributeDefinitions?: ICustomAttributeDefinitionProps[];
    }): void;
    toggleFeatures(newFeatures: Partial<IFeatureFlagsProps>): void;
    setStatus(newStatus: ProjectStatus): void;
    markAsDeleted(): void;
    toPublicThemeDTO(): {
        projectId: string;
        companyName: string;
        primaryColor: string;
        secondaryColor: string;
        logoUrl: string | undefined;
        defaultLocale: string;
    };
    get customDomain(): ICustomDomainProps | undefined;
    get samlConfig(): ISamlConfigProps | undefined;
    get benchmarkSettings(): IBenchmarkSettingsProps | undefined;
    updateBenchmarkSettings(settings: Partial<IBenchmarkSettingsProps>): void;
    updateCustomDomain(domain: Partial<ICustomDomainProps>): void;
    updateSamlConfig(saml: Partial<ISamlConfigProps>): void;
    toJSON(): {
        projectId: string;
        name: string;
        status: ProjectStatus;
        branding: IBrandingProps;
        supportedLocales: string[];
        defaultLocale: string;
        features: IFeatureFlagsProps;
        customAttributeDefinitions: ICustomAttributeDefinitionProps[];
        aiConfig: IAiConfigProps;
        emailConfig: IEmailConfigProps;
        customDomain: ICustomDomainProps | undefined;
        samlConfig: ISamlConfigProps | undefined;
        benchmarkSettings: IBenchmarkSettingsProps | undefined;
        version: number;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
    };
}
