import { MongoConsultingFirmRepository } from '../persistence/mongoose/mongo-consulting-firm.repository';
export declare class ConsultingFirmSeederService {
    private readonly repo;
    constructor(repo?: MongoConsultingFirmRepository);
    seedDefaultFirms(forceOverwrite?: boolean): Promise<void>;
    ensureDefaultFirmsExist(): Promise<void>;
}
