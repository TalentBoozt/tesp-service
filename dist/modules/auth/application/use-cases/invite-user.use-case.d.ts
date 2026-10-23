import { MongoUserRepository } from '../../infrastructure/persistence/mongo-user.repository';
import { BcryptHasherService } from '../../infrastructure/services/bcrypt-hasher.service';
import { UserRole } from '../../../../shared/presentation/middleware/auth.middleware';
export interface IInviteUserRequest {
    inviterRole: UserRole;
    inviterProjectId?: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string | UserRole;
    projectId: string;
    firmId?: string;
}
export declare class InviteUserUseCase {
    private readonly userRepository;
    private readonly hasher;
    constructor(userRepository?: MongoUserRepository, hasher?: BcryptHasherService);
    execute(req: IInviteUserRequest): Promise<{
        success: boolean;
        user: any;
        inviteToken: string;
    }>;
}
