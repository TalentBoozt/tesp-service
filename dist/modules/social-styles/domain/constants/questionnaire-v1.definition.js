"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUESTIONNAIRE_V1_DEFINITION = void 0;
exports.getPublicQuestionnaireView = getPublicQuestionnaireView;
exports.getQuestionOptionLabel = getQuestionOptionLabel;
const answer_key_v1_definition_1 = require("./answer-key-v1.definition");
/**
 * Version v1.0 of the 20-Question Social Styles Questionnaire.
 * - English (en) and Sinhala (si) word sets are transcribed verbatim from the DAASH Global Questionnaire sheet (Page 1).
 * - Tamil (ta) word sets provide accurate native Tamil terminology marked PENDING_CONSULTANT_REVIEW.
 */
exports.QUESTIONNAIRE_V1_DEFINITION = {
    version: answer_key_v1_definition_1.CURRENT_QUESTIONNAIRE_VERSION,
    status: 'ACTIVE',
    supportedLanguages: ['en', 'si', 'ta'],
    translationMetadata: {
        en: {
            status: 'VERIFIED_SOURCE',
            verifiedBy: 'DAASH_GLOBAL_PRINTED_QUESTIONNAIRE',
            notes: 'Original English word sets from DAASH Global Page 1.',
        },
        si: {
            status: 'VERIFIED_SOURCE',
            verifiedBy: 'DAASH_GLOBAL_PRINTED_QUESTIONNAIRE',
            notes: 'Original Sinhala word sets printed beneath English options on DAASH Global Page 1.',
        },
        ta: {
            status: 'PENDING_CONSULTANT_REVIEW',
            notes: 'Tamil localization structured for workplace communication assessment; pending final consultant review.',
        },
    },
    instructions: {
        en: 'Examine the following word sets and choose one from each set that describes you best. When you have answered all twenty, submit your responses.',
        si: 'පහත 1 - 20 දක්වා කාණ්ඩයන් වල දක්වා ඇති එක් එක් වචන ලැයිස්තු අතුරෙන් ඔබව හොඳින්ම විස්තරාත්මක අයුරින් විග්‍රහ කරන වචන ලැයිස්තුව ඉදිරියෙන් ( ✓ ) ලකුණ යොදන්න. එක් කාණ්ඩයකින් එක් ලක්ෂණයක් පමණක් තෝරා ගන්න.',
        ta: 'பின்வரும் 1 முதல் 20 வரையிலான சொல் தொகுப்புகளை ஆராய்ந்து, ஒவ்வொரு தொகுப்பிலும் உங்களை மிகச் சிறப்பாக விவரிக்கும் ஒரு சொல்லை மட்டும் தேர்ந்தெடுக்கவும்.',
    },
    questions: [
        {
            questionNumber: 1,
            options: [
                { code: 'A', labels: { en: 'Persuasive', si: 'ඒත්තු ගැන්විය හැක', ta: 'இணங்க வைக்கும் திறனுடைய' } },
                { code: 'B', labels: { en: 'Fearful', si: 'බියගුලු ස්වභාවයෙන් යුත්', ta: 'தயக்கம் கொண்ட' } },
                { code: 'C', labels: { en: 'Open-minded', si: 'විවෘත මනසක් සහිතයි', ta: 'திறந்த மனப்பான்மையுடைய' } },
                { code: 'D', labels: { en: 'Original', si: 'නිර්මාණශීලී', ta: 'தனித்துவமான' } },
            ],
        },
        {
            questionNumber: 2,
            options: [
                { code: 'A', labels: { en: 'Cautious', si: 'ප්‍රවේශම් සහගතයි', ta: 'கவனமான' } },
                { code: 'B', labels: { en: 'Convincing', si: 'විශ්වාසය ඇති කළ හැකියි', ta: 'நம்பிக்கை ஊட்டும்' } },
                { code: 'C', labels: { en: 'Aggressive', si: 'ආක්‍රමණශීලී', ta: 'முனைப்பான' } },
                { code: 'D', labels: { en: 'Good-Natured', si: 'යහපත් ගති ඇත', ta: 'நல்ல இயல்புடைய' } },
            ],
        },
        {
            questionNumber: 3,
            options: [
                { code: 'A', labels: { en: 'Docile', si: 'කීකරුයි', ta: 'பணிவான' } },
                { code: 'B', labels: { en: 'Dogged', si: 'උත්සාහවන්තයි', ta: 'விடாமுயற்சியுடைய' } },
                { code: 'C', labels: { en: 'Open-minded', si: 'විවෘත මනසක් සහිතයි', ta: 'திறந்த மனப்பான்மையுடைய' } },
                { code: 'D', labels: { en: 'Bold', si: 'නිර්භීත ගතිගුණයෙන් යුත්', ta: 'துணிச்சலான' } },
            ],
        },
        {
            questionNumber: 4,
            options: [
                { code: 'A', labels: { en: 'Charming', si: 'ප්‍රිය මනාපයි', ta: 'கவர்ச்சிகரமான' } },
                { code: 'B', labels: { en: 'Loyal', si: 'ඉතා හිතවත්', ta: 'விசுவாசமான' } },
                { code: 'C', labels: { en: 'Determined', si: 'අධිෂ්ඨාන ශීලීයි', ta: 'உறுதியான' } },
                { code: 'D', labels: { en: 'Even-tempered', si: 'තරහ නොයන සුළුයි', ta: 'நிதானமான' } },
            ],
        },
        {
            questionNumber: 5,
            options: [
                { code: 'A', labels: { en: 'Willing', si: 'කැමැත්තෙන් ඉදිරිපත් වන', ta: 'மனமுவந்து செயல்படும்' } },
                { code: 'B', labels: { en: 'Eager', si: 'ඉතා උනන්දුයි', ta: 'ஆர்வம் மிக்க' } },
                { code: 'C', labels: { en: 'Nervy', si: 'කලබලකාරීයි', ta: 'பதற்றமடையக்கூடிய' } },
                { code: 'D', labels: { en: 'Strong-willed', si: 'දැඩි අධිෂ්ඨාන ශීලීයි', ta: 'மன உறுதியுடைய' } },
            ],
        },
        {
            questionNumber: 6,
            options: [
                { code: 'A', labels: { en: 'Agreeable', si: 'එකඟ විය හැකියි', ta: 'இணக்கமான' } },
                { code: 'B', labels: { en: 'High-spirited', si: 'ඉතා උද්යෝගිමත්', ta: 'உற்சாகமான' } },
                { code: 'C', labels: { en: 'Confident', si: 'විශ්වාසශීලීයි', ta: 'தன்னம்பிக்கையுடைய' } },
                { code: 'D', labels: { en: 'Even-tempered', si: 'තරහ නොයන සුළුයි', ta: 'சமநிலையான' } },
            ],
        },
        {
            questionNumber: 7,
            options: [
                { code: 'A', labels: { en: 'Obliging', si: 'කරුණාවන්තයි', ta: 'உதவும் மனப்பான்மையுடைய' } },
                { code: 'B', labels: { en: 'Assertive', si: 'ස්ථිරසාරයි', ta: 'உறுதியாகக் கூறும்' } },
                { code: 'C', labels: { en: 'Precise', si: 'ඉතා නිවැරදියි', ta: 'துல்லியமான' } },
                { code: 'D', labels: { en: 'Animated', si: 'ප්‍රාණවත්', ta: 'துடிப்புள்ள' } },
            ],
        },
        {
            questionNumber: 8,
            options: [
                { code: 'A', labels: { en: 'Disciplined', si: 'විනයගරුකයි', ta: 'ஒழுக்கமான' } },
                { code: 'B', labels: { en: 'Cheerful', si: 'ප්‍රීතිමත්', ta: 'மகிழ்ச்சியான' } },
                { code: 'C', labels: { en: 'Restless', si: 'නොසන්සුන්', ta: 'ஓய்வில்லாத' } },
                { code: 'D', labels: { en: 'Resigned', si: 'ඉවසිලිවන්තව භාරගන්නා', ta: 'ஏற்றுக்கொள்ளும் இயல்புடைய' } },
            ],
        },
        {
            questionNumber: 9,
            options: [
                { code: 'A', labels: { en: 'Sympathetic', si: 'අනුකම්පා සහගතයි', ta: 'பரிவுள்ள' } },
                { code: 'B', labels: { en: 'Persistent', si: 'නොපසුබටව ක්‍රියා කරයි', ta: 'விடாப்பிடியான' } },
                { code: 'C', labels: { en: 'Obedient', si: 'කීකරුයි', ta: 'கீழ்ப்படிதலுள்ள' } },
                { code: 'D', labels: { en: 'Spontaneous', si: 'සැලසුමකින් තොරව ක්ෂණිකව ක්‍රියා කරයි', ta: 'இயல்பாக உடனடியாகச் செயல்படும்' } },
            ],
        },
        {
            questionNumber: 10,
            options: [
                { code: 'A', labels: { en: 'Competitive', si: 'තරඟකාරී', ta: 'போட்டி மனப்பான்மையுடைய' } },
                { code: 'B', labels: { en: 'Tolerant', si: 'ඉවසිලිවන්තයි', ta: 'சகிப்புத்தன்மையுடைய' } },
                { code: 'C', labels: { en: 'Fussy', si: 'සියුම් දේ ගැන වද වෙන', ta: 'நுணுக்கமாக ஆராயும்' } },
                { code: 'D', labels: { en: 'Pioneering', si: 'මඟ පෙන්වනු ලබයි', ta: 'முன்னோடியான' } },
            ],
        },
        {
            questionNumber: 11,
            options: [
                { code: 'A', labels: { en: 'Respectful', si: 'ගරු කරයි', ta: 'மரியாதையுள்ள' } },
                { code: 'B', labels: { en: 'Jovial', si: 'විනෝදකාමී', ta: 'கலகலப்பான' } },
                { code: 'C', labels: { en: 'Influential', si: 'බලපෑම් කළ හැකියි', ta: 'செல்வாக்கு செலுத்தும்' } },
                { code: 'D', labels: { en: 'Optimistic', si: 'සුබවාදී', ta: 'நம்பிக்கையுள்ள' } },
            ],
        },
        {
            questionNumber: 12,
            options: [
                { code: 'A', labels: { en: 'Generous', si: 'ත්‍යාගශීලී', ta: 'தாராள மனப்பான்மையுடைய' } },
                { code: 'B', labels: { en: 'Unconquerable', si: 'අපරාජිතයි', ta: 'வெல்ல முடியாத' } },
                { code: 'C', labels: { en: 'Inspiring', si: 'සිත් ඇදගන්නා සුළුයි', ta: 'ஊக்கமளிக்கும்' } },
                { code: 'D', labels: { en: 'Submissive', si: 'යටහත් පහත්', ta: 'பணிந்து நடக்கும்' } },
            ],
        },
        {
            questionNumber: 13,
            options: [
                { code: 'A', labels: { en: 'Considerate', si: 'අන් අය ගැන සැලකිලිමත්', ta: 'பிறர் நலன் கருதும்' } },
                { code: 'B', labels: { en: 'Brave', si: 'නිර්භීතයි', ta: 'தைரியமான' } },
                { code: 'C', labels: { en: 'Timid', si: 'බියසුලුයි', ta: 'கூச்ச சுபாவமுள்ள' } },
                { code: 'D', labels: { en: 'Adaptable', si: 'හැඩගැසිය හැකි', ta: 'சூழ்நிலைக்கு ஏற்ப மாறும்' } },
            ],
        },
        {
            questionNumber: 14,
            options: [
                { code: 'A', labels: { en: 'Argumentative', si: 'වාදශීලීයි', ta: 'வாதாடும் திறனுடைய' } },
                { code: 'B', labels: { en: 'Kind', si: 'කාරුණිකයි', ta: 'அன்பான' } },
                { code: 'C', labels: { en: 'Nonchalant', si: 'සැහැල්ලුවෙන් සිටින', ta: 'இயல்பான' } },
                { code: 'D', labels: { en: 'Patient', si: 'ඉවසිලිවන්තයි', ta: 'பொறுமையான' } },
            ],
        },
        {
            questionNumber: 15,
            options: [
                { code: 'A', labels: { en: 'Self-reliant', si: 'ස්වයං විශ්වාසයෙන් යුතුයි', ta: 'சுயசார்புடைய' } },
                { code: 'B', labels: { en: 'Light-hearted', si: 'සැහැල්ලු මනසකින් යුත්', ta: 'இலகுவான மனநிலை கொண்ட' } },
                { code: 'C', labels: { en: 'Soft-spoken', si: 'මෘදු ලෙස කතා කරයි', ta: 'மென்மையாகப் பேசும்' } },
                { code: 'D', labels: { en: 'Trusting', si: 'විශ්වාස කරන සුළුයි', ta: 'நம்பிக்கை வைக்கும்' } },
            ],
        },
        {
            questionNumber: 16,
            options: [
                { code: 'A', labels: { en: 'Adventurous', si: 'අවදානම් ගැනීමට කැමති', ta: 'சாகச விரும்பியான' } },
                { code: 'B', labels: { en: 'Peaceful', si: 'සාමකාමී', ta: 'அமைதியான' } },
                { code: 'C', labels: { en: 'Positive', si: 'ධනාත්මකයි', ta: 'நேர்மறையான' } },
                { code: 'D', labels: { en: 'Moderate', si: 'මධ්‍යස්ථයි', ta: 'மிதமான' } },
            ],
        },
        {
            questionNumber: 17,
            options: [
                { code: 'A', labels: { en: 'Cordial', si: 'සුහදශීලීයි', ta: 'நட்பான' } },
                { code: 'B', labels: { en: 'Vigorous', si: 'ජවසම්පන්නයි', ta: 'வீரியமான' } },
                { code: 'C', labels: { en: 'Receptive', si: 'අදහස් පිළිගන්නා සුළුයි', ta: 'கருத்துக்களை ஏற்றுக்கொள்ளும்' } },
                { code: 'D', labels: { en: 'Controlled', si: 'පාලනයකින් යුක්තයි', ta: 'கட்டுப்பாடான' } },
            ],
        },
        {
            questionNumber: 18,
            options: [
                { code: 'A', labels: { en: 'Accurate', si: 'නිවැරදියි', ta: 'துல்லியமான' } },
                { code: 'B', labels: { en: 'Good mixer', si: 'හොඳින් අන් අය හා මුසුවන', ta: 'எல்லோருடனும் எளிதில் பழகும்' } },
                { code: 'C', labels: { en: 'Decisive', si: 'තීරණ ගත හැකියි', ta: 'தீர்மானமான' } },
                { code: 'D', labels: { en: 'Lenient', si: 'ලිහිල් ප්‍රතිපත්ති ඇති', ta: 'விட்டுக்கொடுக்கும்' } },
            ],
        },
        {
            questionNumber: 19,
            options: [
                { code: 'A', labels: { en: 'Talkative', si: 'කතාබහට ලැදි', ta: 'நன்கு பேசக்கூடிய' } },
                { code: 'B', labels: { en: 'Conventional', si: 'සම්ප්‍රදායිකයි', ta: 'மரபுவழிப்பட்ட' } },
                { code: 'C', labels: { en: 'Outspoken', si: 'ඍජුව අදහස් ප්‍රකාශ කරයි', ta: 'வெளிப்படையாகப் பேசும்' } },
                { code: 'D', labels: { en: 'Satisfied', si: 'තෘප්තිමත් වෙයි', ta: 'திருப்தியடைந்த' } },
            ],
        },
        {
            questionNumber: 20,
            options: [
                { code: 'A', labels: { en: 'Audacious', si: 'එඩිතරයි', ta: 'துணிச்சல் மிக்க' } },
                { code: 'B', labels: { en: 'Popular', si: 'ජනප්‍රියයි', ta: 'பிரபலமான' } },
                { code: 'C', labels: { en: 'Companionable', si: 'මිත්‍රශීලීයි', ta: 'தோழமையான' } },
                { code: 'D', labels: { en: 'Polished', si: 'ශිෂ්ට සම්පන්නයි', ta: 'நேர்த்தியான' } },
            ],
        },
    ],
};
/**
 * Returns a sanitized public view of the questionnaire guaranteed to contain
 * ONLY question numbers, option codes (A, B, C, D), and localized text labels.
 * Never includes answer keys or scoring metadata.
 */
function getPublicQuestionnaireView(definition = exports.QUESTIONNAIRE_V1_DEFINITION) {
    return {
        version: definition.version,
        supportedLanguages: [...definition.supportedLanguages],
        translationMetadata: definition.translationMetadata,
        instructions: { ...definition.instructions },
        questions: definition.questions.map((q) => ({
            questionNumber: q.questionNumber,
            options: q.options.map((opt) => ({
                code: opt.code,
                labels: {
                    en: opt.labels.en,
                    si: opt.labels.si,
                    ta: opt.labels.ta,
                },
            })),
        })),
    };
}
/**
 * Helper to look up the localized label of an option for a given question number.
 */
function getQuestionOptionLabel(questionNumber, optionCode, language = 'en', definition = exports.QUESTIONNAIRE_V1_DEFINITION) {
    const question = definition.questions.find((q) => q.questionNumber === questionNumber);
    if (!question)
        return optionCode;
    const option = question.options.find((o) => o.code === optionCode);
    if (!option)
        return optionCode;
    return option.labels[language] || option.labels.en;
}
//# sourceMappingURL=questionnaire-v1.definition.js.map