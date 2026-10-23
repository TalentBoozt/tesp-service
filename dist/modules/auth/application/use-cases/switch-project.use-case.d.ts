import { MongoUserRepository } from '../../infrastructure/persistence/mongo-user.repository';
import { UserRole } from '../../../../shared/presentation/middleware/auth.middleware';
export interface ISwitchProjectRequest {
    userId: string;
    targetProjectId: string;
}
export interface ISwitchProjectResponse {
    token: string;
    projectId: string;
    user: {
        id: string;
        email: string;
        role: UserRole;
        projectId: string;
    };
}
export declare class SwitchProjectUseCase {
    private readonly userRepository;
    constructor(userRepository?: MongoUserRepository);
    execute(request: ISwitchProjectRequest): Promise<ISwitchProjectResponse>;
}
