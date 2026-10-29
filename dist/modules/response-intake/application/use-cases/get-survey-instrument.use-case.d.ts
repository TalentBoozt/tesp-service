import { ISurveyRepository } from '../../../survey/domain/repositories/survey.repository.interface';
import { ISurveyCampaignRepository } from '../../../survey-distribution/domain/repositories/campaign.repository.interface';
import { ValidateAndBurnTokenUseCase } from '../../../survey-distribution/application/use-cases/validate-and-burn-token.use-case';
export interface GetSurveyInstrumentParams {
    token?: string;
    campaignId?: string;
    projectId?: string;
}
export interface SurveyInstrumentResult {
    surveyId: string;
    title: Record<string, string> | string;
    description?: Record<string, string> | string;
    version: number;
    pages: any[];
    campaignId: string;
    projectId: string;
    anonymityLevel: string;
    startDate?: string;
    expirationDate?: string;
    status: string;
}
export declare class GetSurveyInstrumentUseCase {
    private surveyRepo;
    private campaignRepo?;
    private tokenValidator?;
    constructor(surveyRepo: ISurveyRepository, campaignRepo?: ISurveyCampaignRepository | undefined, tokenValidator?: ValidateAndBurnTokenUseCase | undefined);
    execute(params: GetSurveyInstrumentParams): Promise<SurveyInstrumentResult>;
}
