import { MongoUserRepository } from '../../infrastructure/persistence/mongo-user.repository';
import { BcryptHasherService } from '../../infrastructure/services/bcrypt-hasher.service';
export declare class PasswordRecoveryUseCase {
    private readonly userRepository;
    private readonly hasher;
    constructor(userRepository?: MongoUserRepository, hasher?: BcryptHasherService);
    requestPasswordReset(email: string): Promise<{
        success: boolean;
        message: string;
        debugResetToken?: string;
    }>;
    resetPassword(token: string, newPlainPassword: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
