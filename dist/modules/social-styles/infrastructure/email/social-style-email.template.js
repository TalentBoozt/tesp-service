"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSocialStyleInvitationEmailHtml = buildSocialStyleInvitationEmailHtml;
exports.dispatchSocialStyleInvitationEmail = dispatchSocialStyleInvitationEmail;
const email_gateway_service_1 = require("../../../../shared/infrastructure/email/email-gateway.service");
const EMAIL_COPY = {
    en: {
        subjectPrefix: 'Invitation: Social Styles Questionnaire',
        greeting: (name) => `Hello ${name},`,
        intro: (title, consultant, org) => `You have been invited by ${consultant}${org ? ` (${org})` : ''} to complete the 20-question "${title}" workplace communication style questionnaire.`,
        instructionsNote: 'The questionnaire takes approximately 5–8 minutes to complete and is available in English, Sinhala (සිංහල), and Tamil (தமிழ்). You can switch languages at any time while answering.',
        ctaButton: 'Start Social Styles Questionnaire',
        directLinkLabel: 'Or copy and open your personal assessment link:',
        expiryLabel: (dateStr) => `Please complete before: ${dateStr}`,
        footerNote: 'This personal link is unique to you. Once submitted, your consultant will review and share your workplace Social Styles profile.',
    },
    si: {
        subjectPrefix: 'ආරාධනාව: සමාජ ශෛලීන් ප්‍රශ්නාවලිය (Social Styles Questionnaire)',
        greeting: (name) => `ආයුබෝවන් ${name},`,
        intro: (title, consultant, org) => `${consultant}${org ? ` (${org})` : ''} විසින් ප්‍රශ්න 20 කින් සමන්විත "${title}" සමාජ ශෛලීන් ප්‍රශ්නාවලිය සම්පූර්ණ කිරීම සඳහා ඔබට ආරාධනා කර ඇත.`,
        instructionsNote: 'මෙම ප්‍රශ්නාවලිය සම්පූර්ණ කිරීමට විනාඩි 5–8 ක් පමණ ගත වන අතර සිංහල, ඉංග්‍රීසි සහ දෙමළ යන භාෂා තුනෙන්ම පිළිතුරු සැපයිය හැකිය.',
        ctaButton: 'ප්‍රශ්නාවලිය ආරම්භ කරන්න (Start Questionnaire)',
        directLinkLabel: 'නැතහොත් ඔබගේ පුද්ගලික සබැඳිය පිටපත් කර විවෘත කරන්න:',
        expiryLabel: (dateStr) => `කල් ඉකුත් වන දිනය: ${dateStr}`,
        footerNote: 'මෙම සබැඳිය ඔබට පමණක් වෙන්වූවකි. ඔබ පිළිතුරු යොමු කළ පසු ඔබගේ උපදේශකවරයා විසින් ප්‍රතිඵල වාර්තාව සමාලෝචනය කරනු ඇත.',
    },
    ta: {
        subjectPrefix: 'அழைப்பு: சமூக பாணிகள் வினாத்தாள் (Social Styles Questionnaire)',
        greeting: (name) => `வணக்கம் ${name},`,
        intro: (title, consultant, org) => `${consultant}${org ? ` (${org})` : ''} உங்களை 20 வினாக்கள் கொண்ட "${title}" சமூக பாணிகள் வினாத்தாளை நிறைவு செய்ய அழைத்துள்ளார்.`,
        instructionsNote: 'இவ்வினாத்தாளை நிறைவு செய்ய சுமார் 5–8 நிமிடங்கள் ஆகும். தமிழ், ஆங்கிலம் மற்றும் சிங்களம் ஆகிய மொழிகளில் பதிலளிக்கலாம்.',
        ctaButton: 'வினாத்தாளைத் தொடங்குக (Start Questionnaire)',
        directLinkLabel: 'அல்லது உங்கள் தனிப்பட்ட இணைப்பை நகலெடுத்துத் திறக்கவும்:',
        expiryLabel: (dateStr) => `காலாவதியாகும் தேதி: ${dateStr}`,
        footerNote: 'இந்த இணைப்பு உங்களுக்கானது மட்டுமே. நீங்கள் சமர்ப்பித்தவுடன் உங்கள் ஆலோசகர் முடிவுகளை மதிப்பாய்வு செய்வார்.',
    },
};
function buildSocialStyleInvitationEmailHtml(payload) {
    const lang = payload.language || 'en';
    const copy = EMAIL_COPY[lang] || EMAIL_COPY.en;
    const subject = `${copy.subjectPrefix} — ${payload.title}`;
    const expiryHtml = payload.tokenExpiresAt
        ? `<p style="font-size: 12px; color: #b45309; background: #fffbeb; border: 1px solid #fde68a; padding: 8px 12px; border-radius: 8px; margin: 16px 0;">
         <strong>${copy.expiryLabel(payload.tokenExpiresAt.toUTCString())}</strong>
       </p>`
        : '';
    const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; color: #0f172a;">
      <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9;">
        <span style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; padding: 4px 10px; border-radius: 999px;">
          ${payload.firmName || 'DAASH Global · Talnova TESP'}
        </span>
        <h2 style="margin: 12px 0 4px 0; font-size: 20px; font-weight: 800; color: #0f172a;">
          ${payload.title}
        </h2>
        <p style="margin: 0; font-size: 12px; color: #64748b;">
          Ref: ${payload.assessmentId}${payload.organizationName ? ` &bull; ${payload.organizationName}` : ''}
        </p>
      </div>

      <p style="font-size: 15px; font-weight: 600; color: #0f172a; margin-top: 0;">
        ${copy.greeting(payload.participantName)}
      </p>

      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        ${copy.intro(payload.title, payload.consultantName, payload.organizationName)}
      </p>

      <p style="font-size: 13px; line-height: 1.6; color: #475569; background: #f8fafc; padding: 12px 14px; border-radius: 10px; border: 1px solid #e2e8f0;">
        ${copy.instructionsNote}
      </p>

      ${expiryHtml}

      <div style="margin: 26px 0; text-align: center;">
        <a href="${payload.publicUrl}" style="background-color: #0f172a; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 999px; font-weight: 700; font-size: 14px; display: inline-block;">
          ${copy.ctaButton}
        </a>
      </div>

      <div style="margin-top: 20px; padding: 12px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">
          ${copy.directLinkLabel}
        </p>
        <p style="margin: 0; font-family: monospace; font-size: 11px; color: #0f172a; word-break: break-all;">
          ${payload.publicUrl}
        </p>
      </div>

      <p style="font-size: 12px; line-height: 1.5; color: #64748b; margin-top: 20px; margin-bottom: 0;">
        ${copy.footerNote}
      </p>
    </div>
  `;
    return { subject, htmlBody };
}
async function dispatchSocialStyleInvitationEmail(payload) {
    try {
        const { subject, htmlBody } = buildSocialStyleInvitationEmailHtml(payload);
        const result = await email_gateway_service_1.emailGatewayService.dispatch({
            projectId: payload.projectId || 'PRJ-TAL001',
            to: [{ email: payload.participantEmail, name: payload.participantName }],
            subject,
            htmlBody,
        });
        return {
            sent: Boolean(result.success),
            provider: result.provider,
            error: result.error,
        };
    }
    catch (err) {
        return {
            sent: false,
            provider: 'ERROR',
            error: err?.message || 'Failed to dispatch invitation email',
        };
    }
}
//# sourceMappingURL=social-style-email.template.js.map