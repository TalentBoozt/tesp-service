export declare class BcryptHasherService {
    private readonly saltRounds;
    constructor(saltRounds?: number);
    hashPassword(password: string): Promise<string>;
    verifyPassword(password: string, hash: string): Promise<boolean>;
}
