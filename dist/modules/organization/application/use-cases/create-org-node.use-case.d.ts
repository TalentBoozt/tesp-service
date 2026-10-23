import { IOrgNodeRepository } from '../../domain/repositories/org-node.repository.interface';
import { OrgNodeEntity, IOrgNodeProps } from '../../domain/entities/org-node.entity';
import { DomainEventBus } from '../../../../shared/domain/events/event-bus';
export declare class CreateOrgNodeUseCase {
    private repository;
    private eventBus;
    constructor(repository: IOrgNodeRepository, eventBus?: DomainEventBus);
    execute(props: Omit<IOrgNodeProps, 'path' | 'depth'>, actorContext?: {
        actorId: string;
        actorRole: string;
    }): Promise<OrgNodeEntity>;
}
