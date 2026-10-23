import { MongoUserRepository } from '../../infrastructure/persistence/mongo-user.repository';
import { BcryptHasherService } from '../../infrastructure/services/bcrypt-hasher.service';
import { IdentifierResolverService } from '../../infrastructure/services/identifier-resolver.service';
import { UserRole } from '../../../../shared/presentation/middleware/auth.middleware';
export interface ILoginRequest {
    identifier?: string;
    email?: string;
    password?: string;
    role?: any;
    projectId?: string;
}
export interface ILoginResponse {
    token: string;
    mustChangePassword: boolean;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        projectId: string;
        authorizedProjectIds: string[];
        firmId?: string;
        mustChangePassword: boolean;
        employeeId?: string;
        phoneNumber?: string;
    };
}
export declare class LoginUseCase {
    private readonly userRepository;
    private readonly hasher;
    private readonly resolver;
    constructor(userRepository?: MongoUserRepository, hasher?: BcryptHasherService, resolver?: IdentifierResolverService);
    execute(request: ILoginRequest): Promise<ILoginResponse>;
}
