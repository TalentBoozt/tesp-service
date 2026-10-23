import { BcryptHasherService } from './bcrypt-hasher.service';
import { MongoUserRepository } from '../persistence/mongo-user.repository';
import { UserRole } from '../../../../shared/presentation/middleware/auth.middleware';
export interface ISeedUserConfig {
    userId: string;
    email: string;
    plainPassword: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    firmId?: string;
    authorizedProjectIds: string[];
    primaryProjectId: string;
    mustChangePassword?: boolean;
}
export declare const DEFAULT_PRODUCTION_SEED_USERS: ISeedUserConfig[];
export declare class AuthSeederService {
    private readonly userRepository;
    private readonly hasher;
    constructor(userRepository?: MongoUserRepository, hasher?: BcryptHasherService);
    seedDefaultUsers(forceOverwrite?: boolean): Promise<void>;
    ensureDefaultUsersExist(): Promise<void>;
}
