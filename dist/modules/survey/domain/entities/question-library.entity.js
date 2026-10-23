"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionLibraryItemEntity = void 0;
class QuestionLibraryItemEntity {
    static LIBRARY_ID_REGEX = /^LIB-[A-Za-z0-9_-]{3,20}$/;
    projectId;
    libraryItemId;
    category;
    groupId;
    type;
    prompt;
    options;
    isDeleted;
    createdAt;
    constructor(props) {
        if (!props.projectId || props.projectId.trim().length === 0) {
            throw new Error('projectId is required');
        }
        if (!props.libraryItemId || !QuestionLibraryItemEntity.LIBRARY_ID_REGEX.test(props.libraryItemId)) {
            throw new Error(`Invalid Library Item ID format '${props.libraryItemId}'. Expected format: ^LIB-[A-Za-z0-9_-]{3,20}$ (e.g. LIB-101).`);
        }
        if (!props.category || props.category.trim().length === 0) {
            throw new Error('Library item category is required');
        }
        if (!props.groupId || props.groupId.trim().length === 0) {
            throw new Error('Library item groupId is required');
        }
        if (!props.prompt || Object.keys(props.prompt).length === 0) {
            throw new Error('Library item prompt dictionary is required');
        }
        this.projectId = props.projectId;
        this.libraryItemId = props.libraryItemId;
        this.category = props.category.trim().toUpperCase();
        this.groupId = props.groupId.trim();
        this.type = props.type;
        this.prompt = { ...props.prompt };
        this.options = props.options ? JSON.parse(JSON.stringify(props.options)) : undefined;
        this.isDeleted = props.isDeleted ?? false;
        this.createdAt = props.createdAt || new Date();
    }
    toJSON() {
        return {
            projectId: this.projectId,
            libraryItemId: this.libraryItemId,
            category: this.category,
            groupId: this.groupId,
            type: this.type,
            prompt: this.prompt,
            options: this.options,
            isDeleted: this.isDeleted,
            createdAt: this.createdAt,
        };
    }
}
exports.QuestionLibraryItemEntity = QuestionLibraryItemEntity;
//# sourceMappingURL=question-library.entity.js.map