import { AnswerValueObject, AnswerProps } from '../entities/answer.value-object';
export declare class PiiScrubberService {
    private static EMAIL_REGEX;
    private static PHONE_REGEX;
    sanitizeText(text?: string): string | undefined;
    sanitizeAnswers(answers: AnswerProps[]): AnswerValueObject[];
}
