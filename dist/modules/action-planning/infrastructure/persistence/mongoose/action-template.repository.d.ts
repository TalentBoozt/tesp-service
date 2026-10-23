import { IActionTemplateRepository } from '../../../domain/repositories/action-template.repository.interface';
import { ActionTemplateEntity } from '../../../domain/entities/action-template.entity';
export declare class ActionTemplateMongoRepository implements IActionTemplateRepository {
    private toEntity;
    save(template: ActionTemplateEntity): Promise<ActionTemplateEntity>;
    findByGroupId(groupId: string): Promise<ActionTemplateEntity[]>;
    findAll(): Promise<ActionTemplateEntity[]>;
}
