"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyTemplateSeederService = void 0;
const survey_template_repository_1 = require("../persistence/mongoose/survey-template.repository");
class SurveyTemplateSeederService {
    templateRepo;
    constructor(templateRepo = new survey_template_repository_1.SurveyTemplateMongoRepository()) {
        this.templateRepo = templateRepo;
    }
    async ensureDefaultTemplatesExist() {
        const templates = this.getDefaultTemplates();
        for (const tmpl of templates) {
            await this.templateRepo.save(tmpl);
        }
        console.log(`[TESP Survey Templates] Verified ${templates.length} default survey templates with multi-language support in MongoDB.`);
    }
    getDefaultTemplates() {
        // 5-Point Likert Options with English, Sinhala (සිංහල), and Tamil (தமிழ்)
        const standardLikertOptions = [
            {
                optionId: 'OPT-1',
                label: {
                    'en-US': '1 — Strongly Disagree',
                    'si-LK': '1 — දැඩි ලෙස එකඟ නොවෙමි',
                    'ta-LK': '1 — முற்றிலும் உடன்படவில்லை',
                },
                scoreValue: 1,
            },
            {
                optionId: 'OPT-2',
                label: {
                    'en-US': '2 — Disagree',
                    'si-LK': '2 — එකඟ නොවෙමි',
                    'ta-LK': '2 — உடன்படவில்லை',
                },
                scoreValue: 2,
            },
            {
                optionId: 'OPT-3',
                label: {
                    'en-US': '3 — Neutral',
                    'si-LK': '3 — මධ්‍යස්ථයි',
                    'ta-LK': '3 — நடுநிலை',
                },
                scoreValue: 3,
            },
            {
                optionId: 'OPT-4',
                label: {
                    'en-US': '4 — Agree',
                    'si-LK': '4 — එකඟ වෙමි',
                    'ta-LK': '4 — உடன்படுகிறேன்',
                },
                scoreValue: 4,
            },
            {
                optionId: 'OPT-5',
                label: {
                    'en-US': '5 — Strongly Agree',
                    'si-LK': '5 — දැඩි ලෙස එකඟ වෙමි',
                    'ta-LK': '5 — முற்றிலும் உடன்படுகிறேன்',
                },
                scoreValue: 5,
            },
        ];
        // ==========================================
        // TEMPLATE 1: Employee Workplace & Culture Survey (45 Questions, 9 Sections)
        // ==========================================
        const workplaceCultureTemplate = {
            templateId: 'TMPL-EMP-WORKPLACE-CULTURE-2026',
            name: {
                'en-US': 'Employee Workplace & Culture Survey',
                'si-LK': 'සේවක සේවා ස්ථාන සහ සංස්කෘතික සමීක්ෂණය',
                'ta-LK': 'பணியாளர் பணியிட மற்றும் கலாச்சார கணக்கெடுப்பு',
            },
            category: 'Workplace & Culture',
            description: {
                'en-US': 'Comprehensive 45-question survey instrument covering demographics, workplace satisfaction, company culture, leadership, teamwork, career development, well-being, open qualitative feedback, and overall engagement.',
                'si-LK': 'ජනවිකාස, සේවා ස්ථාන තෘප්තිය, සමාගම් සංස්කෘතිය, නායකත්වය, සන්නිවේදනය, වෘත්තීය සංවර්ධනය, යහපැවැත්ම, විවෘත ප්‍රතිපෝෂණ සහ සමස්ත සේවක සහභාගීත්වය ආවරණය වන පුළුල් ප්‍රශ්න 45 ක සමීක්ෂණය.',
                'ta-LK': 'மக்கள்தொகை, பணியிட திருப்தி, நிறுவன கலாச்சாரம், தலைமைத்துவம், தகவல் தொடர்பு, தொழில் வளர்ச்சி, நல்வாழ்வு, திறந்த கருத்துக்கள் மற்றும் ஒட்டுமொத்த பணியாளர் ஈடுபாட்டை உள்ளடக்கிய விரிவான 45 கேள்விகள் கொண்ட கணக்கெடுப்பு.',
            },
            targetAudience: 'All Employees & Staff',
            estimatedTimeMinutes: 10,
            questionCount: 45,
            sectionsCount: 9,
            tags: ['Workplace Culture', 'Satisfaction', 'Leadership', 'Teamwork', 'Career Development', 'Well-being', 'Engagement', 'Multi-Language'],
            isPublic: true,
            projectId: 'GLOBAL',
            pages: [
                // ----------------------------------------------------
                // PAGE 1: Section 1: Employee Information
                // ----------------------------------------------------
                {
                    pageId: 'P-1',
                    pageOrder: 1,
                    title: {
                        'en-US': 'Section 1: Employee Information',
                        'si-LK': '1 වන කොටස: සේවක තොරතුරු',
                        'ta-LK': 'பிரிவு 1: பணியாளர் தகவல்',
                    },
                    sections: [
                        {
                            sectionId: 'SEC-1',
                            sectionOrder: 1,
                            title: {
                                'en-US': 'Employee Demographics & Profile',
                                'si-LK': 'සේවක තොරතුරු සහ පසුබිම',
                                'ta-LK': 'பணியாளர் சுயவிவரம் மற்றும் தகவல்',
                            },
                            questions: [
                                {
                                    questionId: 'Q-DEM-01',
                                    type: 'SINGLE_CHOICE',
                                    groupId: 'DEMOGRAPHICS',
                                    prompt: {
                                        'en-US': 'Department',
                                        'si-LK': 'දෙපාර්තමේන්තුව',
                                        'ta-LK': 'துறை',
                                    },
                                    isMandatory: true,
                                    options: [
                                        {
                                            optionId: 'OPT-DEP-1',
                                            label: {
                                                'en-US': 'Human Resources',
                                                'si-LK': 'මානව සම්පත්',
                                                'ta-LK': 'மனித வளம்',
                                            },
                                            scoreValue: 1,
                                        },
                                        {
                                            optionId: 'OPT-DEP-2',
                                            label: {
                                                'en-US': 'Engineering & IT',
                                                'si-LK': 'ඉංජිනේරු සහ තොරතුරු තාක්ෂණ',
                                                'ta-LK': 'பொறியியல் மற்றும் தகவல் தொழில்நுட்பம்',
                                            },
                                            scoreValue: 2,
                                        },
                                        {
                                            optionId: 'OPT-DEP-3',
                                            label: {
                                                'en-US': 'Marketing & Communications',
                                                'si-LK': 'අලෙවිකරණ සහ සන්නිවේදන',
                                                'ta-LK': 'சந்தைப்படுத்தல் மற்றும் தகவல் தொடர்பு',
                                            },
                                            scoreValue: 3,
                                        },
                                        {
                                            optionId: 'OPT-DEP-4',
                                            label: {
                                                'en-US': 'Finance & Accounting',
                                                'si-LK': 'මූල්‍ය සහ ගිණුම්කරණ',
                                                'ta-LK': 'நிதி மற்றும் கணக்கியல்',
                                            },
                                            scoreValue: 4,
                                        },
                                        {
                                            optionId: 'OPT-DEP-5',
                                            label: {
                                                'en-US': 'Operations & Logistics',
                                                'si-LK': 'මෙහෙයුම් සහ සැපයුම්',
                                                'ta-LK': 'செயல்பாடுகள் மற்றும் தளவாடங்கள்',
                                            },
                                            scoreValue: 5,
                                        },
                                        {
                                            optionId: 'OPT-DEP-6',
                                            label: {
                                                'en-US': 'Sales & Customer Success',
                                                'si-LK': 'විකුණුම් සහ පාරිභෝගික සේවා',
                                                'ta-LK': 'விற்பனை மற்றும் வாடிக்கையாளர் வெற்றி',
                                            },
                                            scoreValue: 6,
                                        },
                                        {
                                            optionId: 'OPT-DEP-7',
                                            label: {
                                                'en-US': 'Other',
                                                'si-LK': 'වෙනත්',
                                                'ta-LK': 'மற்றவை',
                                            },
                                            scoreValue: 7,
                                        },
                                    ],
                                },
                                {
                                    questionId: 'Q-DEM-02',
                                    type: 'SHORT_TEXT',
                                    groupId: 'DEMOGRAPHICS',
                                    prompt: {
                                        'en-US': 'Job title',
                                        'si-LK': 'තනතුර / රැකියා නාමය',
                                        'ta-LK': 'வேலை தலைப்பு / பதவி',
                                    },
                                    isMandatory: true,
                                },
                                {
                                    questionId: 'Q-DEM-03',
                                    type: 'SINGLE_CHOICE',
                                    groupId: 'DEMOGRAPHICS',
                                    prompt: {
                                        'en-US': 'Length of service',
                                        'si-LK': 'සේවා කාලය',
                                        'ta-LK': 'சேவை காலம்',
                                    },
                                    isMandatory: true,
                                    options: [
                                        {
                                            optionId: 'OPT-SRV-1',
                                            label: {
                                                'en-US': 'Less than 1 year',
                                                'si-LK': 'වසර 1 කට අඩු',
                                                'ta-LK': '1 வருடத்திற்கும் குறைவான',
                                            },
                                            scoreValue: 1,
                                        },
                                        {
                                            optionId: 'OPT-SRV-2',
                                            label: {
                                                'en-US': '1–2 years',
                                                'si-LK': 'වසර 1–2',
                                                'ta-LK': '1–2 ஆண்டுகள்',
                                            },
                                            scoreValue: 2,
                                        },
                                        {
                                            optionId: 'OPT-SRV-3',
                                            label: {
                                                'en-US': '2–5 years',
                                                'si-LK': 'වසර 2–5',
                                                'ta-LK': '2–5 ஆண்டுகள்',
                                            },
                                            scoreValue: 3,
                                        },
                                        {
                                            optionId: 'OPT-SRV-4',
                                            label: {
                                                'en-US': '5–10 years',
                                                'si-LK': 'වසර 5–10',
                                                'ta-LK': '5–10 ஆண்டுகள்',
                                            },
                                            scoreValue: 4,
                                        },
                                        {
                                            optionId: 'OPT-SRV-5',
                                            label: {
                                                'en-US': 'More than 10 years',
                                                'si-LK': 'වසර 10 කට වැඩි',
                                                'ta-LK': '10 ஆண்டுகளுக்கு மேல்',
                                            },
                                            scoreValue: 5,
                                        },
                                    ],
                                },
                                {
                                    questionId: 'Q-DEM-04',
                                    type: 'SINGLE_CHOICE',
                                    groupId: 'DEMOGRAPHICS',
                                    prompt: {
                                        'en-US': 'Work arrangement',
                                        'si-LK': 'සේවා විධිවිධානය',
                                        'ta-LK': 'வேலை ஏற்பாடு',
                                    },
                                    isMandatory: true,
                                    options: [
                                        {
                                            optionId: 'OPT-WRK-1',
                                            label: {
                                                'en-US': 'On-site',
                                                'si-LK': 'ආයතනය තුළ (On-site)',
                                                'ta-LK': 'பணியிடத்தில் (On-site)',
                                            },
                                            scoreValue: 1,
                                        },
                                        {
                                            optionId: 'OPT-WRK-2',
                                            label: {
                                                'en-US': 'Hybrid',
                                                'si-LK': 'මිශ්‍ර (Hybrid)',
                                                'ta-LK': 'கலப்பு (Hybrid)',
                                            },
                                            scoreValue: 2,
                                        },
                                        {
                                            optionId: 'OPT-WRK-3',
                                            label: {
                                                'en-US': 'Remote',
                                                'si-LK': 'දුරස්ථ (Remote)',
                                                'ta-LK': 'தொலைநிலை (Remote)',
                                            },
                                            scoreValue: 3,
                                        },
                                    ],
                                },
                                {
                                    questionId: 'Q-DEM-05',
                                    type: 'SINGLE_CHOICE',
                                    groupId: 'DEMOGRAPHICS',
                                    prompt: {
                                        'en-US': 'Employment type',
                                        'si-LK': 'රැකියා වර්ගය',
                                        'ta-LK': 'வேலை வகை',
                                    },
                                    isMandatory: true,
                                    options: [
                                        {
                                            optionId: 'OPT-EMP-1',
                                            label: {
                                                'en-US': 'Full-time',
                                                'si-LK': 'පූර්ණ කාලීන',
                                                'ta-LK': 'முழு நேரம்',
                                            },
                                            scoreValue: 1,
                                        },
                                        {
                                            optionId: 'OPT-EMP-2',
                                            label: {
                                                'en-US': 'Part-time',
                                                'si-LK': 'අර්ධ කාලීන',
                                                'ta-LK': 'பகுதி நேரம்',
                                            },
                                            scoreValue: 2,
                                        },
                                        {
                                            optionId: 'OPT-EMP-3',
                                            label: {
                                                'en-US': 'Contract',
                                                'si-LK': 'කොන්ත්‍රාත් පදනම',
                                                'ta-LK': 'ஒப்பந்தம்',
                                            },
                                            scoreValue: 3,
                                        },
                                        {
                                            optionId: 'OPT-EMP-4',
                                            label: {
                                                'en-US': 'Internship',
                                                'si-LK': 'පුහුණුලාභී',
                                                'ta-LK': 'பயிற்சி காலம்',
                                            },
                                            scoreValue: 4,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                // ----------------------------------------------------
                // PAGE 2: Section 2: Workplace Satisfaction
                // ----------------------------------------------------
                {
                    pageId: 'P-2',
                    pageOrder: 2,
                    title: {
                        'en-US': 'Section 2: Workplace Satisfaction',
                        'si-LK': '2 වන කොටස: සේවා ස්ථාන තෘප්තිය',
                        'ta-LK': 'பிரிவு 2: பணியிட திருப்தி',
                    },
                    sections: [
                        {
                            sectionId: 'SEC-2',
                            sectionOrder: 1,
                            title: {
                                'en-US': 'Workplace Satisfaction',
                                'si-LK': 'සේවා ස්ථාන තෘප්තිය',
                                'ta-LK': 'பணியிட திருப்தி',
                            },
                            questions: [
                                {
                                    questionId: 'Q-SAT-01',
                                    type: 'LIKERT',
                                    groupId: 'WORKPLACE_SATISFACTION',
                                    prompt: {
                                        'en-US': 'I am satisfied with my current job.',
                                        'si-LK': 'මගේ වර්තමාන රැකියාව පිළිබඳව මම තෘප්තිමත් වෙමි.',
                                        'ta-LK': 'எனது தற்போதைய வேலையில் நான் திருப்தி அடைகிறேன்.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-SAT-02',
                                    type: 'LIKERT',
                                    groupId: 'WORKPLACE_SATISFACTION',
                                    prompt: {
                                        'en-US': 'I have the tools and resources needed to do my job effectively.',
                                        'si-LK': 'මගේ කාර්යය ඵලදායීව ඉටු කිරීමට අවශ්‍ය මෙවලම් සහ සම්පත් මා සතුව ඇත.',
                                        'ta-LK': 'எனது வேலையை திறம்பட செய்ய தேவையான கருவிகள் மற்றும் வளங்கள் என்னிடம் உள்ளன.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-SAT-03',
                                    type: 'LIKERT',
                                    groupId: 'WORKPLACE_SATISFACTION',
                                    prompt: {
                                        'en-US': 'My workload is manageable.',
                                        'si-LK': 'මගේ කාර්යභාරය සහ වැඩ ප්‍රමාණය කළමනාකරණය කළ හැකිය.',
                                        'ta-LK': 'எனது பணிச்சுமை சமாளிக்கக்கூடியதாக உள்ளது.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-SAT-04',
                                    type: 'LIKERT',
                                    groupId: 'WORKPLACE_SATISFACTION',
                                    prompt: {
                                        'en-US': 'I feel comfortable in my work environment.',
                                        'si-LK': 'මගේ සේවා පරිසරය තුළ මට පහසුවක් දැනේ.',
                                        'ta-LK': 'எனது வேலை சூழலில் நான் வசதியாக உணர்கிறேன்.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-SAT-05',
                                    type: 'LIKERT',
                                    groupId: 'WORKPLACE_SATISFACTION',
                                    prompt: {
                                        'en-US': 'I have a good work-life balance.',
                                        'si-LK': 'මට යහපත් රැකියා සහ පෞද්ගලික ජීවිත සමතුලිතතාවයක් ඇත.',
                                        'ta-LK': 'எனக்கு நல்ல வேலை-வாழ்க்கை சமநிலை உள்ளது.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-SAT-06',
                                    type: 'LIKERT',
                                    groupId: 'WORKPLACE_SATISFACTION',
                                    prompt: {
                                        'en-US': 'I would recommend this organization as a good place to work.',
                                        'si-LK': 'මෙම ආයතනය සේවය කිරීමට හොඳ ස්ථානයක් ලෙස මම නිර්දේශ කරමි.',
                                        'ta-LK': 'இந்த நிறுவனத்தை வேலை செய்ய ஒரு நல்ல இடமாக நான் பரிந்துரைக்கிறேன்.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                            ],
                        },
                    ],
                },
                // ----------------------------------------------------
                // PAGE 3: Section 3: Company Culture and Values
                // ----------------------------------------------------
                {
                    pageId: 'P-3',
                    pageOrder: 3,
                    title: {
                        'en-US': 'Section 3: Company Culture and Values',
                        'si-LK': '3 වන කොටස: සමාගම් සංස්කෘතිය සහ වටිනාකම්',
                        'ta-LK': 'பிரிவு 3: நிறுவன கலாச்சாரம் மற்றும் மதிப்புகள்',
                    },
                    sections: [
                        {
                            sectionId: 'SEC-3',
                            sectionOrder: 1,
                            title: {
                                'en-US': 'Company Culture and Values',
                                'si-LK': 'සමාගම් සංස්කෘතිය සහ වටිනාකම්',
                                'ta-LK': 'நிறுவன கலாச்சாரம் மற்றும் மதிப்புகள்',
                            },
                            questions: [
                                {
                                    questionId: 'Q-CUL-01',
                                    type: 'LIKERT',
                                    groupId: 'CULTURE_VALUES',
                                    prompt: {
                                        'en-US': 'The organization promotes respect and fairness.',
                                        'si-LK': 'ආයතනය ගෞරවය සහ සාධාරණත්වය ප්‍රවර්ධනය කරයි.',
                                        'ta-LK': 'நிறுவனம் மரியாதை மற்றும் நியாயத்தை ஊக்குவிக்கிறது.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-CUL-02',
                                    type: 'LIKERT',
                                    groupId: 'CULTURE_VALUES',
                                    prompt: {
                                        'en-US': 'Employees are treated equally regardless of their background.',
                                        'si-LK': 'සේවකයින්ගේ පසුබිම නොසලකා ඔවුන්ට සමානව සලකනු ලැබේ.',
                                        'ta-LK': 'பணியாளர்கள் அவர்களின் பின்னணியைப் பொருட்படுத்தாமல் சமமாக நடத்தப்படுகிறார்கள்.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-CUL-03',
                                    type: 'LIKERT',
                                    groupId: 'CULTURE_VALUES',
                                    prompt: {
                                        'en-US': 'The company’s values are reflected in everyday decisions.',
                                        'si-LK': 'සමාගමේ වටිනාකම් එදිනෙදා තීරණවලින් පිළිබිඹු වේ.',
                                        'ta-LK': 'நிறுவனத்தின் மதிப்புகள் அன்றாட முடிவுகளில் பிரதிபலிக்கின்றன.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-CUL-04',
                                    type: 'LIKERT',
                                    groupId: 'CULTURE_VALUES',
                                    prompt: {
                                        'en-US': 'Team members cooperate and support one another.',
                                        'si-LK': 'කණ්ඩායම් සාමාජිකයින් එකිනෙකා සමඟ සහයෝගයෙන් කටයුතු කර උදව් කරති.',
                                        'ta-LK': 'குழு உறுப்பினர்கள் ஒத்துழைத்து ஒருவருக்கொருவர் ஆதரவளிக்கின்றனர்.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-CUL-05',
                                    type: 'LIKERT',
                                    groupId: 'CULTURE_VALUES',
                                    prompt: {
                                        'en-US': 'I feel that I belong to this organization.',
                                        'si-LK': 'මම මෙම ආයතනයට අයත් බවක් මට දැනේ.',
                                        'ta-LK': 'நான் இந்த நிறுவனத்திற்கு சொந்தமானவன் என்பதை உணர்கிறேன்.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-CUL-06',
                                    type: 'LIKERT',
                                    groupId: 'CULTURE_VALUES',
                                    prompt: {
                                        'en-US': 'Different opinions and ideas are welcomed.',
                                        'si-LK': 'විවිධ අදහස් සහ යෝජනා සාදරයෙන් පිළිගනු ලැබේ.',
                                        'ta-LK': 'மாறுபட்ட கருத்துக்களும் யோசனைகளும் வரவேற்கப்படுகின்றன.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                            ],
                        },
                    ],
                },
                // ----------------------------------------------------
                // PAGE 4: Section 4: Leadership and Management
                // ----------------------------------------------------
                {
                    pageId: 'P-4',
                    pageOrder: 4,
                    title: {
                        'en-US': 'Section 4: Leadership and Management',
                        'si-LK': '4 වන කොටස: නායකත්වය සහ කළමනාකරණය',
                        'ta-LK': 'பிரிவு 4: தலைமைத்துவம் மற்றும் மேலாண்மை',
                    },
                    sections: [
                        {
                            sectionId: 'SEC-4',
                            sectionOrder: 1,
                            title: {
                                'en-US': 'Leadership and Management',
                                'si-LK': 'නායකත්වය සහ කළමනාකරණය',
                                'ta-LK': 'தலைமைத்துவம் மற்றும் மேலாண்மை',
                            },
                            questions: [
                                {
                                    questionId: 'Q-LDR-01',
                                    type: 'LIKERT',
                                    groupId: 'LEADERSHIP_MANAGEMENT',
                                    prompt: {
                                        'en-US': 'My manager communicates expectations clearly.',
                                        'si-LK': 'මගේ කළමනාකරු බලාපොරොත්තු පැහැදිලිව සන්නිවේදනය කරයි.',
                                        'ta-LK': 'எனது மேலாளர் எதிர்பார்ப்புகளை தெளிவாக தெரிவிக்கிறார்.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-LDR-02',
                                    type: 'LIKERT',
                                    groupId: 'LEADERSHIP_MANAGEMENT',
                                    prompt: {
                                        'en-US': 'My manager provides useful feedback.',
                                        'si-LK': 'මගේ කළමනාකරු ප්‍රයෝජනවත් ප්‍රතිපෝෂණ ලබා දෙයි.',
                                        'ta-LK': 'எனது மேலாளர் பயனுள்ள கருத்துக்களை வழங்குகிறார்.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-LDR-03',
                                    type: 'LIKERT',
                                    groupId: 'LEADERSHIP_MANAGEMENT',
                                    prompt: {
                                        'en-US': 'Management listens to employee concerns.',
                                        'si-LK': 'කළමනාකාරිත්වය සේවක ගැටළු වලට සවන් දෙයි.',
                                        'ta-LK': 'மேலாண்மை ஊழியர்களின் கவலைகளைக் கேட்கிறது.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-LDR-04',
                                    type: 'LIKERT',
                                    groupId: 'LEADERSHIP_MANAGEMENT',
                                    prompt: {
                                        'en-US': 'I receive recognition for my contributions.',
                                        'si-LK': 'මගේ දායකත්වය වෙනුවෙන් මට ඇගයීමක් ලැබේ.',
                                        'ta-LK': 'எனது பங்களிப்புகளுக்கு எனக்கு அங்கீகாரம் கிடைக்கிறது.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-LDR-05',
                                    type: 'LIKERT',
                                    groupId: 'LEADERSHIP_MANAGEMENT',
                                    prompt: {
                                        'en-US': 'I trust the decisions made by senior management.',
                                        'si-LK': 'ජ්‍යෙෂ්ඨ කළමනාකාරිත්වය ගන්නා තීරණ පිළිබඳව මට විශ්වාසයක් ඇත.',
                                        'ta-LK': 'உயர் நிர்வாகம் எடுக்கும் முடிவுகளை நான் நம்புகிறேன்.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                            ],
                        },
                    ],
                },
                // ----------------------------------------------------
                // PAGE 5: Section 5: Communication and Teamwork
                // ----------------------------------------------------
                {
                    pageId: 'P-5',
                    pageOrder: 5,
                    title: {
                        'en-US': 'Section 5: Communication and Teamwork',
                        'si-LK': '5 වන කොටස: සන්නිවේදනය සහ කණ්ඩායම් හැඟීම',
                        'ta-LK': 'பிரிவு 5: தகவல் தொடர்பு மற்றும் குழுப்பணி',
                    },
                    sections: [
                        {
                            sectionId: 'SEC-5',
                            sectionOrder: 1,
                            title: {
                                'en-US': 'Communication and Teamwork',
                                'si-LK': 'සන්නිවේදනය සහ කණ්ඩායම් හැඟීම',
                                'ta-LK': 'தகவல் தொடர்பு மற்றும் குழுப்பணி',
                            },
                            questions: [
                                {
                                    questionId: 'Q-COM-01',
                                    type: 'LIKERT',
                                    groupId: 'COMMUNICATION_TEAMWORK',
                                    prompt: {
                                        'en-US': 'Important workplace information is communicated clearly.',
                                        'si-LK': 'වැදගත් සේවා ස්ථාන තොරතුරු පැහැදිලිව සන්නිවේදනය කෙරේ.',
                                        'ta-LK': 'முக்கியமான பணியிடத் தகவல்கள் தெளிவாகத் தெரிவிக்கப்படுகின்றன.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-COM-02',
                                    type: 'LIKERT',
                                    groupId: 'COMMUNICATION_TEAMWORK',
                                    prompt: {
                                        'en-US': 'Departments work well together.',
                                        'si-LK': 'දෙපාර්තමේන්තු එකිනෙක මනාව සහයෝගයෙන් කටයුතු කරයි.',
                                        'ta-LK': 'துறைகள் ஒன்றாக இணைந்து சிறப்பாக செயல்படுகின்றன.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-COM-03',
                                    type: 'LIKERT',
                                    groupId: 'COMMUNICATION_TEAMWORK',
                                    prompt: {
                                        'en-US': 'I can openly share my ideas with colleagues.',
                                        'si-LK': 'සගයන් සමඟ මගේ අදහස් විවෘතව බෙදා ගැනීමට මට හැකිය.',
                                        'ta-LK': 'எனது கருத்துக்களை சகாக்களுடன் வெளிப்படையாகப் பகிர்ந்து கொள்ள முடிகிறது.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-COM-04',
                                    type: 'LIKERT',
                                    groupId: 'COMMUNICATION_TEAMWORK',
                                    prompt: {
                                        'en-US': 'Conflicts are handled professionally.',
                                        'si-LK': 'ගැටුම් වෘත්තීයමය මට්ටමින් විසඳනු ලැබේ.',
                                        'ta-LK': 'முரண்பாடுகள் தொழில்முறையாக கையாளப்படுகின்றன.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-COM-05',
                                    type: 'LIKERT',
                                    groupId: 'COMMUNICATION_TEAMWORK',
                                    prompt: {
                                        'en-US': 'I receive timely updates about organizational changes.',
                                        'si-LK': 'ආයතනික වෙනස්කම් පිළිබඳ කාලෝචිත යාවත්කාලීන කිරීම් මට ලැබේ.',
                                        'ta-LK': 'நிறுவன மாற்றங்கள் குறித்த சரியான நேரத்தில் அறிவிப்புகளைப் பெறுகிறேன்.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                            ],
                        },
                    ],
                },
                // ----------------------------------------------------
                // PAGE 6: Section 6: Learning and Career Development
                // ----------------------------------------------------
                {
                    pageId: 'P-6',
                    pageOrder: 6,
                    title: {
                        'en-US': 'Section 6: Learning and Career Development',
                        'si-LK': '6 වන කොටස: ඉගෙනීම සහ වෘත්තීය සංවර්ධනය',
                        'ta-LK': 'பிரிவு 6: கற்றல் மற்றும் தொழில் வளர்ச்சி',
                    },
                    sections: [
                        {
                            sectionId: 'SEC-6',
                            sectionOrder: 1,
                            title: {
                                'en-US': 'Learning and Career Development',
                                'si-LK': 'ඉගෙනීම සහ වෘත්තීය සංවර්ධනය',
                                'ta-LK': 'கற்றல் மற்றும் தொழில் வளர்ச்சி',
                            },
                            questions: [
                                {
                                    questionId: 'Q-DEV-01',
                                    type: 'LIKERT',
                                    groupId: 'CAREER_DEVELOPMENT',
                                    prompt: {
                                        'en-US': 'I have opportunities to develop new skills.',
                                        'si-LK': 'නව නිපුණතා වර්ධනය කර ගැනීමට මට අවස්ථා තිබේ.',
                                        'ta-LK': 'புதிய திறன்களை வளர்த்துக் கொள்ள எனக்கு வாய்ப்புகள் உள்ளன.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-DEV-02',
                                    type: 'LIKERT',
                                    groupId: 'CAREER_DEVELOPMENT',
                                    prompt: {
                                        'en-US': 'The organization supports employee training.',
                                        'si-LK': 'ආයතනය සේවක පුහුණුව සඳහා සහය දක්වයි.',
                                        'ta-LK': 'நிறுவனம் பணியாளர் பயிற்சிக்கு ஆதரவளிக்கிறது.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-DEV-03',
                                    type: 'LIKERT',
                                    groupId: 'CAREER_DEVELOPMENT',
                                    prompt: {
                                        'en-US': 'I understand the career opportunities available to me.',
                                        'si-LK': 'මට ඇති වෘත්තීය අවස්ථා පිළිබඳව මට පැහැදිලි අවබෝධයක් ඇත.',
                                        'ta-LK': 'எனக்கு கிடைக்கும் தொழில் வாய்ப்புகளை நான் புரிந்துகொள்கிறேன்.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-DEV-04',
                                    type: 'LIKERT',
                                    groupId: 'CAREER_DEVELOPMENT',
                                    prompt: {
                                        'en-US': 'My performance is evaluated fairly.',
                                        'si-LK': 'මගේ කාර්ය සාධනය සාධාරණ ලෙස ඇගයීමට ලක් කෙරේ.',
                                        'ta-LK': 'எனது செயல்திறன் நியாயமாக மதிப்பிடப்படுகிறது.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-DEV-05',
                                    type: 'LIKERT',
                                    groupId: 'CAREER_DEVELOPMENT',
                                    prompt: {
                                        'en-US': 'I see a future for myself in this organization.',
                                        'si-LK': 'මෙම ආයතනය තුළ මගේ අනාගතය පිළිබඳව පැහැදිලි දැක්මක් මට ඇත.',
                                        'ta-LK': 'இந்த நிறுவனத்தில் எனக்கான ஒரு எதிர்காலத்தை நான் காண்கிறேன்.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                            ],
                        },
                    ],
                },
                // ----------------------------------------------------
                // PAGE 7: Section 7: Employee Well-being and Inclusion
                // ----------------------------------------------------
                {
                    pageId: 'P-7',
                    pageOrder: 7,
                    title: {
                        'en-US': 'Section 7: Employee Well-being and Inclusion',
                        'si-LK': '7 වන කොටස: සේවක යහපැවැත්ම සහ අන්තර්ගතය',
                        'ta-LK': 'பிரிவு 7: பணியாளர் நல்வாழ்வு மற்றும் உள்ளடக்கம்',
                    },
                    sections: [
                        {
                            sectionId: 'SEC-7',
                            sectionOrder: 1,
                            title: {
                                'en-US': 'Employee Well-being and Inclusion',
                                'si-LK': 'සේවක යහපැවැත්ම සහ අන්තර්ගතය',
                                'ta-LK': 'பணியாளர் நல்வாழ்வு மற்றும் உள்ளடக்கம்',
                            },
                            questions: [
                                {
                                    questionId: 'Q-WEL-01',
                                    type: 'LIKERT',
                                    groupId: 'WELLBEING_INCLUSION',
                                    prompt: {
                                        'en-US': 'My workplace supports employee mental well-being.',
                                        'si-LK': 'මගේ සේවා ස්ථානය සේවකයින්ගේ මානසික යහපැවැත්මට සහය දක්වයි.',
                                        'ta-LK': 'எனது பணியிடம் ஊழியர்களின் மனநல நல்வாழ்வை ஆதரிக்கிறது.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-WEL-02',
                                    type: 'LIKERT',
                                    groupId: 'WELLBEING_INCLUSION',
                                    prompt: {
                                        'en-US': 'I feel safe expressing concerns without fear of retaliation.',
                                        'si-LK': 'පළිගැනීමේ බියෙන් තොරව ගැටළු ඉදිරිපත් කිරීමට මට ආරක්ෂිත බවක් දැනේ.',
                                        'ta-LK': 'பழிவாங்குதல் பயமின்றி கவலைகளை வெளிப்படுத்த பாதுகாப்பாக உணர்கிறேன்.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-WEL-03',
                                    type: 'LIKERT',
                                    groupId: 'WELLBEING_INCLUSION',
                                    prompt: {
                                        'en-US': 'The organization promotes a healthy work environment.',
                                        'si-LK': 'ආයතනය සෞඛ්‍ය සම්පන්න සේවා පරිසරයක් ප්‍රවර්ධනය කරයි.',
                                        'ta-LK': 'நிறுவனம் ஆரோக்கியமான வேலை சூழலை ஊக்குவிக்கிறது.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-WEL-04',
                                    type: 'LIKERT',
                                    groupId: 'WELLBEING_INCLUSION',
                                    prompt: {
                                        'en-US': 'I feel included and respected by my colleagues.',
                                        'si-LK': 'මගේ සගයන් මා පිළිගන්නා අතර මට ගරු කරන බවක් දැනේ.',
                                        'ta-LK': 'எனது சகாக்களால் நான் மதிக்கப்படுவதாகவும் சேர்க்கப்படுவதாகவும் உணர்கிறேன்.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-WEL-05',
                                    type: 'LIKERT',
                                    groupId: 'WELLBEING_INCLUSION',
                                    prompt: {
                                        'en-US': 'The organization takes employee feedback seriously.',
                                        'si-LK': 'ආයතනය සේවක ප්‍රතිපෝෂණ බැරෑරුම් ලෙස සලකයි.',
                                        'ta-LK': 'நிறுவனம் ஊழியர்களின் கருத்துக்களை தீவிரமாக எடுத்துக்கொள்கிறது.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                            ],
                        },
                    ],
                },
                // ----------------------------------------------------
                // PAGE 8: Section 8: Open-Ended Questions
                // ----------------------------------------------------
                {
                    pageId: 'P-8',
                    pageOrder: 8,
                    title: {
                        'en-US': 'Section 8: Open-Ended Questions',
                        'si-LK': '8 වන කොටස: විවෘත අදහස් සහ යෝජනා',
                        'ta-LK': 'பிரிவு 8: திறந்த கேள்விகள் மற்றும் பரிந்துரைகள்',
                    },
                    sections: [
                        {
                            sectionId: 'SEC-8',
                            sectionOrder: 1,
                            title: {
                                'en-US': 'Open Qualitative Feedback',
                                'si-LK': 'විවෘත ගුණාත්මක ප්‍රතිපෝෂණ',
                                'ta-LK': 'திறந்த தரமான கருத்துக்கள்',
                            },
                            questions: [
                                {
                                    questionId: 'Q-OPN-01',
                                    type: 'LONG_TEXT',
                                    groupId: 'QUALITATIVE_FEEDBACK',
                                    prompt: {
                                        'en-US': 'What do you like most about working here?',
                                        'si-LK': 'මෙහි සේවය කිරීමේදී ඔබ වඩාත්ම ප්‍රිය කරන දෙය කුමක්ද?',
                                        'ta-LK': 'இங்கு வேலை செய்வதில் உங்களுக்கு மிகவும் பிடித்தது எது?',
                                    },
                                    isMandatory: false,
                                },
                                {
                                    questionId: 'Q-OPN-02',
                                    type: 'LONG_TEXT',
                                    groupId: 'QUALITATIVE_FEEDBACK',
                                    prompt: {
                                        'en-US': 'What is one thing the organization could improve?',
                                        'si-LK': 'ආයතනය වැඩිදියුණු කළ හැකි එක් ප්‍රධාන කරුණක් කුමක්ද?',
                                        'ta-LK': 'நிறுவனம் மேம்படுத்தக்கூடிய ஒரு விஷயம் எது?',
                                    },
                                    isMandatory: false,
                                },
                                {
                                    questionId: 'Q-OPN-03',
                                    type: 'LONG_TEXT',
                                    groupId: 'QUALITATIVE_FEEDBACK',
                                    prompt: {
                                        'en-US': 'What would help you become more productive?',
                                        'si-LK': 'ඔබට වඩාත් ඵලදායී වීමට උපකාරී වන්නේ කුමක්ද?',
                                        'ta-LK': 'நீங்கள் அதிக உற்பத்தித்திறன் கொண்டவராக மாற எது உதவும்?',
                                    },
                                    isMandatory: false,
                                },
                                {
                                    questionId: 'Q-OPN-04',
                                    type: 'LONG_TEXT',
                                    groupId: 'QUALITATIVE_FEEDBACK',
                                    prompt: {
                                        'en-US': 'What changes would improve the workplace culture?',
                                        'si-LK': 'සේවා ස්ථාන සංස්කෘතිය වැඩිදියුණු කිරීමට හේතුවන වෙනස්කම් මොනවාද?',
                                        'ta-LK': 'பணியிட கலாச்சாரத்தை மேம்படுத்த என்ன மாற்றங்கள் உதவும்?',
                                    },
                                    isMandatory: false,
                                },
                                {
                                    questionId: 'Q-OPN-05',
                                    type: 'LONG_TEXT',
                                    groupId: 'QUALITATIVE_FEEDBACK',
                                    prompt: {
                                        'en-US': 'Do you have any additional suggestions for management?',
                                        'si-LK': 'කළමනාකාරිත්වය සඳහා ඔබට ඇති අමතර යෝජනා මොනවාද?',
                                        'ta-LK': 'மேலாண்மைக்கு ஏதேனும் கூடுதல் பரிந்துரைகள் உள்ளதா?',
                                    },
                                    isMandatory: false,
                                },
                            ],
                        },
                    ],
                },
                // ----------------------------------------------------
                // PAGE 9: Section 9: Overall Employee Engagement
                // ----------------------------------------------------
                {
                    pageId: 'P-9',
                    pageOrder: 9,
                    title: {
                        'en-US': 'Section 9: Overall Employee Engagement',
                        'si-LK': '9 වන කොටස: සමස්ත සේවක සහභාගීත්වය',
                        'ta-LK': 'பிரிவு 9: ஒட்டுமொத்த பணியாளர் ஈடுபாடு',
                    },
                    sections: [
                        {
                            sectionId: 'SEC-9',
                            sectionOrder: 1,
                            title: {
                                'en-US': 'Overall Employee Engagement',
                                'si-LK': 'සමස්ත සේවක සහභාගීත්වය',
                                'ta-LK': 'ஒட்டுமொத்த பணியாளர் ஈடுபாடு',
                            },
                            questions: [
                                {
                                    questionId: 'Q-ENG-01',
                                    type: 'LIKERT',
                                    groupId: 'OVERALL_ENGAGEMENT',
                                    prompt: {
                                        'en-US': 'Overall, how satisfied are you with your workplace?',
                                        'si-LK': 'සමස්තයක් ලෙස, ඔබේ සේවා ස්ථානය පිළිබඳව ඔබ කොතරම් තෘප්තිමත්ද?',
                                        'ta-LK': 'ஒட்டுமொத்தமாக, உங்கள் பணியிடத்தில் நீங்கள் எவ்வளவு திருப்தி அடைகிறீர்கள்?',
                                    },
                                    isMandatory: true,
                                    options: [
                                        {
                                            optionId: 'OPT-SAT-1',
                                            label: {
                                                'en-US': '1 — Very Dissatisfied',
                                                'si-LK': '1 — ඉතා අතෘප්තිමත්',
                                                'ta-LK': '1 — மிகவும் அதிருப்தி',
                                            },
                                            scoreValue: 1,
                                        },
                                        {
                                            optionId: 'OPT-SAT-2',
                                            label: {
                                                'en-US': '2 — Dissatisfied',
                                                'si-LK': '2 — අතෘප්තිමත්',
                                                'ta-LK': '2 — அதிருப்தி',
                                            },
                                            scoreValue: 2,
                                        },
                                        {
                                            optionId: 'OPT-SAT-3',
                                            label: {
                                                'en-US': '3 — Neutral',
                                                'si-LK': '3 — මධ්‍යස්ථයි',
                                                'ta-LK': '3 — நடுநிலை',
                                            },
                                            scoreValue: 3,
                                        },
                                        {
                                            optionId: 'OPT-SAT-4',
                                            label: {
                                                'en-US': '4 — Satisfied',
                                                'si-LK': '4 — තෘප්තිමත්',
                                                'ta-LK': '4 — திருப்தி',
                                            },
                                            scoreValue: 4,
                                        },
                                        {
                                            optionId: 'OPT-SAT-5',
                                            label: {
                                                'en-US': '5 — Very Satisfied',
                                                'si-LK': '5 — ඉතා තෘප්තිමත්',
                                                'ta-LK': '5 — மிகவும் திருப்தி',
                                            },
                                            scoreValue: 5,
                                        },
                                    ],
                                },
                                {
                                    questionId: 'Q-ENG-02',
                                    type: 'LIKERT',
                                    groupId: 'OVERALL_ENGAGEMENT',
                                    prompt: {
                                        'en-US': "How motivated are you to contribute to the organization's success?",
                                        'si-LK': 'ආයතනයේ සාර්ථකත්වයට දායක වීමට ඔබ කොතරම් උනන්දුද?',
                                        'ta-LK': 'நிறுவனத்தின் வெற்றிக்கு பங்களிக்க நீங்கள் எவ்வளவு உந்துதலாக இருக்கிறீர்கள்?',
                                    },
                                    isMandatory: true,
                                    options: [
                                        {
                                            optionId: 'OPT-MOT-1',
                                            label: {
                                                'en-US': '1 — Not Motivated',
                                                'si-LK': '1 — උනන්දුවක් නැත',
                                                'ta-LK': '1 — உந்துதல் இல்லை',
                                            },
                                            scoreValue: 1,
                                        },
                                        {
                                            optionId: 'OPT-MOT-2',
                                            label: {
                                                'en-US': '2 — Slightly Motivated',
                                                'si-LK': '2 — තරමක් උනන්දුයි',
                                                'ta-LK': '2 — சற்று உந்துதல்',
                                            },
                                            scoreValue: 2,
                                        },
                                        {
                                            optionId: 'OPT-MOT-3',
                                            label: {
                                                'en-US': '3 — Neutral',
                                                'si-LK': '3 — මධ්‍යස්ථයි',
                                                'ta-LK': '3 — நடுநிலை',
                                            },
                                            scoreValue: 3,
                                        },
                                        {
                                            optionId: 'OPT-MOT-4',
                                            label: {
                                                'en-US': '4 — Motivated',
                                                'si-LK': '4 — උනන්දුයි',
                                                'ta-LK': '4 — உந்துதலாக உள்ளேன்',
                                            },
                                            scoreValue: 4,
                                        },
                                        {
                                            optionId: 'OPT-MOT-5',
                                            label: {
                                                'en-US': '5 — Highly Motivated',
                                                'si-LK': '5 — ඉතා උනන්දුයි',
                                                'ta-LK': '5 — அதிக உந்துதல்',
                                            },
                                            scoreValue: 5,
                                        },
                                    ],
                                },
                                {
                                    questionId: 'Q-ENG-03',
                                    type: 'LIKERT',
                                    groupId: 'OVERALL_ENGAGEMENT',
                                    prompt: {
                                        'en-US': 'How likely are you to remain with the organization for the next two years?',
                                        'si-LK': 'ඉදිරි වසර දෙක තුළ ඔබ ආයතනයේ රැඳී සිටීමට ඇති ඉඩකඩ කොපමණද?',
                                        'ta-LK': 'அடுத்த இரண்டு ஆண்டுகளுக்கு நிறுவனத்தில் நீங்கள் நீடிப்பதற்கான வாய்ப்பு எவ்வளவு?',
                                    },
                                    isMandatory: true,
                                    options: [
                                        {
                                            optionId: 'OPT-RET-1',
                                            label: {
                                                'en-US': '1 — Highly Unlikely',
                                                'si-LK': '1 — ඉතා අඩු ඉඩකඩක්',
                                                'ta-LK': '1 — மிகவும் சாத்தியமில்லை',
                                            },
                                            scoreValue: 1,
                                        },
                                        {
                                            optionId: 'OPT-RET-2',
                                            label: {
                                                'en-US': '2 — Unlikely',
                                                'si-LK': '2 — අඩු ඉඩකඩක්',
                                                'ta-LK': '2 — சாத்தியமில்லை',
                                            },
                                            scoreValue: 2,
                                        },
                                        {
                                            optionId: 'OPT-RET-3',
                                            label: {
                                                'en-US': '3 — Neutral',
                                                'si-LK': '3 — මධ්‍යස්ථයි',
                                                'ta-LK': '3 — நடுநிலை',
                                            },
                                            scoreValue: 3,
                                        },
                                        {
                                            optionId: 'OPT-RET-4',
                                            label: {
                                                'en-US': '4 — Likely',
                                                'si-LK': '4 — ඉඩකඩ ඇත',
                                                'ta-LK': '4 — சாத்தியம்',
                                            },
                                            scoreValue: 4,
                                        },
                                        {
                                            optionId: 'OPT-RET-5',
                                            label: {
                                                'en-US': '5 — Highly Likely',
                                                'si-LK': '5 — ඉතා වැඩි ඉඩකඩක්',
                                                'ta-LK': '5 — அதிக சாத்தியம்',
                                            },
                                            scoreValue: 5,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        };
        // ==========================================
        // TEMPLATE 2: Executive Leadership & Psychological Safety Pulse (10 Questions, 2 Sections)
        // ==========================================
        const execPulseTemplate = {
            templateId: 'TMPL-EXEC-PULSE-2026',
            name: {
                'en-US': 'Executive Leadership & Psychological Safety Pulse',
                'si-LK': 'විධායක නායකත්වය සහ මානසික ආරක්ෂණ ක්ෂණික සමීක්ෂණය',
                'ta-LK': 'நிர்வாக தலைமைத்துவம் மற்றும் உளவியல் பாதுகாப்பு துடிப்பு கணக்கெடுப்பு',
            },
            category: 'Leadership & Pulse',
            description: {
                'en-US': 'Quick 10-question pulse survey assessing executive trust, psychological safety, and operational transparency across business units.',
                'si-LK': 'ව්‍යාපාරික ඒකක පුරා විධායක විශ්වාසය, මානසික ආරක්ෂාව සහ මෙහෙයුම් විනිවිදභාවය ඇගයීමට ලක් කරන කෙටි ප්‍රශ්න 10 ක සමීක්ෂණය.',
                'ta-LK': 'வணிகப் பிரிவுகளில் நிர்வாக நம்பிக்கை, உளவியல் பாதுகாப்பு மற்றும் செயல்பாட்டு வெளிப்படைத்தன்மையை மதிப்பிடும் விரைவான 10-கேள்விகள் கொண்ட கணக்கெடுப்பு.',
            },
            targetAudience: 'All Teams',
            estimatedTimeMinutes: 3,
            questionCount: 10,
            sectionsCount: 2,
            tags: ['Leadership', 'Psychological Safety', 'Pulse', 'Fast Response', 'Multi-Language'],
            isPublic: true,
            projectId: 'GLOBAL',
            pages: [
                {
                    pageId: 'P-1',
                    pageOrder: 1,
                    title: {
                        'en-US': 'Executive Trust & Direction',
                        'si-LK': 'විධායක විශ්වාසය සහ මඟපෙන්වීම',
                        'ta-LK': 'நிர்வாக நம்பிக்கை மற்றும் வழிகாட்டுதல்',
                    },
                    sections: [
                        {
                            sectionId: 'SEC-1',
                            sectionOrder: 1,
                            title: {
                                'en-US': 'Strategic Vision & Trust',
                                'si-LK': 'උපායමාර්ගික දැක්ම සහ විශ්වාසය',
                                'ta-LK': 'மூலோபாய பார்வை மற்றும் நம்பிக்கை',
                            },
                            questions: [
                                {
                                    questionId: 'Q-PLS-01',
                                    type: 'LIKERT',
                                    groupId: 'LEADERSHIP_TRUST',
                                    prompt: {
                                        'en-US': 'I have confidence in the strategic vision set forth by executive leadership.',
                                        'si-LK': 'විධායක නායකත්වය විසින් ඉදිරිපත් කරන ලද උපායමාර්ගික දැක්ම පිළිබඳව මට විශ්වාසයක් ඇත.',
                                        'ta-LK': 'நிர்வாக தலைமைத்துவத்தால் முன்வைக்கப்பட்ட மூலோபாய பார்வையில் எனக்கு நம்பிக்கை உள்ளது.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-PLS-02',
                                    type: 'LIKERT',
                                    groupId: 'LEADERSHIP_TRUST',
                                    prompt: {
                                        'en-US': 'Leadership communicates company decisions with transparency and clarity.',
                                        'si-LK': 'නායකත්වය සමාගමේ තීරණ විනිවිදභාවයෙන් හා පැහැදිලිව සන්නිවේදනය කරයි.',
                                        'ta-LK': 'தலைமை நிறுவன முடிவுகளை வெளிப்படைத்தன்மையுடனும் தெளிவுடனும் தொடர்பு கொள்கிறது.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-PLS-03',
                                    type: 'LIKERT',
                                    groupId: 'PSYCHOLOGICAL_SAFETY',
                                    prompt: {
                                        'en-US': 'I feel comfortable raising difficult issues or pointing out mistakes without fear of blame.',
                                        'si-LK': 'දොස් පැවරීමේ බියෙන් තොරව දුෂ්කර කරුණු මතු කිරීමට හෝ වැරදි පෙන්වා දීමට මට පහසුවක් දැනේ.',
                                        'ta-LK': 'பழிச்சொல் பயமின்றி கடினமான பிரச்சினைகளை எழுப்பவோ அல்லது தவறுகளை சுட்டிக்காட்டவோ வசதியாக உணர்கிறேன்.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-PLS-04',
                                    type: 'LIKERT',
                                    groupId: 'PSYCHOLOGICAL_SAFETY',
                                    prompt: {
                                        'en-US': 'Team members value and respect unique perspectives and diverse ideas.',
                                        'si-LK': 'කණ්ඩායම් සාමාජිකයින් විවිධ අදහස් සහ අද්විතීය ඉදිරිපත් කිරීම් අගය කරති.',
                                        'ta-LK': 'குழு உறுப்பினர்கள் தனித்துவமான கண்ணோட்டங்களையும் மாறுபட்ட யோசனைகளையும் மதிக்கிறார்கள்.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-PLS-05',
                                    type: 'LIKERT',
                                    groupId: 'RECOGNITION',
                                    prompt: {
                                        'en-US': 'I receive regular, meaningful recognition when I contribute to impactful outcomes.',
                                        'si-LK': 'මම වැදගත් ප්‍රතිඵල සඳහා දායක වන විට මට නිතිපතා අර්ථවත් ඇගයීමක් ලැබේ.',
                                        'ta-LK': 'தாக்கத்தை ஏற்படுத்தும் விளைவுகளுக்கு நான் பங்களிக்கும் போது வழக்கமான, அர்த்தமுள்ள அங்கீகாரத்தைப் பெறுகிறேன்.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                            ],
                        },
                    ],
                },
                {
                    pageId: 'P-2',
                    pageOrder: 2,
                    title: {
                        'en-US': 'Operational Agility & Feedback',
                        'si-LK': 'මෙහෙයුම් කඩිනම්භාවය සහ ප්‍රතිපෝෂණ',
                        'ta-LK': 'செயல்பாட்டு சுறுசுறுப்பு மற்றும் கருத்துக்கள்',
                    },
                    sections: [
                        {
                            sectionId: 'SEC-2',
                            sectionOrder: 1,
                            title: {
                                'en-US': 'Execution & Collaboration',
                                'si-LK': 'ක්‍රියාත්මක කිරීම සහ සහයෝගීතාව',
                                'ta-LK': 'செயல்படுத்துதல் மற்றும் ஒத்துழைப்பு',
                            },
                            questions: [
                                {
                                    questionId: 'Q-PLS-06',
                                    type: 'LIKERT',
                                    groupId: 'OPERATIONAL_AGILITY',
                                    prompt: {
                                        'en-US': 'Our internal processes allow us to respond rapidly to changing customer and business needs.',
                                        'si-LK': 'අපගේ අභ්‍යන්තර ක්‍රියාවලීන් වෙනස්වන පාරිභෝගික සහ ව්‍යාපාරික අවශ්‍යතාවලට වේගයෙන් ප්‍රතිචාර දැක්වීමට ඉඩ සලසයි.',
                                        'ta-LK': 'எங்கள் உள் செயல்முறைகள் மாறிவரும் வாடிக்கையாளர் மற்றும் வணிகத் தேவைகளுக்கு விரைவாக பதிலளிக்க அனுமதிக்கின்றன.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-PLS-07',
                                    type: 'LIKERT',
                                    groupId: 'CROSS_COLLABORATION',
                                    prompt: {
                                        'en-US': 'Inter-departmental collaboration is smooth and free of unnecessary friction.',
                                        'si-LK': 'දෙපාර්තමේන්තු අතර සහයෝගීතාවය බාධාවකින් තොරව සුමටව ක්‍රියාත්මක වේ.',
                                        'ta-LK': 'துறைகளுக்கு இடையேயான ஒத்துழைப்பு சீராகவும் தேவையற்ற உராய்வுகள் இன்றியும் உள்ளது.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-PLS-08',
                                    type: 'LIKERT',
                                    groupId: 'RESOURCE_ADEQUACY',
                                    prompt: {
                                        'en-US': 'I have the bandwidth and resources required to deliver high-quality work.',
                                        'si-LK': 'උසස් තත්ත්වයේ කාර්යයන් ඉටු කිරීම සඳහා අවශ්‍ය සම්පත් සහ කාලය මා සතුව ඇත.',
                                        'ta-LK': 'உயர்தர வேலையை வழங்க எனக்கு தேவையான வளங்களும் நேரமும் உள்ளன.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-PLS-09',
                                    type: 'NPS',
                                    groupId: 'eNPS',
                                    prompt: {
                                        'en-US': 'How likely are you to recommend our company as a top employer to professional contacts?',
                                        'si-LK': 'අපගේ සමාගම විශිෂ්ට සේවා ස්ථානයක් ලෙස මිතුරන්ට නිර්දේශ කිරීමට ඇති ඉඩකඩ කොපමණද?',
                                        'ta-LK': 'எங்கள் நிறுவனத்தை ஒரு சிறந்த முதலாளியாக தொழில்முறை தொடர்புகளுக்கு பரிந்துரைப்பதற்கான வாய்ப்பு எவ்வளவு?',
                                    },
                                    isMandatory: true,
                                },
                                {
                                    questionId: 'Q-PLS-10',
                                    type: 'LONG_TEXT',
                                    groupId: 'QUALITATIVE_FEEDBACK',
                                    prompt: {
                                        'en-US': 'What is the single most urgent priority our leadership team should address today?',
                                        'si-LK': 'අපගේ නායකත්ව කණ්ඩායම අද අවධානය යොමු කළ යුතු වඩාත්ම හදිසි ප්‍රමුඛතාවය කුමක්ද?',
                                        'ta-LK': 'எங்கள் தலைமை குழு இன்று கவனிக்க வேண்டிய மிக அவசர முன்னுரிமை எது?',
                                    },
                                    isMandatory: false,
                                },
                            ],
                        },
                    ],
                },
            ],
        };
        // ==========================================
        // TEMPLATE 3: eNPS & Employee Retention Pulse (5 Questions, 1 Section)
        // ==========================================
        const enpsQuickTemplate = {
            templateId: 'TMPL-ENPS-QUICK-2026',
            name: {
                'en-US': 'eNPS & Employee Retention Pulse',
                'si-LK': 'eNPS සහ සේවක රඳවා ගැනීමේ ක්ෂණික සමීක්ෂණය',
                'ta-LK': 'eNPS மற்றும் பணியாளர் தக்கவைப்பு துடிப்பு கணக்கெடுப்பு',
            },
            category: 'Engagement & Retention',
            description: {
                'en-US': 'Short 5-question eNPS pulse evaluating employee advocacy, satisfaction, and flight risk.',
                'si-LK': 'සේවක අනුමැතිය, රැකියා තෘප්තිය සහ සේවය හැරයාමේ අවදානම ඇගයීමට ලක් කෙරෙන කෙටි ප්‍රශ්න 5 ක සමීක්ෂණය.',
                'ta-LK': 'பணியாளர் ஆதரவு, திருப்தி மற்றும் விலகல் அபாயத்தை மதிப்பிடும் குறுகிய 5-கேள்விகள் கொண்ட கணக்கெடுப்பு.',
            },
            targetAudience: 'All Employees',
            estimatedTimeMinutes: 2,
            questionCount: 5,
            sectionsCount: 1,
            tags: ['eNPS', 'Advocacy', 'Retention', 'Pulse', 'Multi-Language'],
            isPublic: true,
            projectId: 'GLOBAL',
            pages: [
                {
                    pageId: 'P-1',
                    pageOrder: 1,
                    title: {
                        'en-US': 'eNPS & Retention Pulse',
                        'si-LK': 'eNPS සහ සේවක රඳවා ගැනීම',
                        'ta-LK': 'eNPS மற்றும் பணியாளர் தக்கவைப்பு',
                    },
                    sections: [
                        {
                            sectionId: 'SEC-1',
                            sectionOrder: 1,
                            title: {
                                'en-US': 'Employee Advocacy & Alignment',
                                'si-LK': 'සේවක අනුමැතිය සහ පෙළගැස්ම',
                                'ta-LK': 'பணியாளர் ஆதரவு மற்றும் சீரமைப்பு',
                            },
                            questions: [
                                {
                                    questionId: 'Q-ENPS-01',
                                    type: 'NPS',
                                    groupId: 'eNPS',
                                    prompt: {
                                        'en-US': 'On a scale of 0 to 10, how likely are you to recommend working at Talnova to a friend or colleague?',
                                        'si-LK': '0 සිට 10 දක්වා වූ පරිමාණයක, මිතුරෙකුට හෝ සගයෙකුට තල්නෝවා හි සේවය නිර්දේශ කිරීමට ඔබ කොතරම් දුරට නැඹුරුද?',
                                        'ta-LK': '0 முதல் 10 வரையிலான அளவில், தல்னோவாவில் வேலை செய்வதை ஒரு நண்பர் அல்லது சகாவுக்கு பரிந்துரைக்க எவ்வளவு வாய்ப்புள்ளது?',
                                    },
                                    isMandatory: true,
                                },
                                {
                                    questionId: 'Q-ENPS-02',
                                    type: 'LIKERT',
                                    groupId: 'RETENTION_INTENT',
                                    prompt: {
                                        'en-US': 'I plan to continue working at this organization for at least the next 12 months.',
                                        'si-LK': 'ඉදිරි මාස 12 තුළ මෙම ආයතනයේ අඛණ්ඩව සේවය කිරීමට මම සැලසුම් කරමි.',
                                        'ta-LK': 'அடுத்த 12 மாதங்களுக்கு இந்த நிறுவனத்தில் தொடர்ந்து பணியாற்ற திட்டமிட்டுள்ளேன்.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-ENPS-03',
                                    type: 'LIKERT',
                                    groupId: 'EMPLOYEE_ENGAGEMENT',
                                    prompt: {
                                        'en-US': 'I feel energized and inspired by my everyday work contributions.',
                                        'si-LK': 'මගේ එදිනෙදා කාර්යභාරය තුළින් මම ප්‍රබෝධමත් හා උද්යෝගිමත් බවක් ලබමි.',
                                        'ta-LK': 'எனது அன்றாட வேலைப் பங்களிப்புகளால் நான் உற்சாகமாகவும் ஊக்கமாகவும் உணர்கிறேன்.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-ENPS-04',
                                    type: 'LIKERT',
                                    groupId: 'COMPANY_PRIDE',
                                    prompt: {
                                        'en-US': "I am proud to tell people that I work for this company.",
                                        'si-LK': 'මම මෙම සමාගමේ සේවය කරන බව අන් අයට පැවසීමට ආඩම්බර වෙමි.',
                                        'ta-LK': 'இந்த நிறுவனத்தில் பணிபுரிவதாக பிறரிடம் கூறுவதில் பெருமை கொள்கிறேன்.',
                                    },
                                    isMandatory: true,
                                    options: standardLikertOptions,
                                },
                                {
                                    questionId: 'Q-ENPS-05',
                                    type: 'LONG_TEXT',
                                    groupId: 'QUALITATIVE_FEEDBACK',
                                    prompt: {
                                        'en-US': 'What is the primary factor driving your score above?',
                                        'si-LK': 'ඉහත ඔබ ලබා දුන් ලකුණට බලපෑ ප්‍රධාන හේතුව කුමක්ද?',
                                        'ta-LK': 'மேலே உள்ள உங்கள் மதிப்பீட்டை தீர்மானித்த முதன்மை காரணி எது?',
                                    },
                                    isMandatory: false,
                                },
                            ],
                        },
                    ],
                },
            ],
        };
        return [workplaceCultureTemplate, execPulseTemplate, enpsQuickTemplate];
    }
}
exports.SurveyTemplateSeederService = SurveyTemplateSeederService;
//# sourceMappingURL=survey-template-seeder.service.js.map