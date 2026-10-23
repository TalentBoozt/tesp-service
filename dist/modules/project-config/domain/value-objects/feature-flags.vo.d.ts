export interface IFeatureFlagsProps {
    aiAnalyticsEnabled: boolean;
    actionPlanningEnabled: boolean;
    kioskModeEnabled: boolean;
    smsDistributionEnabled: boolean;
}
export declare class FeatureFlags {
    readonly aiAnalyticsEnabled: boolean;
    readonly actionPlanningEnabled: boolean;
    readonly kioskModeEnabled: boolean;
    readonly smsDistributionEnabled: boolean;
    constructor(props?: Partial<IFeatureFlagsProps>);
    toJSON(): IFeatureFlagsProps;
}
