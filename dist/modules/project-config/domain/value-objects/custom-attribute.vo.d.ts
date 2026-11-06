export type AttributeDataType = 'STRING' | 'NUMERIC' | 'ENUM' | 'DATE' | 'BOOLEAN';
export interface ICustomAttributeDefinitionProps {
    key: string;
    displayName: string;
    dataType: AttributeDataType;
    allowedValues?: string[];
    isRequired?: boolean;
    isSurveyFilterable?: boolean;
    description?: string;
}
export declare class CustomAttributeDefinition {
    readonly key: string;
    readonly displayName: string;
    readonly dataType: AttributeDataType;
    readonly allowedValues?: string[];
    readonly isRequired: boolean;
    readonly isSurveyFilterable: boolean;
    readonly description?: string;
    constructor(props: ICustomAttributeDefinitionProps);
    toJSON(): ICustomAttributeDefinitionProps;
}
