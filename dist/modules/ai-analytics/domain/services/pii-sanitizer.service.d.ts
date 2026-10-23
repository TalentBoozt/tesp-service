export declare class PiiSanitizerService {
    private emailRegex;
    private phoneRegex;
    private nameRegex;
    sanitize(text: string): {
        sanitizedText: string;
        emailCount: number;
        phoneCount: number;
        nameCount: number;
    };
    assertZeroPii(text: string): void;
}
