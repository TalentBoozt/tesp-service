"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomAttributeDefinition = void 0;
class CustomAttributeDefinition {
    key;
    displayName;
    dataType;
    allowedValues;
    constructor(props) {
        if (!props.key || !/^[a-zA-Z0-9_]+$/.test(props.key)) {
            throw new Error(`Invalid custom attribute key '${props.key}'. Key must contain alphanumeric characters and underscores only.`);
        }
        if (!props.displayName || props.displayName.trim().length === 0) {
            throw new Error('Custom attribute displayName is required');
        }
        if (!['STRING', 'NUMERIC', 'ENUM', 'DATE'].includes(props.dataType)) {
            throw new Error(`Invalid dataType '${props.dataType}'. Must be one of STRING, NUMERIC, ENUM, DATE.`);
        }
        if (props.dataType === 'ENUM' && (!props.allowedValues || props.allowedValues.length === 0)) {
            throw new Error(`Custom attribute of type ENUM must provide at least one allowed value.`);
        }
        this.key = props.key;
        this.displayName = props.displayName.trim();
        this.dataType = props.dataType;
        this.allowedValues = props.allowedValues;
    }
    toJSON() {
        return {
            key: this.key,
            displayName: this.displayName,
            dataType: this.dataType,
            ...(this.allowedValues ? { allowedValues: this.allowedValues } : {}),
        };
    }
}
exports.CustomAttributeDefinition = CustomAttributeDefinition;
//# sourceMappingURL=custom-attribute.vo.js.map