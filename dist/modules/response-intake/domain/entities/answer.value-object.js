"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnswerValueObject = void 0;
class AnswerValueObject {
    questionId;
    questionType;
    numericValue;
    textValue;
    selectedOptions;
    constructor(props) {
        if (!props.questionId || props.questionId.trim().length === 0) {
            throw new Error('questionId is required for an answer');
        }
        if (!props.questionType) {
            throw new Error('questionType is required for an answer');
        }
        this.questionId = props.questionId;
        this.questionType = props.questionType;
        this.numericValue = props.numericValue;
        this.textValue = props.textValue;
        this.selectedOptions = props.selectedOptions ? [...props.selectedOptions] : undefined;
    }
    toJSON() {
        return {
            questionId: this.questionId,
            questionType: this.questionType,
            numericValue: this.numericValue,
            textValue: this.textValue,
            selectedOptions: this.selectedOptions ? [...this.selectedOptions] : undefined,
        };
    }
}
exports.AnswerValueObject = AnswerValueObject;
//# sourceMappingURL=answer.value-object.js.map