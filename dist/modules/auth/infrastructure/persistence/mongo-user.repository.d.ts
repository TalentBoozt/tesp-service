import { UserEntity } from '../../domain/entities/user.entity';
export declare class MongoUserRepository {
    private mapDocumentToEntity;
    findByEmail(email: string): Promise<UserEntity | null>;
    findById(userId: string): Promise<UserEntity | null>;
    findByEmployeeId(employeeId: string, projectId?: string): Promise<UserEntity | null>;
    findByPhoneNumber(phoneNumber: string): Promise<UserEntity | null>;
    findByResetToken(token: string): Promise<UserEntity | null>;
    save(user: UserEntity): Promise<void>;
    count(): Promise<number>;
}
