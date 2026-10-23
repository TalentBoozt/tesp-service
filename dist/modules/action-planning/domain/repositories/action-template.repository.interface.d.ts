import { ActionTemplateEntity } from '../entities/action-template.entity';
export interface IActionTemplateRepository {
    save(template: ActionTemplateEntity): Promise<ActionTemplateEntity>;
    findByGroupId(groupId: string): Promise<ActionTemplateEntity[]>;
    findAll(): Promise<ActionTemplateEntity[]>;
}
