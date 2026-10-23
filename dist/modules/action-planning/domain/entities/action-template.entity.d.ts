export interface ActionTemplateProps {
    templateId: string;
    groupId: string;
    title: string;
    description: string;
    suggestedMilestones: string[];
    category?: string;
}
export declare class ActionTemplateEntity {
    readonly templateId: string;
    readonly groupId: string;
    readonly title: string;
    readonly description: string;
    readonly suggestedMilestones: string[];
    readonly category?: string;
    constructor(props: ActionTemplateProps);
    toJSON(): ActionTemplateProps;
}
