import { IOrgNodeRepository } from '../../domain/repositories/org-node.repository.interface';
import { OrgNodeEntity } from '../../domain/entities/org-node.entity';
import { DomainEventBus } from '../../../../shared/domain/events/event-bus';
export declare class MoveOrgNodeUseCase {
    private repository;
    private eventBus;
    constructor(repository: IOrgNodeRepository, eventBus?: DomainEventBus);
    execute(projectId: string, nodeId: string, newParentId: string | null, actorContext?: {
        actorId: string;
        actorRole: string;
    }): Promise<OrgNodeEntity>;
}
