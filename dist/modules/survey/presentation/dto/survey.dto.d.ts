import { z } from 'zod';
export declare const BranchingLogicRuleSchema: z.ZodObject<{
    ruleId: z.ZodString;
    operator: z.ZodEnum<["EQUALS", "NOT_EQUALS", "LESS_THAN", "GREATER_THAN", "IN"]>;
    value: z.ZodAny;
    targetPageId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    ruleId: string;
    operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
    targetPageId: string;
    value?: any;
}, {
    ruleId: string;
    operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
    targetPageId: string;
    value?: any;
}>;
export declare const QuestionOptionSchema: z.ZodObject<{
    optionId: z.ZodString;
    label: z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodString>, Record<string, string>, Record<string, string>>;
    scoreValue: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    optionId: string;
    label: Record<string, string>;
    scoreValue?: number | undefined;
}, {
    optionId: string;
    label: Record<string, string>;
    scoreValue?: number | undefined;
}>;
export declare const QuestionSchema: z.ZodEffects<z.ZodObject<{
    questionId: z.ZodString;
    type: z.ZodEnum<["LIKERT", "NPS", "MATRIX", "SINGLE_CHOICE", "MULTIPLE_CHOICE", "RANKING", "SHORT_TEXT", "LONG_TEXT", "NUMERIC", "DATE"]>;
    groupId: z.ZodOptional<z.ZodString>;
    prompt: z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodString>, Record<string, string>, Record<string, string>>;
    isMandatory: z.ZodOptional<z.ZodBoolean>;
    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
        optionId: z.ZodString;
        label: z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodString>, Record<string, string>, Record<string, string>>;
        scoreValue: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        optionId: string;
        label: Record<string, string>;
        scoreValue?: number | undefined;
    }, {
        optionId: string;
        label: Record<string, string>;
        scoreValue?: number | undefined;
    }>, "many">>;
    logicRules: z.ZodOptional<z.ZodArray<z.ZodObject<{
        ruleId: z.ZodString;
        operator: z.ZodEnum<["EQUALS", "NOT_EQUALS", "LESS_THAN", "GREATER_THAN", "IN"]>;
        value: z.ZodAny;
        targetPageId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        ruleId: string;
        operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
        targetPageId: string;
        value?: any;
    }, {
        ruleId: string;
        operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
        targetPageId: string;
        value?: any;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "NUMERIC" | "DATE" | "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT";
    prompt: Record<string, string>;
    questionId: string;
    options?: {
        optionId: string;
        label: Record<string, string>;
        scoreValue?: number | undefined;
    }[] | undefined;
    groupId?: string | undefined;
    isMandatory?: boolean | undefined;
    logicRules?: {
        ruleId: string;
        operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
        targetPageId: string;
        value?: any;
    }[] | undefined;
}, {
    type: "NUMERIC" | "DATE" | "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT";
    prompt: Record<string, string>;
    questionId: string;
    options?: {
        optionId: string;
        label: Record<string, string>;
        scoreValue?: number | undefined;
    }[] | undefined;
    groupId?: string | undefined;
    isMandatory?: boolean | undefined;
    logicRules?: {
        ruleId: string;
        operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
        targetPageId: string;
        value?: any;
    }[] | undefined;
}>, {
    type: "NUMERIC" | "DATE" | "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT";
    prompt: Record<string, string>;
    questionId: string;
    options?: {
        optionId: string;
        label: Record<string, string>;
        scoreValue?: number | undefined;
    }[] | undefined;
    groupId?: string | undefined;
    isMandatory?: boolean | undefined;
    logicRules?: {
        ruleId: string;
        operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
        targetPageId: string;
        value?: any;
    }[] | undefined;
}, {
    type: "NUMERIC" | "DATE" | "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT";
    prompt: Record<string, string>;
    questionId: string;
    options?: {
        optionId: string;
        label: Record<string, string>;
        scoreValue?: number | undefined;
    }[] | undefined;
    groupId?: string | undefined;
    isMandatory?: boolean | undefined;
    logicRules?: {
        ruleId: string;
        operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
        targetPageId: string;
        value?: any;
    }[] | undefined;
}>;
export declare const SectionSchema: z.ZodObject<{
    sectionId: z.ZodString;
    title: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    sectionOrder: z.ZodOptional<z.ZodNumber>;
    questions: z.ZodDefault<z.ZodArray<z.ZodEffects<z.ZodObject<{
        questionId: z.ZodString;
        type: z.ZodEnum<["LIKERT", "NPS", "MATRIX", "SINGLE_CHOICE", "MULTIPLE_CHOICE", "RANKING", "SHORT_TEXT", "LONG_TEXT", "NUMERIC", "DATE"]>;
        groupId: z.ZodOptional<z.ZodString>;
        prompt: z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodString>, Record<string, string>, Record<string, string>>;
        isMandatory: z.ZodOptional<z.ZodBoolean>;
        options: z.ZodOptional<z.ZodArray<z.ZodObject<{
            optionId: z.ZodString;
            label: z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodString>, Record<string, string>, Record<string, string>>;
            scoreValue: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            optionId: string;
            label: Record<string, string>;
            scoreValue?: number | undefined;
        }, {
            optionId: string;
            label: Record<string, string>;
            scoreValue?: number | undefined;
        }>, "many">>;
        logicRules: z.ZodOptional<z.ZodArray<z.ZodObject<{
            ruleId: z.ZodString;
            operator: z.ZodEnum<["EQUALS", "NOT_EQUALS", "LESS_THAN", "GREATER_THAN", "IN"]>;
            value: z.ZodAny;
            targetPageId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            ruleId: string;
            operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
            targetPageId: string;
            value?: any;
        }, {
            ruleId: string;
            operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
            targetPageId: string;
            value?: any;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        type: "NUMERIC" | "DATE" | "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT";
        prompt: Record<string, string>;
        questionId: string;
        options?: {
            optionId: string;
            label: Record<string, string>;
            scoreValue?: number | undefined;
        }[] | undefined;
        groupId?: string | undefined;
        isMandatory?: boolean | undefined;
        logicRules?: {
            ruleId: string;
            operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
            targetPageId: string;
            value?: any;
        }[] | undefined;
    }, {
        type: "NUMERIC" | "DATE" | "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT";
        prompt: Record<string, string>;
        questionId: string;
        options?: {
            optionId: string;
            label: Record<string, string>;
            scoreValue?: number | undefined;
        }[] | undefined;
        groupId?: string | undefined;
        isMandatory?: boolean | undefined;
        logicRules?: {
            ruleId: string;
            operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
            targetPageId: string;
            value?: any;
        }[] | undefined;
    }>, {
        type: "NUMERIC" | "DATE" | "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT";
        prompt: Record<string, string>;
        questionId: string;
        options?: {
            optionId: string;
            label: Record<string, string>;
            scoreValue?: number | undefined;
        }[] | undefined;
        groupId?: string | undefined;
        isMandatory?: boolean | undefined;
        logicRules?: {
            ruleId: string;
            operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
            targetPageId: string;
            value?: any;
        }[] | undefined;
    }, {
        type: "NUMERIC" | "DATE" | "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT";
        prompt: Record<string, string>;
        questionId: string;
        options?: {
            optionId: string;
            label: Record<string, string>;
            scoreValue?: number | undefined;
        }[] | undefined;
        groupId?: string | undefined;
        isMandatory?: boolean | undefined;
        logicRules?: {
            ruleId: string;
            operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
            targetPageId: string;
            value?: any;
        }[] | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    sectionId: string;
    questions: {
        type: "NUMERIC" | "DATE" | "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT";
        prompt: Record<string, string>;
        questionId: string;
        options?: {
            optionId: string;
            label: Record<string, string>;
            scoreValue?: number | undefined;
        }[] | undefined;
        groupId?: string | undefined;
        isMandatory?: boolean | undefined;
        logicRules?: {
            ruleId: string;
            operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
            targetPageId: string;
            value?: any;
        }[] | undefined;
    }[];
    title?: Record<string, string> | undefined;
    sectionOrder?: number | undefined;
}, {
    sectionId: string;
    title?: Record<string, string> | undefined;
    sectionOrder?: number | undefined;
    questions?: {
        type: "NUMERIC" | "DATE" | "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT";
        prompt: Record<string, string>;
        questionId: string;
        options?: {
            optionId: string;
            label: Record<string, string>;
            scoreValue?: number | undefined;
        }[] | undefined;
        groupId?: string | undefined;
        isMandatory?: boolean | undefined;
        logicRules?: {
            ruleId: string;
            operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
            targetPageId: string;
            value?: any;
        }[] | undefined;
    }[] | undefined;
}>;
export declare const PageSchema: z.ZodObject<{
    pageId: z.ZodString;
    title: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    pageOrder: z.ZodNumber;
    sections: z.ZodDefault<z.ZodArray<z.ZodObject<{
        sectionId: z.ZodString;
        title: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        sectionOrder: z.ZodOptional<z.ZodNumber>;
        questions: z.ZodDefault<z.ZodArray<z.ZodEffects<z.ZodObject<{
            questionId: z.ZodString;
            type: z.ZodEnum<["LIKERT", "NPS", "MATRIX", "SINGLE_CHOICE", "MULTIPLE_CHOICE", "RANKING", "SHORT_TEXT", "LONG_TEXT", "NUMERIC", "DATE"]>;
            groupId: z.ZodOptional<z.ZodString>;
            prompt: z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodString>, Record<string, string>, Record<string, string>>;
            isMandatory: z.ZodOptional<z.ZodBoolean>;
            options: z.ZodOptional<z.ZodArray<z.ZodObject<{
                optionId: z.ZodString;
                label: z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodString>, Record<string, string>, Record<string, string>>;
                scoreValue: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                optionId: string;
                label: Record<string, string>;
                scoreValue?: number | undefined;
            }, {
                optionId: string;
                label: Record<string, string>;
                scoreValue?: number | undefined;
            }>, "many">>;
            logicRules: z.ZodOptional<z.ZodArray<z.ZodObject<{
                ruleId: z.ZodString;
                operator: z.ZodEnum<["EQUALS", "NOT_EQUALS", "LESS_THAN", "GREATER_THAN", "IN"]>;
                value: z.ZodAny;
                targetPageId: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                ruleId: string;
                operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
                targetPageId: string;
                value?: any;
            }, {
                ruleId: string;
                operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
                targetPageId: string;
                value?: any;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            type: "NUMERIC" | "DATE" | "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT";
            prompt: Record<string, string>;
            questionId: string;
            options?: {
                optionId: string;
                label: Record<string, string>;
                scoreValue?: number | undefined;
            }[] | undefined;
            groupId?: string | undefined;
            isMandatory?: boolean | undefined;
            logicRules?: {
                ruleId: string;
                operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
                targetPageId: string;
                value?: any;
            }[] | undefined;
        }, {
            type: "NUMERIC" | "DATE" | "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT";
            prompt: Record<string, string>;
            questionId: string;
            options?: {
                optionId: string;
                label: Record<string, string>;
                scoreValue?: number | undefined;
            }[] | undefined;
            groupId?: string | undefined;
            isMandatory?: boolean | undefined;
            logicRules?: {
                ruleId: string;
                operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
                targetPageId: string;
                value?: any;
            }[] | undefined;
        }>, {
            type: "NUMERIC" | "DATE" | "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT";
            prompt: Record<string, string>;
            questionId: string;
            options?: {
                optionId: string;
                label: Record<string, string>;
                scoreValue?: number | undefined;
            }[] | undefined;
            groupId?: string | undefined;
            isMandatory?: boolean | undefined;
            logicRules?: {
                ruleId: string;
                operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
                targetPageId: string;
                value?: any;
            }[] | undefined;
        }, {
            type: "NUMERIC" | "DATE" | "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT";
            prompt: Record<string, string>;
            questionId: string;
            options?: {
                optionId: string;
                label: Record<string, string>;
                scoreValue?: number | undefined;
            }[] | undefined;
            groupId?: string | undefined;
            isMandatory?: boolean | undefined;
            logicRules?: {
                ruleId: string;
                operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
                targetPageId: string;
                value?: any;
            }[] | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        sectionId: string;
        questions: {
            type: "NUMERIC" | "DATE" | "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT";
            prompt: Record<string, string>;
            questionId: string;
            options?: {
                optionId: string;
                label: Record<string, string>;
                scoreValue?: number | undefined;
            }[] | undefined;
            groupId?: string | undefined;
            isMandatory?: boolean | undefined;
            logicRules?: {
                ruleId: string;
                operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
                targetPageId: string;
                value?: any;
            }[] | undefined;
        }[];
        title?: Record<string, string> | undefined;
        sectionOrder?: number | undefined;
    }, {
        sectionId: string;
        title?: Record<string, string> | undefined;
        sectionOrder?: number | undefined;
        questions?: {
            type: "NUMERIC" | "DATE" | "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT";
            prompt: Record<string, string>;
            questionId: string;
            options?: {
                optionId: string;
                label: Record<string, string>;
                scoreValue?: number | undefined;
            }[] | undefined;
            groupId?: string | undefined;
            isMandatory?: boolean | undefined;
            logicRules?: {
                ruleId: string;
                operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
                targetPageId: string;
                value?: any;
            }[] | undefined;
        }[] | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    pageId: string;
    pageOrder: number;
    sections: {
        sectionId: string;
        questions: {
            type: "NUMERIC" | "DATE" | "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT";
            prompt: Record<string, string>;
            questionId: string;
            options?: {
                optionId: string;
                label: Record<string, string>;
                scoreValue?: number | undefined;
            }[] | undefined;
            groupId?: string | undefined;
            isMandatory?: boolean | undefined;
            logicRules?: {
                ruleId: string;
                operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
                targetPageId: string;
                value?: any;
            }[] | undefined;
        }[];
        title?: Record<string, string> | undefined;
        sectionOrder?: number | undefined;
    }[];
    title?: Record<string, string> | undefined;
}, {
    pageId: string;
    pageOrder: number;
    title?: Record<string, string> | undefined;
    sections?: {
        sectionId: string;
        title?: Record<string, string> | undefined;
        sectionOrder?: number | undefined;
        questions?: {
            type: "NUMERIC" | "DATE" | "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT";
            prompt: Record<string, string>;
            questionId: string;
            options?: {
                optionId: string;
                label: Record<string, string>;
                scoreValue?: number | undefined;
            }[] | undefined;
            groupId?: string | undefined;
            isMandatory?: boolean | undefined;
            logicRules?: {
                ruleId: string;
                operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
                targetPageId: string;
                value?: any;
            }[] | undefined;
        }[] | undefined;
    }[] | undefined;
}>;
export declare const SaveSurveyDraftSchema: z.ZodObject<{
    projectId: z.ZodString;
    surveyId: z.ZodString;
    version: z.ZodOptional<z.ZodNumber>;
    title: z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodString>, Record<string, string>, Record<string, string>>;
    description: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    pages: z.ZodDefault<z.ZodArray<z.ZodObject<{
        pageId: z.ZodString;
        title: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        pageOrder: z.ZodNumber;
        sections: z.ZodDefault<z.ZodArray<z.ZodObject<{
            sectionId: z.ZodString;
            title: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            sectionOrder: z.ZodOptional<z.ZodNumber>;
            questions: z.ZodDefault<z.ZodArray<z.ZodEffects<z.ZodObject<{
                questionId: z.ZodString;
                type: z.ZodEnum<["LIKERT", "NPS", "MATRIX", "SINGLE_CHOICE", "MULTIPLE_CHOICE", "RANKING", "SHORT_TEXT", "LONG_TEXT", "NUMERIC", "DATE"]>;
                groupId: z.ZodOptional<z.ZodString>;
                prompt: z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodString>, Record<string, string>, Record<string, string>>;
                isMandatory: z.ZodOptional<z.ZodBoolean>;
                options: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    optionId: z.ZodString;
                    label: z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodString>, Record<string, string>, Record<string, string>>;
                    scoreValue: z.ZodOptional<z.ZodNumber>;
                }, "strip", z.ZodTypeAny, {
                    optionId: string;
                    label: Record<string, string>;
                    scoreValue?: number | undefined;
                }, {
                    optionId: string;
                    label: Record<string, string>;
                    scoreValue?: number | undefined;
                }>, "many">>;
                logicRules: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    ruleId: z.ZodString;
                    operator: z.ZodEnum<["EQUALS", "NOT_EQUALS", "LESS_THAN", "GREATER_THAN", "IN"]>;
                    value: z.ZodAny;
                    targetPageId: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    ruleId: string;
                    operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
                    targetPageId: string;
                    value?: any;
                }, {
                    ruleId: string;
                    operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
                    targetPageId: string;
                    value?: any;
                }>, "many">>;
            }, "strip", z.ZodTypeAny, {
                type: "NUMERIC" | "DATE" | "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT";
                prompt: Record<string, string>;
                questionId: string;
                options?: {
                    optionId: string;
                    label: Record<string, string>;
                    scoreValue?: number | undefined;
                }[] | undefined;
                groupId?: string | undefined;
                isMandatory?: boolean | undefined;
                logicRules?: {
                    ruleId: string;
                    operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
                    targetPageId: string;
                    value?: any;
                }[] | undefined;
            }, {
                type: "NUMERIC" | "DATE" | "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT";
                prompt: Record<string, string>;
                questionId: string;
                options?: {
                    optionId: string;
                    label: Record<string, string>;
                    scoreValue?: number | undefined;
                }[] | undefined;
                groupId?: string | undefined;
                isMandatory?: boolean | undefined;
                logicRules?: {
                    ruleId: string;
                    operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
                    targetPageId: string;
                    value?: any;
                }[] | undefined;
            }>, {
                type: "NUMERIC" | "DATE" | "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT";
                prompt: Record<string, string>;
                questionId: string;
                options?: {
                    optionId: string;
                    label: Record<string, string>;
                    scoreValue?: number | undefined;
                }[] | undefined;
                groupId?: string | undefined;
                isMandatory?: boolean | undefined;
                logicRules?: {
                    ruleId: string;
                    operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
                    targetPageId: string;
                    value?: any;
                }[] | undefined;
            }, {
                type: "NUMERIC" | "DATE" | "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT";
                prompt: Record<string, string>;
                questionId: string;
                options?: {
                    optionId: string;
                    label: Record<string, string>;
                    scoreValue?: number | undefined;
                }[] | undefined;
                groupId?: string | undefined;
                isMandatory?: boolean | undefined;
                logicRules?: {
                    ruleId: string;
                    operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
                    targetPageId: string;
                    value?: any;
                }[] | undefined;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            sectionId: string;
            questions: {
                type: "NUMERIC" | "DATE" | "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT";
                prompt: Record<string, string>;
                questionId: string;
                options?: {
                    optionId: string;
                    label: Record<string, string>;
                    scoreValue?: number | undefined;
                }[] | undefined;
                groupId?: string | undefined;
                isMandatory?: boolean | undefined;
                logicRules?: {
                    ruleId: string;
                    operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
                    targetPageId: string;
                    value?: any;
                }[] | undefined;
            }[];
            title?: Record<string, string> | undefined;
            sectionOrder?: number | undefined;
        }, {
            sectionId: string;
            title?: Record<string, string> | undefined;
            sectionOrder?: number | undefined;
            questions?: {
                type: "NUMERIC" | "DATE" | "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT";
                prompt: Record<string, string>;
                questionId: string;
                options?: {
                    optionId: string;
                    label: Record<string, string>;
                    scoreValue?: number | undefined;
                }[] | undefined;
                groupId?: string | undefined;
                isMandatory?: boolean | undefined;
                logicRules?: {
                    ruleId: string;
                    operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
                    targetPageId: string;
                    value?: any;
                }[] | undefined;
            }[] | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        pageId: string;
        pageOrder: number;
        sections: {
            sectionId: string;
            questions: {
                type: "NUMERIC" | "DATE" | "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT";
                prompt: Record<string, string>;
                questionId: string;
                options?: {
                    optionId: string;
                    label: Record<string, string>;
                    scoreValue?: number | undefined;
                }[] | undefined;
                groupId?: string | undefined;
                isMandatory?: boolean | undefined;
                logicRules?: {
                    ruleId: string;
                    operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
                    targetPageId: string;
                    value?: any;
                }[] | undefined;
            }[];
            title?: Record<string, string> | undefined;
            sectionOrder?: number | undefined;
        }[];
        title?: Record<string, string> | undefined;
    }, {
        pageId: string;
        pageOrder: number;
        title?: Record<string, string> | undefined;
        sections?: {
            sectionId: string;
            title?: Record<string, string> | undefined;
            sectionOrder?: number | undefined;
            questions?: {
                type: "NUMERIC" | "DATE" | "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT";
                prompt: Record<string, string>;
                questionId: string;
                options?: {
                    optionId: string;
                    label: Record<string, string>;
                    scoreValue?: number | undefined;
                }[] | undefined;
                groupId?: string | undefined;
                isMandatory?: boolean | undefined;
                logicRules?: {
                    ruleId: string;
                    operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
                    targetPageId: string;
                    value?: any;
                }[] | undefined;
            }[] | undefined;
        }[] | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    surveyId: string;
    title: Record<string, string>;
    pages: {
        pageId: string;
        pageOrder: number;
        sections: {
            sectionId: string;
            questions: {
                type: "NUMERIC" | "DATE" | "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT";
                prompt: Record<string, string>;
                questionId: string;
                options?: {
                    optionId: string;
                    label: Record<string, string>;
                    scoreValue?: number | undefined;
                }[] | undefined;
                groupId?: string | undefined;
                isMandatory?: boolean | undefined;
                logicRules?: {
                    ruleId: string;
                    operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
                    targetPageId: string;
                    value?: any;
                }[] | undefined;
            }[];
            title?: Record<string, string> | undefined;
            sectionOrder?: number | undefined;
        }[];
        title?: Record<string, string> | undefined;
    }[];
    version?: number | undefined;
    description?: Record<string, string> | undefined;
}, {
    projectId: string;
    surveyId: string;
    title: Record<string, string>;
    version?: number | undefined;
    description?: Record<string, string> | undefined;
    pages?: {
        pageId: string;
        pageOrder: number;
        title?: Record<string, string> | undefined;
        sections?: {
            sectionId: string;
            title?: Record<string, string> | undefined;
            sectionOrder?: number | undefined;
            questions?: {
                type: "NUMERIC" | "DATE" | "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT";
                prompt: Record<string, string>;
                questionId: string;
                options?: {
                    optionId: string;
                    label: Record<string, string>;
                    scoreValue?: number | undefined;
                }[] | undefined;
                groupId?: string | undefined;
                isMandatory?: boolean | undefined;
                logicRules?: {
                    ruleId: string;
                    operator: "IN" | "EQUALS" | "NOT_EQUALS" | "LESS_THAN" | "GREATER_THAN";
                    targetPageId: string;
                    value?: any;
                }[] | undefined;
            }[] | undefined;
        }[] | undefined;
    }[] | undefined;
}>;
export declare const QuestionLibrarySchema: z.ZodObject<{
    projectId: z.ZodString;
    libraryItemId: z.ZodString;
    category: z.ZodString;
    groupId: z.ZodString;
    type: z.ZodEnum<["LIKERT", "NPS", "MATRIX", "SINGLE_CHOICE", "MULTIPLE_CHOICE", "RANKING", "SHORT_TEXT", "LONG_TEXT", "NUMERIC", "DATE"]>;
    prompt: z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodString>, Record<string, string>, Record<string, string>>;
    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
        optionId: z.ZodString;
        label: z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodString>, Record<string, string>, Record<string, string>>;
        scoreValue: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        optionId: string;
        label: Record<string, string>;
        scoreValue?: number | undefined;
    }, {
        optionId: string;
        label: Record<string, string>;
        scoreValue?: number | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    type: "NUMERIC" | "DATE" | "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT";
    libraryItemId: string;
    category: string;
    groupId: string;
    prompt: Record<string, string>;
    options?: {
        optionId: string;
        label: Record<string, string>;
        scoreValue?: number | undefined;
    }[] | undefined;
}, {
    projectId: string;
    type: "NUMERIC" | "DATE" | "LIKERT" | "NPS" | "MATRIX" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RANKING" | "SHORT_TEXT" | "LONG_TEXT";
    libraryItemId: string;
    category: string;
    groupId: string;
    prompt: Record<string, string>;
    options?: {
        optionId: string;
        label: Record<string, string>;
        scoreValue?: number | undefined;
    }[] | undefined;
}>;
