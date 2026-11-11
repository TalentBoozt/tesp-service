import { SupportedSocialStyleLanguage } from '../../domain/constants/answer-key-v1.definition';
export interface SocialStyleInvitationEmailPayload {
    projectId?: string;
    participantName: string;
    participantEmail: string;
    assessmentId: string;
    title: string;
    organizationName?: string;
    consultantName: string;
    firmName?: string;
    language: SupportedSocialStyleLanguage;
    publicUrl: string;
    tokenExpiresAt?: Date | null;
}
export declare function buildSocialStyleInvitationEmailHtml(payload: SocialStyleInvitationEmailPayload): {
    subject: string;
    htmlBody: string;
};
export declare function dispatchSocialStyleInvitationEmail(payload: SocialStyleInvitationEmailPayload): Promise<{
    sent: boolean;
    provider: string;
    error?: string;
}>;
