"use strict";
/**
 * Authoritative DAASH Global Social Styles Answer Key (Version v1.0)
 * Strictly internal to the scoring domain. Must NEVER be exposed on public respondent endpoints.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUESTION_OPTION_TO_STYLE_V1 = exports.ANSWER_KEY_V1_ROWS = exports.CURRENT_INTERPRETATION_VERSION = exports.CURRENT_GRAPH_VERSION = exports.CURRENT_QUESTIONNAIRE_VERSION = exports.CURRENT_SCORING_VERSION = exports.VALID_ANSWER_OPTIONS = exports.SOCIAL_STYLE_TYPES = void 0;
exports.SOCIAL_STYLE_TYPES = [
    'ANALYTICAL',
    'AMIABLE',
    'EXPRESSIVE',
    'DRIVER',
];
exports.VALID_ANSWER_OPTIONS = ['A', 'B', 'C', 'D'];
exports.CURRENT_SCORING_VERSION = 'v1.0';
exports.CURRENT_QUESTIONNAIRE_VERSION = 'v1.0';
exports.CURRENT_GRAPH_VERSION = 'v1.0-option-a';
exports.CURRENT_INTERPRETATION_VERSION = 'v1.0';
/**
 * Exact 20-question mapping from the DAASH Global Social Styles Answer Sheet (Page 2).
 * Each row maps the option letter (A, B, C, D) that awards 1 raw point to the respective style.
 */
exports.ANSWER_KEY_V1_ROWS = [
    { questionNumber: 1, analytical: 'C', amiable: 'B', expressive: 'D', driver: 'A' },
    { questionNumber: 2, analytical: 'A', amiable: 'D', expressive: 'B', driver: 'C' },
    { questionNumber: 3, analytical: 'C', amiable: 'A', expressive: 'D', driver: 'B' },
    { questionNumber: 4, analytical: 'D', amiable: 'B', expressive: 'A', driver: 'C' },
    { questionNumber: 5, analytical: 'C', amiable: 'A', expressive: 'B', driver: 'D' },
    { questionNumber: 6, analytical: 'D', amiable: 'A', expressive: 'B', driver: 'C' },
    { questionNumber: 7, analytical: 'C', amiable: 'A', expressive: 'D', driver: 'B' },
    { questionNumber: 8, analytical: 'D', amiable: 'B', expressive: 'C', driver: 'A' },
    { questionNumber: 9, analytical: 'C', amiable: 'A', expressive: 'D', driver: 'B' },
    { questionNumber: 10, analytical: 'C', amiable: 'B', expressive: 'D', driver: 'A' },
    { questionNumber: 11, analytical: 'A', amiable: 'B', expressive: 'C', driver: 'D' },
    { questionNumber: 12, analytical: 'D', amiable: 'A', expressive: 'C', driver: 'B' },
    { questionNumber: 13, analytical: 'C', amiable: 'A', expressive: 'D', driver: 'B' },
    { questionNumber: 14, analytical: 'D', amiable: 'B', expressive: 'C', driver: 'A' },
    { questionNumber: 15, analytical: 'D', amiable: 'B', expressive: 'C', driver: 'A' },
    { questionNumber: 16, analytical: 'D', amiable: 'B', expressive: 'A', driver: 'C' },
    { questionNumber: 17, analytical: 'D', amiable: 'C', expressive: 'A', driver: 'B' },
    { questionNumber: 18, analytical: 'A', amiable: 'D', expressive: 'B', driver: 'C' },
    { questionNumber: 19, analytical: 'B', amiable: 'D', expressive: 'A', driver: 'C' },
    { questionNumber: 20, analytical: 'D', amiable: 'B', expressive: 'C', driver: 'A' },
];
/**
 * Direct O(1) lookup table: QUESTION_OPTION_TO_STYLE_V1[questionNumber][optionCode] -> SocialStyleType
 */
exports.QUESTION_OPTION_TO_STYLE_V1 = exports.ANSWER_KEY_V1_ROWS.reduce((acc, row) => {
    acc[row.questionNumber] = {
        [row.analytical]: 'ANALYTICAL',
        [row.amiable]: 'AMIABLE',
        [row.expressive]: 'EXPRESSIVE',
        [row.driver]: 'DRIVER',
    };
    return acc;
}, {});
//# sourceMappingURL=answer-key-v1.definition.js.map