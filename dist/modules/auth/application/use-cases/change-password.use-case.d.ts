import { MongoUserRepository } from '../../infrastructure/persistence/mongo-user.repository';
import { BcryptHasherService } from '../../infrastructure/services/bcrypt-hasher.service';
export interface IChangePasswordRequest {
    userId: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    projectId?: string;
}
export interface IChangePasswordResponse {
    success: boolean;
    message: string;
    token: string;
    mustChangePassword: boolean;
}
export declare class ChangePasswordUseCase {
    private readonly userRepository;
    private readonly hasher;
    static PASSWORD_COMPLEXITY_REGEX: RegExp;
    constructor(userRepository?: MongoUserRepository, hasher?: BcryptHasherService);
    execute(request: IChangePasswordRequest): Promise<IChangePasswordResponse>;
}
