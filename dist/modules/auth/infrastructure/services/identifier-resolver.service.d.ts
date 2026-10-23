import { MongoUserRepository } from '../persistence/mongo-user.repository';
import { UserEntity } from '../../domain/entities/user.entity';
export type IdentifierType = 'EMAIL' | 'PHONE' | 'EMPLOYEE_ID';
export interface INormalizedIdentifier {
    type: IdentifierType;
    value: string;
}
export declare class IdentifierResolverService {
    private readonly userRepository;
    constructor(userRepository?: MongoUserRepository);
    /**
     * Normalizes and classifies an incoming raw identifier:
     * - Contains '@' -> EMAIL
     * - Phone format (starts with '+' or 9-15 numeric digits) -> PHONE
     * - Otherwise -> EMPLOYEE_ID
     */
    normalizeIdentifier(raw: string): INormalizedIdentifier;
    /**
     * Resolves a UserEntity from an identifier (email, phone, employeeId)
     * with optional tenant project scope and employee fallback lookup.
     */
    findUserByIdentifier(identifier: string, projectId?: string): Promise<UserEntity | null>;
}
