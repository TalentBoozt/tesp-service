export type AttributeDataType = 'STRING' | 'NUMERIC' | 'ENUM' | 'DATE';
export interface ICustomAttributeDefinitionProps {
    key: string;
    displayName: string;
    dataType: AttributeDataType;
    allowedValues?: string[];
}
export declare class CustomAttributeDefinition {
    readonly key: string;
    readonly displayName: string;
    readonly dataType: AttributeDataType;
    readonly allowedValues?: string[];
    constructor(props: ICustomAttributeDefinitionProps);
    toJSON(): ICustomAttributeDefinitionProps;
}
