"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialStyleInterpretationService = exports.DEFAULT_INTERPRETATION_TEMPLATES_V1 = void 0;
const answer_key_v1_definition_1 = require("./answer-key-v1.definition");
exports.DEFAULT_INTERPRETATION_TEMPLATES_V1 = {
    version: answer_key_v1_definition_1.CURRENT_INTERPRETATION_VERSION,
    contentStatus: 'DRAFT_PENDING_CONSULTANT_REVIEW',
    updatedAt: '2026-11-06T00:00:00.000Z',
    updatedBy: 'SYSTEM_SEEDER',
    bundles: {
        en: {
            language: 'en',
            translationStatus: 'PENDING_CONSULTANT_REVIEW',
            disclaimer: 'Important Notice & Workplace Guidance Disclaimer: This report summarizes self-reported communication preferences across four workplace interaction styles (Analytical, Amiable, Expressive, and Driver). All individuals use elements of all four styles depending on context. Higher numerical scores or net balance positions indicate self-described workplace tendencies—not fixed personality traits, capability evaluations, or clinical/psychological diagnoses. Narrative guidance sections are general workplace communication templates intended to support constructive coaching conversations with a qualified consultant.',
            fourAxisExplanation: 'Visualization A (Four-Axis Profile) plots each of the four final style scores (0–100) along its dedicated semi-axis (Analytical on Left, Driver on Top, Expressive on Right, Amiable on Bottom) and connects them to illustrate the breadth of reported preferences across all four styles simultaneously.',
            netCoordinateExplanation: 'Visualization B (Net Balance Coordinate) displays the relative balance between horizontal preferences (X = Expressive − Analytical) and vertical preferences (Y = Driver − Amiable) on a scale from −100 to +100, where 0 represents an equal balance between the paired styles.',
            styles: {
                ANALYTICAL: {
                    styleCode: 'ANALYTICAL',
                    styleName: 'Analytical',
                    axisSummary: 'Left Axis — Slower-Paced, Less Assertive, Fact & Process-Focused',
                    overview: 'Individuals with a strong Analytical preference typically value accuracy, structure, objective data, and thorough preparation. In workplace discussions, they often prefer a measured pace and careful verification before committing to decisions.',
                    communicationPreferences: [
                        'Prefers clear, well-organized facts, written documentation, and logical reasoning.',
                        'Appreciates having time to review information before being asked for a final commitment.',
                        'Communicates in a precise, composed, and methodical manner.',
                    ],
                    workplaceStrengths: [
                        'High attention to quality, accuracy, and process consistency.',
                        'Objective problem-solving grounded in evidence rather than assumptions.',
                        'Ability to anticipate operational risks and edge cases early.',
                    ],
                    potentialChallenges: [
                        'May appear overly cautious or hesitant when rapid decisions are required with incomplete data.',
                        'Can spend extended time gathering details at the expense of early momentum.',
                        'May seem reserved in highly informal or fast-paced brainstorming sessions.',
                    ],
                    recommendationsForColleagues: [
                        'Come prepared with supporting data, clear context, and specific objectives.',
                        'Avoid pressuring for immediate on-the-spot decisions when complex trade-offs are involved.',
                        'Follow up verbal discussions with concise written summaries.',
                    ],
                    recommendationsForManagers: [
                        'Provide clear expectations, quality criteria, and realistic timelines.',
                        'Encourage practical decision thresholds ("80% certainty") when speed is critical.',
                        'Recognize their thoroughness and analytical rigor in team reviews.',
                    ],
                },
                AMIABLE: {
                    styleCode: 'AMIABLE',
                    styleName: 'Amiable',
                    axisSummary: 'Bottom Axis — More Responsive, Relationship & Harmony-Oriented',
                    overview: 'Individuals with a strong Amiable preference typically emphasize collaboration, mutual trust, team harmony, and supportive workplace relationships. They often focus on how decisions affect people and team cohesion.',
                    communicationPreferences: [
                        'Prefers warm, respectful, and cooperative dialogue where everyone is heard.',
                        'Values active listening, empathy, and consensus-building.',
                        'Appreciates reassurance and collaborative problem-solving over confrontational debate.',
                    ],
                    workplaceStrengths: [
                        'Builds strong interpersonal trust and psychological safety within teams.',
                        'Reliable listener who supports colleagues and mediates interpersonal friction.',
                        'Steady, patient contributor in long-term collaborative initiatives.',
                    ],
                    potentialChallenges: [
                        'May hesitate to voice disagreement or deliver direct critical feedback to preserve harmony.',
                        'Can find abrupt, highly directive, or impersonal communication stressful.',
                        'May take extra time seeking consensus when an unpopular decision is necessary.',
                    ],
                    recommendationsForColleagues: [
                        'Take a collaborative, respectful tone and acknowledge the human impact of changes.',
                        'Invite their perspective explicitly during meetings rather than assuming silence means full agreement.',
                        'Explain how proposed changes will support the team and shared outcomes.',
                    ],
                    recommendationsForManagers: [
                        'Provide regular, constructive feedback in a supportive one-on-one setting.',
                        'Frame organizational goals around shared team outcomes and mutual support.',
                        'Coach them on expressing candid dissent early and setting healthy workload boundaries.',
                    ],
                },
                EXPRESSIVE: {
                    styleCode: 'EXPRESSIVE',
                    styleName: 'Expressive',
                    axisSummary: 'Right Axis — Faster-Paced, Idea & Interaction-Oriented',
                    overview: 'Individuals with a strong Expressive preference typically bring energy, enthusiasm, and big-picture creativity to workplace interactions. They often prefer dynamic dialogue, rapid idea generation, and visible engagement with others.',
                    communicationPreferences: [
                        'Prefers interactive, energetic, and forward-looking conversations.',
                        'Focuses on vision, possibilities, and motivating people around new initiatives.',
                        'Communicates openly and expressively, often thinking out loud with colleagues.',
                    ],
                    workplaceStrengths: [
                        'Generates momentum, optimism, and creative ideas during change or new projects.',
                        'Articulate communicator who can rally teams and build cross-functional enthusiasm.',
                        'Adapts quickly to evolving situations and new interpersonal environments.',
                    ],
                    potentialChallenges: [
                        'May move quickly from one idea to the next without documenting operational details.',
                        'Can find repetitive routine tasks or lengthy technical reviews draining.',
                        'May unintentionally dominate airtime in discussions with quieter colleagues.',
                    ],
                    recommendationsForColleagues: [
                        'Engage with their big-picture ideas first before diving into granular implementation constraints.',
                        'Keep meetings interactive and collaborative rather than purely procedural.',
                        'Help translate agreed verbal ideas into clear, written action items and owners.',
                    ],
                    recommendationsForManagers: [
                        'Provide opportunities for visible collaboration, presentation, and creative problem-solving.',
                        'Pair visionary brainstorming with structured milestone check-ins for follow-through.',
                        'Encourage active pausing to invite input from more reflective team members.',
                    ],
                },
                DRIVER: {
                    styleCode: 'DRIVER',
                    styleName: 'Driver',
                    axisSummary: 'Top Axis — Less Responsive, Task & Results-Oriented',
                    overview: 'Individuals with a strong Driver preference typically focus on tangible results, efficiency, decisive action, and clear accountability. They prefer direct communication that gets straight to the objective and next steps.',
                    communicationPreferences: [
                        'Prefers concise, bottom-line summaries focused on outcomes, options, and timelines.',
                        'Values autonomy, speed, and pragmatic problem-solving.',
                        'Communicates directly and decisively without extended preamble.',
                    ],
                    workplaceStrengths: [
                        'Strong bias for action, execution speed, and overcoming obstacles.',
                        'Comfortable making clear decisions and taking ownership of challenging targets.',
                        'Keeps projects focused on measurable deliverables and deadlines.',
                    ],
                    potentialChallenges: [
                        'May come across as overly blunt, impatient, or demanding under tight deadlines.',
                        'Can move past relationship-building or stakeholder alignment in pursuit of speed.',
                        'May overlook subtle interpersonal concerns if not explicitly raised.',
                    ],
                    recommendationsForColleagues: [
                        'Lead with the bottom-line recommendation, key options, and expected outcomes.',
                        'Be concise, well-prepared, and clear about timelines and accountability.',
                        'Focus discussions on practical solutions rather than prolonged problem descriptions.',
                    ],
                    recommendationsForManagers: [
                        'Delegate clear goals and autonomy over how results are achieved.',
                        'Coach on pacing communication and actively checking for team buy-in on cross-functional initiatives.',
                        'Balance execution speed with inclusive listening during complex change management.',
                    ],
                },
            },
        },
        si: {
            language: 'si',
            translationStatus: 'PENDING_CONSULTANT_REVIEW',
            disclaimer: 'වැදගත් සටහන සහ වෘත්තීය සන්නිවේදන මාර්ගෝපදේශ ප්‍රකාශය: මෙම වාර්තාව මඟින් වෘත්තීය අන්තර්ක්‍රියා ශෛලීන් හතරක් (Analytical / විශ්ලේෂණාත්මක, Amiable / සුහදශීලී, Expressive / ප්‍රකාශනාත්මක, සහ Driver / මෙහෙයවන) හරහා සහභාගිවන්නා විසින් තෝරාගත් සන්නිවේදන මනාපයන් සාරාංශ කරයි. මෙය මනෝවිද්‍යාත්මක විනිශ්චයක් හෝ හැකියාවන් ඇගයීමක් නොවන අතර, උපදේශකවරයෙකු සමඟ ඵලදායී වෘත්තීය සාකච්ඡාවක් සඳහා පමණක් භාවිතා කළ යුතු පොදු මාර්ගෝපදේශයකි.',
            fourAxisExplanation: 'රූපසටහන A (අක්ෂ හතරේ පැතිකඩ): අවසාන ලකුණු හතර (0–100) අදාළ අක්ෂ හතරෙහි (වම: Analytical, ඉහළ: Driver, දකුණ: Expressive, පහළ: Amiable) ලකුණු කර යා කිරීමෙන් ශෛලීන් හතරෙහිම ව්‍යාප්තිය පෙන්වයි.',
            netCoordinateExplanation: 'රූපසටහන B (ශුද්ධ සමතුලිතතා ලක්ෂ්‍යය): තිරස් අක්ෂයේ (X = Expressive − Analytical) සහ සිරස් අක්ෂයේ (Y = Driver − Amiable) සාපේක්ෂ සමතුලිතතාවය −100 සිට +100 දක්වා පරිමාණයක පෙන්වයි.',
            styles: {
                ANALYTICAL: {
                    styleCode: 'ANALYTICAL',
                    styleName: 'Analytical (විශ්ලේෂණාත්මක)',
                    axisSummary: 'වම් අක්ෂය — සංයමයෙන් යුතු, දත්ත සහ නිවැරදිභාවය මූලික කරගත්',
                    overview: 'විශ්ලේෂණාත්මක (Analytical) ශෛලියට වැඩි නැඹුරුවක් දක්වන පුද්ගලයින් නිවැරදිභාවය, ක්‍රමානුකූල බව, වෛෂයික දත්ත සහ මනා සූදානම අගය කරයි. තීරණ ගැනීමට පෙර කරුණු ගැඹුරින් පරීක්ෂා කිරීමට ඔවුහු කැමැත්තක් දක්වති.',
                    communicationPreferences: [
                        'පැහැදිලි දත්ත, ලිඛිත තොරතුරු සහ තාර්කික පැහැදිලි කිරීම් ප්‍රිය කරයි.',
                        'අවසාන තීරණයකට එළඹීමට පෙර තොරතුරු අධ්‍යයනය කිරීමට ප්‍රමාණවත් කාලයක් අගය කරයි.',
                        'නිවැරදි, සංයමයෙන් යුතු සහ ක්‍රමානුකූල සන්නිවේදන රටාවක් අනුගමනය කරයි.',
                    ],
                    workplaceStrengths: [
                        'උසස් ප්‍රමිතිය, නිවැරදිභාවය සහ ක්‍රියාවලි අඛණ්ඩතාව පවත්වා ගැනීම.',
                        'උපකල්පන මත නොව සාක්ෂි මත පදනම්ව ගැටලු විසඳීම.',
                        'ක්‍රියාකාරී අවදානම් කල්තියා හඳුනා ගැනීමේ හැකියාව.',
                    ],
                    potentialChallenges: [
                        'සීමිත දත්ත යටතේ ක්ෂණික තීරණ ගත යුතු අවස්ථාවලදී පසුබෑමක් හෝ ප්‍රමාදයක් පෙන්විය හැකිය.',
                        'සියලුම සියුම් තොරතුරු රැස් කිරීමට වැඩි කාලයක් වැය කළ හැකිය.',
                        'වේගවත් හෝ අවිධිමත් සාකච්ඡාවලදී නිහඬ ස්වභාවයක් පෙන්විය හැකිය.',
                    ],
                    recommendationsForColleagues: [
                        'සාකච්ඡා සඳහා නිවැරදි දත්ත සහ පැහැදිලි අරමුණු සහිතව සූදානම්ව පැමිණෙන්න.',
                        'සංකීර්ණ කරුණු සඳහා ක්ෂණික තීරණ ලබා ගැනීමට බලපෑම් කිරීමෙන් වළකින්න.',
                        'වාචික සාකච්ඡාවලින් පසුව කෙටි ලිඛිත සාරාංශයක් ලබා දෙන්න.',
                    ],
                    recommendationsForManagers: [
                        'පැහැදිලි ඉලක්ක, ගුණාත්මක නිර්ණායක සහ ප්‍රායෝගික කාලරාමු ලබා දෙන්න.',
                        'වේගවත් තීරණ අවශ්‍ය විට ප්‍රායෝගික තීරණ සීමාවන් සඳහා දිරිගන්වන්න.',
                        'ඔවුන්ගේ විශ්ලේෂණාත්මක නිරවද්‍යතාවය කණ්ඩායම් තුළ අගය කරන්න.',
                    ],
                },
                AMIABLE: {
                    styleCode: 'AMIABLE',
                    styleName: 'Amiable (සුහදශීලී)',
                    axisSummary: 'පහළ අක්ෂය — සංවේදී, සහයෝගීතාවය සහ සබඳතා මූලික කරගත්',
                    overview: 'සුහදශීලී (Amiable) ශෛලියට වැඩි නැඹුරුවක් දක්වන පුද්ගලයින් කණ්ඩායම් සහයෝගීතාවය, අන්‍යෝන්‍ය විශ්වාසය සහ සුහද වෘත්තීය සබඳතා අගය කරයි. තීරණ මඟින් පුද්ගලයින්ට සහ කණ්ඩායම් එකමුතුකමට වන බලපෑම ගැන ඔවුහු සැලකිලිමත් වෙති.',
                    communicationPreferences: [
                        'සියලු දෙනාටම ගරු කරන, සුහද සහ සහයෝගී සංවාද ප්‍රිය කරයි.',
                        'සවන් දීම, සහකම්පනය සහ පොදු එකඟතාවය අගය කරයි.',
                        'ගැටුම්කාරී වාද විවාදවලට වඩා සාමූහිකව ගැටලු විසඳීමට කැමැත්තක් දක්වයි.',
                    ],
                    workplaceStrengths: [
                        'කණ්ඩායම් තුළ දැඩි විශ්වාසයක් සහ සුරක්ෂිත පරිසරයක් ගොඩනැගීම.',
                        'සහෝදර සේවකයින්ට සහාය වීම සහ මතභේද සමනය කිරීම.',
                        'දිගුකාලීන කණ්ඩායම් ව්‍යාපෘතිවලදී ඉවසිලිවන්තව සහ ස්ථාවරව දායක වීම.',
                    ],
                    potentialChallenges: [
                        'සුහදතාවය ආරක්ෂා කිරීම සඳහා විරුද්ධ අදහස් හෝ සෘජු විවේචන ප්‍රකාශ කිරීමට මැලි විය හැකිය.',
                        'දැඩි හෝ ආවේගශීලී සන්නිවේදන රටාවන් නිසා අපහසුතාවයට පත් විය හැකිය.',
                        'සියලු දෙනාගේම එකඟතාවය ලබා ගැනීමට උත්සාහ කිරීමේදී තීරණ ගැනීම ප්‍රමාද විය හැකිය.',
                    ],
                    recommendationsForColleagues: [
                        'සුහදශීලී සහ ගෞරවනීය ස්වරයකින් අදහස් හුවමාරු කරගන්න.',
                        'රැස්වීම්වලදී ඔවුන්ගේ අදහස් කාරුණිකව විමසා බලන්න.',
                        'නව වෙනස්කම් කණ්ඩායමේ යහපතට හේතු වන ආකාරය පැහැදිලි කරන්න.',
                    ],
                    recommendationsForManagers: [
                        'සුහද පෞද්ගලික සාකච්ඡා මඟින් නිර්මාණාත්මක ප්‍රතිපෝෂණ ලබා දෙන්න.',
                        'ආයතනික ඉලක්ක කණ්ඩායම් සාර්ථකත්වය සමඟ සම්බන්ධ කර පෙන්වන්න.',
                        'අවශ්‍ය අවස්ථාවලදී සෘජුව අදහස් ප්‍රකාශ කිරීමට ඔවුන්ව දිරිමත් කරන්න.',
                    ],
                },
                EXPRESSIVE: {
                    styleCode: 'EXPRESSIVE',
                    styleName: 'Expressive (ප්‍රකාශනාත්මක)',
                    axisSummary: 'දකුණු අක්ෂය — වේගවත්, නිර්මාණශීලී අදහස් සහ උද්යෝගය මූලික කරගත්',
                    overview: 'ප්‍රකාශනාත්මක (Expressive) ශෛලියට වැඩි නැඹුරුවක් දක්වන පුද්ගලයින් උද්යෝගය, නිර්මාණශීලීත්වය සහ පුළුල් දැක්මක් වෘත්තීය පරිසරයට එක් කරයි. සජීවී සංවාද සහ නව අදහස් ඉදිරිපත් කිරීම ඔවුහු ප්‍රිය කරති.',
                    communicationPreferences: [
                        'සජීවී, උද්යෝගිමත් සහ අනාගතය දෙස බලන සංවාද ප්‍රිය කරයි.',
                        'නව අදහස්, හැකියාවන් සහ පුද්ගලයින් දිරිගැන්වීම කෙරෙහි අවධානය යොමු කරයි.',
                        'විවෘතව සහ ප්‍රාණවත් ලෙස අදහස් ප්‍රකාශ කරයි.',
                    ],
                    workplaceStrengths: [
                        'නව ව්‍යාපෘති සහ වෙනස්කම් හමුවේ උද්යෝගය සහ නිර්මාණශීලී අදහස් ජනනය කිරීම.',
                        'කණ්ඩායම් පෙළගැස්වීමට සහ ආකර්ෂණීය ලෙස සන්නිවේදනය කිරීමට ඇති හැකියාව.',
                        'නව අවස්ථාවන්ට ඉක්මනින් හැඩගැසීම.',
                    ],
                    potentialChallenges: [
                        'සියුම් ක්‍රියාත්මක කිරීමේ තොරතුරු ලේඛනගත කිරීමකින් තොරව ඉක්මනින් නව අදහස් වෙත යොමු විය හැකිය.',
                        'ඒකාකාරී කාර්යයන් හෝ දීර්ඝ තාක්ෂණික පරීක්ෂාවන් වෙහෙසකර විය හැකිය.',
                        'සාකච්ඡාවලදී වැඩි කාලයක් අදහස් දැක්වීමට නැඹුරු විය හැකිය.',
                    ],
                    recommendationsForColleagues: [
                        'සියුම් බාධක ගැන කතා කිරීමට පෙර ඔවුන්ගේ පුළුල් අදහසට සවන් දෙන්න.',
                        'සාකච්ඡා සජීවීව සහ සහයෝගීව පවත්වා ගන්න.',
                        'එකඟ වූ අදහස් පැහැදිලි ලිඛිත ක්‍රියාකාරී පියවර බවට පත් කිරීමට සහාය වන්න.',
                    ],
                    recommendationsForManagers: [
                        'නිර්මාණශීලී ගැටලු විසඳීමට සහ ඉදිරිපත් කිරීම් සඳහා අවස්ථා ලබා දෙන්න.',
                        'නව අදහස් ප්‍රායෝගිකව ක්‍රියාත්මක කිරීම සඳහා කාලසටහන් සහ පසුවිපරම් එක් කරන්න.',
                        'නිහඬ සාමාජිකයින්ගේ අදහස්වලටද ඉඩ ලබා දීමට ඔවුන්ව යොමු කරන්න.',
                    ],
                },
                DRIVER: {
                    styleCode: 'DRIVER',
                    styleName: 'Driver (මෙහෙයවන / ප්‍රතිඵල මූලික)',
                    axisSummary: 'ඉහළ අක්ෂය — තීරණාත්මක, කාර්යය සහ ප්‍රතිඵල මූලික කරගත්',
                    overview: 'මෙහෙයවන (Driver) ශෛලියට වැඩි නැඹුරුවක් දක්වන පුද්ගලයින් ප්‍රායෝගික ප්‍රතිඵල, කාර්යක්ෂමතාව, තීරණාත්මක ක්‍රියාමාර්ග සහ පැහැදිලි වගකීම් කෙරෙහි අවධානය යොමු කරයි. අරමුණට සෘජුවම යොමු වන කෙටි හා පැහැදිලි සන්නිවේදනය ඔවුහු අගය කරති.',
                    communicationPreferences: [
                        'ප්‍රතිඵල, විකල්ප සහ කාලරාමු මත පදනම් වූ කෙටි හා සෘජු සාරාංශ ප්‍රිය කරයි.',
                        'ස්වාධීනත්වය, වේගය සහ ප්‍රායෝගික ගැටලු විසඳීම අගය කරයි.',
                        'අනවශ්‍ය විස්තරවලින් තොරව සෘජුව සහ තීරණාත්මකව අදහස් දක්වයි.',
                    ],
                    workplaceStrengths: [
                        'ඉලක්ක කරා වේගයෙන් යොමු වීම සහ බාධක ජය ගැනීම.',
                        'අභියෝගාත්මක අවස්ථාවලදී පැහැදිලි තීරණ ගැනීම සහ වගකීම් භාර ගැනීම.',
                        'මැනිය හැකි ප්‍රතිඵල සහ නියමිත කාලරාමු වෙත ව්‍යාපෘති යොමු කර තබා ගැනීම.',
                    ],
                    potentialChallenges: [
                        'දැඩි කාලරාමු යටතේ නොඉවසිලිමත් හෝ දැඩි ස්වභාවයක් පෙන්විය හැකිය.',
                        'වේගයෙන් ප්‍රතිඵල ලබා ගැනීමට යාමේදී අන්තර්-පුද්ගල සබඳතා මඟහැරිය හැකිය.',
                        'සියුම් මානව ගැටලු සෘජුවම ඉදිරිපත් නොවුණහොත් අවධානයට ලක් නොවිය හැකිය.',
                    ],
                    recommendationsForColleagues: [
                        'ප්‍රධාන නිර්දේශය, විකල්ප සහ අපේක්ෂිත ප්‍රතිඵල මුලින්ම ඉදිරිපත් කරන්න.',
                        'කෙටි, පැහැදිලි සහ මනා සූදානමකින් යුතුව කරුණු දක්වන්න.',
                        'ගැටලු දීර්ඝව විස්තර කරනවාට වඩා ප්‍රායෝගික විසඳුම් වෙත අවධානය යොමු කරන්න.',
                    ],
                    recommendationsForManagers: [
                        'පැහැදිලි ඉලක්ක සහ ඒවා සාක්ෂාත් කරගැනීමට අවශ්‍ය ස්වාධීනත්වය ලබා දෙන්න.',
                        'කණ්ඩායම් එකඟතාවය සහ සවන් දීම පවත්වා ගැනීමට උපදෙස් ලබා දෙන්න.',
                        'ක්‍රියාත්මක කිරීමේ වේගය සහ කණ්ඩායම් සහභාගීත්වය අතර සමතුලිතතාවය ප්‍රවර්ධනය කරන්න.',
                    ],
                },
            },
        },
        ta: {
            language: 'ta',
            translationStatus: 'PENDING_CONSULTANT_REVIEW',
            disclaimer: 'முக்கிய குறிப்பு மற்றும் பணியிட வழிகாட்டுதல் பொறுப்புத்துறப்பு: இந்த அறிக்கை நான்கு பணியிடத் தொடர்பு பாணிகளில் (Analytical / பகுப்பாய்வு, Amiable / இணக்கமான, Expressive / வெளிப்பாட்டு, மற்றும் Driver / வழிநடத்தும்) பங்கேற்பாளரின் சுய-தேர்வு விருப்பங்களை சுருக்கமாகக் கூறுகிறது. இது உளவியல் ரீதியான கணிப்போ அல்லது திறன் மதிப்பீடோ அல்ல; தகுதிவாய்ந்த ஆலோசகருடன் ஆக்கப்பூர்வமான பணியிட உரையாடலுக்கு உதவும் பொதுவான வழிகாட்டுதல் மட்டுமே.',
            fourAxisExplanation: 'வரைபடம் A (நான்கு-அச்சு சுயவிவரம்): நான்கு இறுதி மதிப்பெண்களையும் (0–100) அவற்றின் அச்சுகளில் (இடது: Analytical, மேல்: Driver, வலது: Expressive, கீழ்: Amiable) குறித்து இணைப்பதன் மூலம் நான்கு பாணிகளின் பரவலைக் காட்டுகிறது.',
            netCoordinateExplanation: 'வரைபடம் B (நிகர சமநிலை புள்ளி): கிடைமட்ட (X = Expressive − Analytical) மற்றும் செங்குத்து (Y = Driver − Amiable) விருப்பங்களுக்கு இடையிலான நிகர சமநிலையை −100 முதல் +100 வரையிலான அளவில் காட்டுகிறது.',
            styles: {
                ANALYTICAL: {
                    styleCode: 'ANALYTICAL',
                    styleName: 'Analytical (பகுப்பாய்வு பாணி)',
                    axisSummary: 'இடது அச்சு — நிதானமான, தகவல் மற்றும் துல்லியம் சார்ந்த',
                    overview: 'பகுப்பாய்வு (Analytical) பாணியில் அதிக விருப்பம் கொண்டவர்கள் துல்லியம், கட்டமைப்பு, ஆதாரப்பூர்வமான தரவுகள் மற்றும் முழுமையான தயாரிப்பை மதிக்கிறார்கள். முடிவுகளை எடுப்பதற்கு முன் தகவல்களை கவனமாக சரிபார்க்க விரும்புகிறார்கள்.',
                    communicationPreferences: [
                        'தெளிவான தரவுகள், எழுத்துப்பூர்வ ஆவணங்கள் மற்றும் தர்க்கரீதியான விளக்கங்களை விரும்புகிறார்கள்.',
                        'முடிவு எடுப்பதற்கு முன் தகவல்களை ஆராய போதுமான நேரத்தை எதிர்பார்க்கிறார்கள்.',
                        'துல்லியமான மற்றும் முறைப்படுத்தப்பட்ட முறையில் உரையாடுகிறார்கள்.',
                    ],
                    workplaceStrengths: [
                        'தரம், துல்லியம் மற்றும் செயல்முறை நிலைத்தன்மையில் அதிக கவனம்.',
                        'யூகங்களுக்குப் பதிலாக ஆதாரங்களின் அடிப்படையில் சிக்கல்களைத் தீர்த்தல்.',
                        'செயல்பாட்டு இடர்களை முன்கூட்டியே கண்டறியும் திறன்.',
                    ],
                    potentialChallenges: [
                        'முழுமையற்ற தரவுகளுடன் விரைவான முடிவுகள் தேவைப்படும்போது தயக்கம் காட்டலாம்.',
                        'விவரங்களைச் சேகரிப்பதில் அதிக நேரம் செலவிடக்கூடும்.',
                        'வேகமான அல்லது முறைசாரா கலந்துரையாடல்களில் அமைதியாக இருக்கலாம்.',
                    ],
                    recommendationsForColleagues: [
                        'ஆதாரத் தரவுகள் மற்றும் தெளிவான நோக்கங்களுடன் தயாராக வாருங்கள்.',
                        'சிக்கலான முடிவுகளை உடனடியாக எடுக்குமாறு அழுத்தம் கொடுப்பதைத் தவிர்க்கவும்.',
                        'வாய்மொழி ஆலோசனைகளுக்குப் பிறகு சுருக்கமான எழுத்துப்பூர்வ குறிப்புகளைப் பகிரவும்.',
                    ],
                    recommendationsForManagers: [
                        'தெளிவான எதிர்பார்ப்புகள், தர அளவுகோல்கள் மற்றும் நடைமுறை காலக்கெடுவை வழங்கவும்.',
                        'வேகம் முக்கியமான தருணங்களில் நடைமுறை முடிவெடுக்கும் வரம்புகளை ஊக்குவிக்கவும்.',
                        'அவர்களின் ஆழமான பகுப்பாய்வுத் திறனை குழுவில் அங்கீகரிக்கவும்.',
                    ],
                },
                AMIABLE: {
                    styleCode: 'AMIABLE',
                    styleName: 'Amiable (இணக்கமான பாணி)',
                    axisSummary: 'கீழ் அச்சு — பரிவுள்ள, குழு ஒத்துழைப்பு மற்றும் உறவுகள் சார்ந்த',
                    overview: 'இணக்கமான (Amiable) பாணியில் அதிக விருப்பம் கொண்டவர்கள் குழு ஒத்துழைப்பு, பரஸ்பர நம்பிக்கை மற்றும் நல்லிணக்கமான பணியிட உறவுகளுக்கு முக்கியத்துவம் அளிக்கிறார்கள். முடிவுகள் மனிதர்களையும் குழு ஒற்றுமையையும் எவ்வாறு பாதிக்கின்றன என்பதில் கவனம் செலுத்துகிறார்கள்.',
                    communicationPreferences: [
                        'அனைவரும் மதிக்கப்படும் அன்பான மற்றும் ஒத்துழைப்புடன் கூடிய உரையாடலை விரும்புகிறார்கள்.',
                        'கவனமாகக் கேட்டல், பரிவு மற்றும் கருத்தொற்றுமையை மதிக்கிறார்கள்.',
                        'மோதல் விவாதங்களை விட இணைந்து சிக்கல்களைத் தீர்ப்பதை விரும்புகிறார்கள்.',
                    ],
                    workplaceStrengths: [
                        'குழுக்களுக்குள் வலுவான நம்பிக்கை மற்றும் பாதுகாப்பான சூழலை உருவாக்குதல்.',
                        'சக ஊழியர்களுக்கு ஆதரவளித்தல் மற்றும் கருத்து வேறுபாடுகளைச் சமரசம் செய்தல்.',
                        'நீண்டகால கூட்டுத் திட்டங்களில் பொறுமையாகவும் நிலையாகவும் பங்களித்தல்.',
                    ],
                    potentialChallenges: [
                        'நல்லிணக்கத்தைப் பாதுகாக்க மாற்றுக் கருத்துக்களை நேருக்கு நேர் கூறத் தயங்கலாம்.',
                        'கடுமையான அல்லது அவசரமான தகவல் தொடர்புகளால் மன அழுத்தம் அடையலாம்.',
                        'அனைவரின் சம்மதத்தையும் பெற முயலும்போது முடிவெடுப்பதில் தாமதம் ஏற்படலாம்.',
                    ],
                    recommendationsForColleagues: [
                        'மரியாதையான மற்றும் ஒத்துழைப்புடன் கூடிய அணுகுமுறையைக் கையாளுங்கள்.',
                        'கூட்டங்களில் அவர்களின் கருத்துக்களை நேரடியாகக் கேட்டு ஊக்குவிக்கவும்.',
                        'முன்மொழியப்படும் மாற்றங்கள் குழுவின் நலனுக்கு எவ்வாறு உதவும் என்பதை விளக்கவும்.',
                    ],
                    recommendationsForManagers: [
                        'ஆதரவான தனிப்பட்ட சந்திப்புகளில் ஆக்கப்பூர்வமான பின்னூட்டங்களை வழங்கவும்.',
                        'நிறுவன இலக்குகளை கூட்டு குழு வெற்றியுடன் இணைத்து விவரிக்கவும்.',
                        'மாற்றுக் கருத்துக்களைத் தயக்கமின்றித் தெரிவிக்க அவர்களுக்குப் பயிற்சி அளிக்கவும்.',
                    ],
                },
                EXPRESSIVE: {
                    styleCode: 'EXPRESSIVE',
                    styleName: 'Expressive (வெளிப்பாட்டு பாணி)',
                    axisSummary: 'வலது அச்சு — வேகமான, புதிய சிந்தனைகள் மற்றும் உற்சாகம் சார்ந்த',
                    overview: 'வெளிப்பாட்டு (Expressive) பாணியில் அதிக விருப்பம் கொண்டவர்கள் பணியிட உரையாடல்களில் உற்சாகம், ஆற்றல் மற்றும் படைப்பாற்றலைக் கொண்டு வருகிறார்கள். சுறுசுறுப்பான கலந்துரையாடல் மற்றும் புதிய யோசனைகளை உருவாக்குவதை விரும்புகிறார்கள்.',
                    communicationPreferences: [
                        'உற்சாகமான மற்றும் எதிர்கால நோக்குடைய உரையாடல்களை விரும்புகிறார்கள்.',
                        'புதிய வாய்ப்புகள் மற்றும் குழுவினரை ஊக்குவிப்பதில் கவனம் செலுத்துகிறார்கள்.',
                        'வெளிப்படையாகவும் சுறுசுறுப்பாகவும் கருத்துக்களைப் பகிர்கிறார்கள்.',
                    ],
                    workplaceStrengths: [
                        'புதிய திட்டங்கள் மற்றும் மாற்றங்களின்போது உற்சாகத்தையும் படைப்புத்திறனையும் உருவாக்குதல்.',
                        'குழுக்களை ஒருங்கிணைத்து உத்வேகத்துடன் வழிநடத்தும் தொடர்புத் திறன்.',
                        'புதிய சூழல்களுக்கு விரைவாகத் தகவமைத்துக் கொள்ளுதல்.',
                    ],
                    potentialChallenges: [
                        'செயல்பாட்டு விவரங்களை ஆவணப்படுத்தாமல் அடுத்த யோசனைக்கு விரைவாகச் செல்லக்கூடும்.',
                        'ஒரே மாதிரியான வழக்கமான பணிகள் சலிப்பை ஏற்படுத்தலாம்.',
                        'உரையாடல்களில் அமைதியான சக ஊழியர்களை விட அதிக நேரம் பேசக்கூடும்.',
                    ],
                    recommendationsForColleagues: [
                        'நடைமுறைச் சிக்கல்களைப் பேசும் முன் அவர்களின் பெரிய யோசனைகளுக்குச் செவிசாய்க்கவும்.',
                        'கூட்டங்களை உற்சாகமாகவும் கலந்துரையாடல் வடிவிலும் வைத்திருக்கவும்.',
                        'ஒப்புக்கொண்ட யோசனைகளைத் தெளிவான எழுத்துப்பூர்வ செயல் திட்டங்களாக மாற்ற உதவவும்.',
                    ],
                    recommendationsForManagers: [
                        'படைப்பாற்றல் மற்றும் குழு ஒருங்கிணைப்புக்கான வாய்ப்புகளை வழங்கவும்.',
                        'புதிய யோசனைகளைச் செயல்படுத்தக் காலக்கெடு மற்றும் தொடர் கண்காணிப்பை இணைக்கவும்.',
                        'மற்ற குழு உறுப்பினர்களின் கருத்துக்களுக்கும் வாய்ப்பளிக்குமாறு ஊக்குவிக்கவும்.',
                    ],
                },
                DRIVER: {
                    styleCode: 'DRIVER',
                    styleName: 'Driver (வழிநடத்தும் / முடிவு சார்ந்த பாணி)',
                    axisSummary: 'மேல் அச்சு — தீர்மானமான, பணி மற்றும் முடிவுகள் சார்ந்த',
                    overview: 'வழிநடத்தும் (Driver) பாணியில் அதிக விருப்பம் கொண்டவர்கள் உறுதியான முடிவுகள், செயல்திறன், விரைவான செயல்பாடு மற்றும் பொறுப்புக்கூறலில் கவனம் செலுத்துகிறார்கள். நேரடியாக இலக்கைப் பற்றிய சுருக்கமான தகவல் தொடர்பை விரும்புகிறார்கள்.',
                    communicationPreferences: [
                        'முடிவுகள், மாற்று வழிகள் மற்றும் காலக்கெடுவை மையமாகக் கொண்ட சுருக்கமான தகவல்களை விரும்புகிறார்கள்.',
                        'சுயாதீனமான செயல்பாடு, வேகம் மற்றும் நடைமுறைத் தீர்வுகளை மதிக்கிறார்கள்.',
                        'சுற்றி வளைக்காமல் நேரடியாகவும் உறுதியாகவும் பேசுகிறார்கள்.',
                    ],
                    workplaceStrengths: [
                        'செயல்பாட்டு வேகம் மற்றும் தடைகளைத் தாண்டி இலக்குகளை அடைதல்.',
                        'சவாலான சூழல்களில் தெளிவான முடிவுகளை எடுத்தல் மற்றும் பொறுப்பேற்றல்.',
                        'அளவிடக்கூடிய இலக்குகள் மற்றும் காலக்கெடுவில் திட்டங்களைக் கொண்டு செல்லுதல்.',
                    ],
                    potentialChallenges: [
                        'நெருக்கடியான காலக்கெடுவின்போது பொறுமையற்றவராகவோ கண்டிப்பானவராகவோ தோன்றலாம்.',
                        'வேகத்தை நாடும்போது குழு உறவுகள் அல்லது ஆலோசனைகளைக் கடந்து செல்லக்கூடும்.',
                        'நுட்பமான தனிநபர் கவலைகள் நேரடியாகக் கூறப்படாவிட்டால் கவனிக்கப்படாமல் போகலாம்.',
                    ],
                    recommendationsForColleagues: [
                        'முக்கிய பரிந்துரை, மாற்று வழிகள் மற்றும் எதிர்பார்க்கப்படும் முடிவுகளை முதலில் கூறவும்.',
                        'சுருக்கமாகவும், தெளிவான காலக்கெடு மற்றும் பொறுப்புகளுடனும் பேசவும்.',
                        'சிக்கல்களை நீண்ட நேரம் விவரிப்பதை விட நடைமுறைத் தீர்வுகளில் கவனம் செலுத்தவும்.',
                    ],
                    recommendationsForManagers: [
                        'தெளிவான இலக்குகளையும் அவற்றை அடைவதற்கான சுதந்திரத்தையும் வழங்கவும்.',
                        'குழுவினரின் கருத்துக்களைக் கேட்டறிந்து அரவணைத்துச் செல்ல வழிகாட்டவும்.',
                        'செயல்பாட்டு வேகத்துடன் கூட்டுப் பங்களிப்பையும் சமநிலைப்படுத்த ஊக்குவிக்கவும்.',
                    ],
                },
            },
        },
    },
};
class SocialStyleInterpretationService {
    /**
     * Returns the localized interpretation bundle for a language, falling back to 'en' if needed.
     */
    static getLocalizedBundle(language = 'en', catalog = exports.DEFAULT_INTERPRETATION_TEMPLATES_V1) {
        return catalog.bundles[language] || catalog.bundles.en;
    }
    /**
     * Orders all four style guidance blocks from highest final score to lowest final score,
     * preserving canonical order ['DRIVER', 'EXPRESSIVE', 'AMIABLE', 'ANALYTICAL'] on ties.
     */
    static getOrderedStyleGuidance(finalScores, language = 'en', catalog = exports.DEFAULT_INTERPRETATION_TEMPLATES_V1) {
        const bundle = this.getLocalizedBundle(language, catalog);
        const entries = [
            { code: 'ANALYTICAL', score: finalScores.analytical },
            { code: 'AMIABLE', score: finalScores.amiable },
            { code: 'EXPRESSIVE', score: finalScores.expressive },
            { code: 'DRIVER', score: finalScores.driver },
        ];
        const maxScore = Math.max(...entries.map((e) => e.score));
        const sorted = [...entries].sort((a, b) => b.score - a.score);
        return sorted.map((entry) => ({
            ...bundle.styles[entry.code],
            finalScore: entry.score,
            isHighestScored: entry.score === maxScore,
        }));
    }
}
exports.SocialStyleInterpretationService = SocialStyleInterpretationService;
//# sourceMappingURL=style-interpretations.definition.js.map