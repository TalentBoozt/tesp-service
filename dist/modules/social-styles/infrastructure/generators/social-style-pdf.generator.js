"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialStylePdfGenerator = void 0;
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const answer_key_v1_definition_1 = require("../../domain/constants/answer-key-v1.definition");
const style_interpretations_definition_1 = require("../../domain/constants/style-interpretations.definition");
const questionnaire_v1_definition_1 = require("../../domain/constants/questionnaire-v1.definition");
const social_style_graph_service_1 = require("../../domain/services/social-style-graph.service");
/**
 * Dedicated PDF Report Generator for the DAASH Global / Talnova Social Styles Assessment Module.
 * - Renders both approved visualizations (Visualization A: Four-Axis Profile & Visualization B: Net Balance Coordinate)
 *   using deterministic vector graphics.
 * - Embeds OFL-licensed Noto Sans, Noto Sans Sinhala, and Noto Sans Tamil TrueType fonts with script-run switching
 *   so mixed English + Sinhala/Tamil strings render with 100% glyph coverage.
 */
class SocialStylePdfGenerator {
    graphService = new social_style_graph_service_1.SocialStyleGraphService();
    static sharedSimulateNextFailure = false;
    injectFaultNextGeneration() {
        SocialStylePdfGenerator.sharedSimulateNextFailure = true;
    }
    setSimulateFailureOnce(enabled) {
        SocialStylePdfGenerator.sharedSimulateNextFailure = enabled;
    }
    async generateReportPdf(input) {
        if (SocialStylePdfGenerator.sharedSimulateNextFailure) {
            SocialStylePdfGenerator.sharedSimulateNextFailure = false;
            throw new Error('SIMULATED_PDF_GENERATION_FAILURE');
        }
        const reportVersion = input.reportVersion || 'v1.0';
        const catalog = input.interpretationCatalog || style_interpretations_definition_1.DEFAULT_INTERPRETATION_TEMPLATES_V1;
        const interpretationVersion = catalog.version || answer_key_v1_definition_1.CURRENT_INTERPRETATION_VERSION;
        const generatedAt = input.generatedAt || new Date();
        const language = input.language || input.assessment.language || 'en';
        const pdfBuffer = await this.renderPdfDocument({
            ...input,
            reportVersion,
            language,
            interpretationCatalog: catalog,
            generatedAt,
        });
        // Strict buffer integrity validation before returning
        if (!Buffer.isBuffer(pdfBuffer) || pdfBuffer.length < 512) {
            throw new Error('Generated PDF buffer failed minimum size integrity validation.');
        }
        const headerSignature = pdfBuffer.subarray(0, 5).toString('ascii');
        if (headerSignature !== '%PDF-') {
            throw new Error('Generated PDF buffer is missing valid %PDF- header signature.');
        }
        const checksumSha256 = crypto_1.default.createHash('sha256').update(pdfBuffer).digest('hex');
        const safeAssessmentId = input.assessment.assessmentId.replace(/[^A-Za-z0-9_-]/g, '');
        const fileName = `Social-Styles-Report-${safeAssessmentId}-${language.toUpperCase()}.pdf`;
        return {
            reportId: input.reportId,
            fileName,
            pdfBuffer,
            fileSizeBytes: pdfBuffer.length,
            checksumSha256,
            language,
            reportVersion,
            interpretationVersion,
            generatedAt,
        };
    }
    /**
     * Resolves bundled Noto Sans TrueType font paths across dev (src/) and build (dist/) layouts.
     */
    resolveBundledFonts() {
        const candidateDirs = [
            path_1.default.resolve(__dirname, '../assets/fonts'),
            path_1.default.resolve(process.cwd(), 'src/modules/social-styles/infrastructure/assets/fonts'),
            path_1.default.resolve(process.cwd(), 'dist/modules/social-styles/infrastructure/assets/fonts'),
        ];
        for (const dir of candidateDirs) {
            const latinReg = path_1.default.join(dir, 'NotoSans-Regular.ttf');
            if (fs_1.default.existsSync(latinReg)) {
                return {
                    latinRegular: latinReg,
                    latinBold: this.ifExists(path_1.default.join(dir, 'NotoSans-Bold.ttf')),
                    sinhalaRegular: this.ifExists(path_1.default.join(dir, 'NotoSansSinhala-Regular.ttf')),
                    sinhalaBold: this.ifExists(path_1.default.join(dir, 'NotoSansSinhala-Bold.ttf')),
                    tamilRegular: this.ifExists(path_1.default.join(dir, 'NotoSansTamil-Regular.ttf')),
                    tamilBold: this.ifExists(path_1.default.join(dir, 'NotoSansTamil-Bold.ttf')),
                };
            }
        }
        return {};
    }
    /**
     * Splits a string containing mixed Latin + Sinhala (U+0D80..U+0DFF) + Tamil (U+0B80..U+0BFF)
     * into contiguous script runs so each run is rendered with the exact font containing its glyphs.
     */
    splitIntoScriptRuns(text) {
        if (!text)
            return [];
        const runs = [];
        let currentScript = null;
        let currentBuffer = '';
        for (const char of text) {
            const code = char.codePointAt(0) || 0;
            let charScript;
            if (code >= 0x0d80 && code <= 0x0dff) {
                charScript = 'SINHALA';
            }
            else if (code >= 0x0b80 && code <= 0x0bff) {
                charScript = 'TAMIL';
            }
            else if ((code === 0x200c || code === 0x200d || code === 0x0020) && currentScript) {
                // Keep Zero-Width Joiner / Non-Joiner and spaces attached to active complex script run
                charScript = currentScript;
            }
            else {
                charScript = 'LATIN';
            }
            if (currentScript === null) {
                currentScript = charScript;
                currentBuffer = char;
            }
            else if (charScript === currentScript) {
                currentBuffer += char;
            }
            else {
                runs.push({ script: currentScript, text: currentBuffer });
                currentScript = charScript;
                currentBuffer = char;
            }
        }
        if (currentScript && currentBuffer.length > 0) {
            runs.push({ script: currentScript, text: currentBuffer });
        }
        return runs;
    }
    ifExists(filePath) {
        return fs_1.default.existsSync(filePath) ? filePath : undefined;
    }
    renderPdfDocument(input) {
        return new Promise((resolve, reject) => {
            try {
                const { assessment, result, language, reportId, reportVersion, generatedAt } = input;
                const catalog = input.interpretationCatalog;
                const localizedBundle = style_interpretations_definition_1.SocialStyleInterpretationService.getLocalizedBundle(language, catalog);
                const orderedStyles = style_interpretations_definition_1.SocialStyleInterpretationService.getOrderedStyleGuidance(result.finalScores, language, catalog);
                const doc = new pdfkit_1.default({
                    size: 'A4',
                    margin: 44,
                    bufferPages: true,
                    info: {
                        Title: `${assessment.title || 'Social Styles Assessment'} - ${assessment.participantName}`,
                        Author: assessment.firmName || assessment.consultantName || 'DAASH Global / Talnova TESP',
                        Subject: `Social Styles Assessment Report (${reportId})`,
                        Keywords: `Social Styles, DAASH Global, Talnova, ${language.toUpperCase()}`,
                        CreationDate: generatedAt,
                    },
                });
                const chunks = [];
                doc.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', (err) => reject(err));
                // Register bundled Noto Unicode fonts
                const fontPaths = this.resolveBundledFonts();
                const hasLatinFont = Boolean(fontPaths.latinRegular);
                const hasSinhalaFont = Boolean(fontPaths.sinhalaRegular);
                const hasTamilFont = Boolean(fontPaths.tamilRegular);
                if (fontPaths.latinRegular)
                    doc.registerFont('NotoSans-Regular', fontPaths.latinRegular);
                if (fontPaths.latinBold)
                    doc.registerFont('NotoSans-Bold', fontPaths.latinBold);
                if (fontPaths.sinhalaRegular)
                    doc.registerFont('NotoSansSinhala-Regular', fontPaths.sinhalaRegular);
                if (fontPaths.sinhalaBold)
                    doc.registerFont('NotoSansSinhala-Bold', fontPaths.sinhalaBold);
                if (fontPaths.tamilRegular)
                    doc.registerFont('NotoSansTamil-Regular', fontPaths.tamilRegular);
                if (fontPaths.tamilBold)
                    doc.registerFont('NotoSansTamil-Bold', fontPaths.tamilBold);
                const selectFontForScript = (script, bold = false) => {
                    if (script === 'SINHALA' && hasSinhalaFont) {
                        return bold && fontPaths.sinhalaBold
                            ? 'NotoSansSinhala-Bold'
                            : 'NotoSansSinhala-Regular';
                    }
                    if (script === 'TAMIL' && hasTamilFont) {
                        return bold && fontPaths.tamilBold ? 'NotoSansTamil-Bold' : 'NotoSansTamil-Regular';
                    }
                    if (hasLatinFont) {
                        return bold && fontPaths.latinBold ? 'NotoSans-Bold' : 'NotoSans-Regular';
                    }
                    return bold ? 'Helvetica-Bold' : 'Helvetica';
                };
                /**
                 * Renders multi-script text (Latin + Sinhala + Tamil) by switching fonts per script run
                 * using PDFKit's `continued: true` option when multiple scripts appear in one string.
                 */
                const writeMultiScriptText = (text, x, y, options = {}) => {
                    const { bold = false, fontSize = 10, color = '#0F172A', ...pdfTextOpts } = options;
                    const runs = this.splitIntoScriptRuns(String(text || ''));
                    doc.fontSize(fontSize).fillColor(color);
                    if (runs.length === 0)
                        return;
                    if (runs.length === 1) {
                        doc.font(selectFontForScript(runs[0].script, bold));
                        if (typeof y === 'number') {
                            doc.text(runs[0].text, x, y, pdfTextOpts);
                        }
                        else {
                            doc.text(runs[0].text, x, doc.y, pdfTextOpts);
                        }
                        return;
                    }
                    runs.forEach((run, idx) => {
                        const isLast = idx === runs.length - 1;
                        doc.font(selectFontForScript(run.script, bold));
                        if (idx === 0) {
                            if (typeof y === 'number') {
                                doc.text(run.text, x, y, { ...pdfTextOpts, continued: !isLast });
                            }
                            else {
                                doc.text(run.text, x, doc.y, { ...pdfTextOpts, continued: !isLast });
                            }
                        }
                        else {
                            doc.text(run.text, { ...pdfTextOpts, continued: !isLast });
                        }
                    });
                };
                // ====================================================================
                // PAGE 1: Executive Summary, Score Table & Dual Visualizations
                // ====================================================================
                // Top Brand Banner
                doc.rect(0, 0, 595.28, 78).fill('#0F172A');
                writeMultiScriptText('DAASH Global  |  Talnova Enterprise Platform', 44, 20, {
                    bold: true,
                    fontSize: 11,
                    color: '#93C5FD',
                });
                writeMultiScriptText(assessment.title || 'Social Styles Assessment & Communication Profile', 44, 38, {
                    bold: true,
                    fontSize: 16,
                    color: '#FFFFFF',
                });
                writeMultiScriptText(`Report Ref: ${reportId}  •  Version: ${reportVersion}`, 370, 22, {
                    fontSize: 8.5,
                    color: '#CBD5E1',
                    width: 180,
                    align: 'right',
                });
                // Participant & Consultant Metadata Card
                const metaTop = 92;
                doc.roundedRect(44, metaTop, 507, 68, 6).fillAndStroke('#F8FAFC', '#E2E8F0');
                writeMultiScriptText(`Participant: ${assessment.participantName}`, 56, metaTop + 10, {
                    bold: true,
                    fontSize: 10.5,
                    color: '#0F172A',
                });
                writeMultiScriptText(`Email: ${assessment.participantEmail}`, 56, metaTop + 27, {
                    fontSize: 9,
                    color: '#475569',
                });
                writeMultiScriptText(`Organization: ${assessment.organizationName || 'Independent Participant'}`, 56, metaTop + 43, { fontSize: 9, color: '#475569' });
                writeMultiScriptText(`Consultant: ${assessment.consultantName}`, 310, metaTop + 10, {
                    bold: true,
                    fontSize: 9.5,
                    color: '#0F172A',
                });
                writeMultiScriptText(`Assessment ID: ${assessment.assessmentId}${assessment.reference ? ` (${assessment.reference})` : ''}`, 310, metaTop + 27, { fontSize: 9, color: '#475569' });
                const completedDateStr = assessment.completedAt
                    ? new Date(assessment.completedAt).toISOString().slice(0, 10)
                    : generatedAt.toISOString().slice(0, 10);
                writeMultiScriptText(`Completed: ${completedDateStr}  |  Locale: ${language.toUpperCase()}`, 310, metaTop + 43, { fontSize: 9, color: '#475569' });
                // Score Summary Section
                const scoreTop = 174;
                writeMultiScriptText('1. Authoritative Social Styles Score Summary', 44, scoreTop, {
                    bold: true,
                    fontSize: 12,
                    color: '#0F172A',
                });
                const styleCards = [
                    {
                        label: 'Analytical',
                        raw: result.rawScores.analytical,
                        final: result.finalScores.analytical,
                        color: '#1D4ED8',
                        bg: '#EFF6FF',
                    },
                    {
                        label: 'Amiable',
                        raw: result.rawScores.amiable,
                        final: result.finalScores.amiable,
                        color: '#047857',
                        bg: '#ECFDF5',
                    },
                    {
                        label: 'Expressive',
                        raw: result.rawScores.expressive,
                        final: result.finalScores.expressive,
                        color: '#B45309',
                        bg: '#FFFBEB',
                    },
                    {
                        label: 'Driver',
                        raw: result.rawScores.driver,
                        final: result.finalScores.driver,
                        color: '#B91C1C',
                        bg: '#FEF2F2',
                    },
                ];
                const cardWidth = 120;
                const cardGap = 9;
                styleCards.forEach((sc, idx) => {
                    const cx = 44 + idx * (cardWidth + cardGap);
                    const cy = scoreTop + 20;
                    doc.roundedRect(cx, cy, cardWidth, 58, 6).fillAndStroke(sc.bg, sc.color);
                    writeMultiScriptText(sc.label, cx + 10, cy + 8, {
                        bold: true,
                        fontSize: 10,
                        color: sc.color,
                    });
                    writeMultiScriptText(`${sc.final} / 100`, cx + 10, cy + 23, {
                        bold: true,
                        fontSize: 15,
                        color: '#0F172A',
                    });
                    writeMultiScriptText(`Raw: ${sc.raw} / 20 (×5)`, cx + 10, cy + 43, {
                        fontSize: 8,
                        color: '#475569',
                    });
                });
                writeMultiScriptText(`Highest Reported Style Preference(s): ${result.highestScoredStyles.join(', ')}   |   Total Raw: ${result.rawScores.total}/20   |   Total Final: ${result.finalScores.total}/100`, 44, scoreTop + 86, { bold: true, fontSize: 9.5, color: '#1E293B' });
                // ====================================================================
                // Dual Graphical Visualizations (Side-by-Side Vector Charts)
                // ====================================================================
                const chartsTop = 282;
                writeMultiScriptText('2. Graphical Profile — Visualization A (Four-Axis Profile) & Visualization B (Net Balance)', 44, chartsTop, { bold: true, fontSize: 11.5, color: '#0F172A' });
                // Left Box: Visualization A (Four-Axis Diamond Profile, reproducing DAASH Global Page 3 Graph)
                const boxY = chartsTop + 20;
                const boxW = 248;
                const boxH = 245;
                doc.roundedRect(44, boxY, boxW, boxH, 6).fillAndStroke('#FFFFFF', '#CBD5E1');
                writeMultiScriptText('Visualization A: Four-Axis Profile (0–100)', 54, boxY + 8, {
                    bold: true,
                    fontSize: 9.5,
                    color: '#0F172A',
                });
                const centerAX = 44 + boxW / 2;
                const centerAY = boxY + 132;
                const radiusA = 76;
                this.drawFourAxisProfileVectorChart(doc, centerAX, centerAY, radiusA, result, writeMultiScriptText);
                // Right Box: Visualization B (Net Balance Coordinate X = Expressive - Analytical, Y = Driver - Amiable)
                const boxBX = 44 + boxW + 11;
                doc.roundedRect(boxBX, boxY, boxW, boxH, 6).fillAndStroke('#FFFFFF', '#CBD5E1');
                writeMultiScriptText('Visualization B: Net Balance Coordinate', boxBX + 10, boxY + 8, {
                    bold: true,
                    fontSize: 9.5,
                    color: '#0F172A',
                });
                const centerBX = boxBX + boxW / 2;
                const centerBY = boxY + 132;
                const radiusB = 76;
                this.drawNetBalanceVectorChart(doc, centerBX, centerBY, radiusB, result, writeMultiScriptText);
                // Graph Explanation Note
                const expTop = boxY + boxH + 10;
                doc.roundedRect(44, expTop, 507, 68, 5).fillAndStroke('#F8FAFC', '#E2E8F0');
                writeMultiScriptText(localizedBundle.fourAxisExplanation, 52, expTop + 8, {
                    fontSize: 8,
                    color: '#334155',
                    width: 490,
                });
                writeMultiScriptText(localizedBundle.netCoordinateExplanation, 52, expTop + 36, {
                    fontSize: 8,
                    color: '#334155',
                    width: 490,
                });
                // Mandatory Disclaimer Footer on Page 1
                const disclaimerTop = 640;
                doc.roundedRect(44, disclaimerTop, 507, 92, 5).fillAndStroke('#FFFBEB', '#F59E0B');
                writeMultiScriptText(`Content Status: ${catalog.contentStatus}  |  Translation Status (${language.toUpperCase()}): ${localizedBundle.translationStatus}`, 52, disclaimerTop + 8, { bold: true, fontSize: 8, color: '#92400E', width: 490 });
                writeMultiScriptText(localizedBundle.disclaimer, 52, disclaimerTop + 22, {
                    fontSize: 7.8,
                    color: '#78350F',
                    width: 490,
                });
                // ====================================================================
                // PAGE 2: Workplace Communication Style Guidance & 20-Question Breakdown
                // ====================================================================
                doc.addPage();
                doc.rect(0, 0, 595.28, 48).fill('#0F172A');
                writeMultiScriptText(`Workplace Communication Guidance — ${assessment.participantName} (${assessment.assessmentId})`, 44, 16, { bold: true, fontSize: 12, color: '#FFFFFF' });
                let cursorY = 62;
                writeMultiScriptText('3. Style-by-Style Communication Guidance (Ordered by Reported Score)', 44, cursorY, { bold: true, fontSize: 11.5, color: '#0F172A' });
                cursorY += 18;
                for (const styleBlock of orderedStyles) {
                    if (cursorY > 640) {
                        doc.addPage();
                        cursorY = 50;
                    }
                    const badgeText = styleBlock.isHighestScored
                        ? `${styleBlock.styleName} — ${styleBlock.finalScore}/100 (Primary Reported Preference)`
                        : `${styleBlock.styleName} — ${styleBlock.finalScore}/100`;
                    doc.roundedRect(44, cursorY, 507, 138, 5).fillAndStroke('#F8FAFC', '#CBD5E1');
                    writeMultiScriptText(badgeText, 52, cursorY + 7, {
                        bold: true,
                        fontSize: 9.5,
                        color: styleBlock.isHighestScored ? '#1D4ED8' : '#0F172A',
                        width: 490,
                    });
                    writeMultiScriptText(styleBlock.axisSummary, 52, cursorY + 21, {
                        fontSize: 8,
                        color: '#475569',
                        width: 490,
                    });
                    writeMultiScriptText(styleBlock.overview, 52, cursorY + 34, {
                        fontSize: 8,
                        color: '#1E293B',
                        width: 490,
                    });
                    writeMultiScriptText(`Strengths: ${styleBlock.workplaceStrengths.slice(0, 2).join(' • ')}`, 52, cursorY + 62, { fontSize: 7.8, color: '#065F46', width: 490 });
                    writeMultiScriptText(`Possible Challenges: ${styleBlock.potentialChallenges.slice(0, 2).join(' • ')}`, 52, cursorY + 84, { fontSize: 7.8, color: '#92400E', width: 490 });
                    writeMultiScriptText(`Colleague & Manager Tips: ${styleBlock.recommendationsForColleagues[0]} | ${styleBlock.recommendationsForManagers[0]}`, 52, cursorY + 106, { fontSize: 7.8, color: '#1E3A8A', width: 490 });
                    cursorY += 146;
                }
                // ====================================================================
                // PAGE 3: Complete 20-Question Submitted Answer Breakdown
                // ====================================================================
                doc.addPage();
                doc.rect(0, 0, 595.28, 48).fill('#0F172A');
                writeMultiScriptText(`Submitted 20-Question Answer Breakdown — ${assessment.participantName}`, 44, 16, { bold: true, fontSize: 12, color: '#FFFFFF' });
                let tableY = 66;
                doc.rect(44, tableY, 507, 22).fill('#1E293B');
                writeMultiScriptText('Q#', 54, tableY + 6, { bold: true, fontSize: 8.5, color: '#FFFFFF' });
                writeMultiScriptText('Selected Option', 95, tableY + 6, {
                    bold: true,
                    fontSize: 8.5,
                    color: '#FFFFFF',
                });
                writeMultiScriptText(`Word Selected (${language.toUpperCase()})`, 190, tableY + 6, {
                    bold: true,
                    fontSize: 8.5,
                    color: '#FFFFFF',
                });
                writeMultiScriptText('Mapped Style (+1 Raw / +5 Final)', 390, tableY + 6, {
                    bold: true,
                    fontSize: 8.5,
                    color: '#FFFFFF',
                });
                tableY += 22;
                result.answerBreakdown.forEach((item, idx) => {
                    const rowBg = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
                    doc.rect(44, tableY, 507, 22).fillAndStroke(rowBg, '#E2E8F0');
                    const localizedWord = (0, questionnaire_v1_definition_1.getQuestionOptionLabel)(item.questionNumber, item.selectedOption, language);
                    const englishWord = (0, questionnaire_v1_definition_1.getQuestionOptionLabel)(item.questionNumber, item.selectedOption, 'en');
                    const wordDisplay = language === 'en' ? englishWord : `${localizedWord} (${englishWord})`;
                    writeMultiScriptText(String(item.questionNumber), 54, tableY + 6, {
                        bold: true,
                        fontSize: 8.5,
                        color: '#0F172A',
                    });
                    writeMultiScriptText(`Option ${item.selectedOption}`, 95, tableY + 6, {
                        fontSize: 8.5,
                        color: '#334155',
                    });
                    writeMultiScriptText(wordDisplay, 190, tableY + 6, {
                        fontSize: 8.5,
                        color: '#0F172A',
                        width: 190,
                    });
                    writeMultiScriptText(item.mappedStyle, 390, tableY + 6, {
                        bold: true,
                        fontSize: 8.5,
                        color: '#1D4ED8',
                    });
                    tableY += 22;
                });
                // Page Footers across all buffered pages
                const pageRange = doc.bufferedPageRange();
                for (let i = 0; i < pageRange.count; i++) {
                    doc.switchToPage(pageRange.start + i);
                    writeMultiScriptText(`DAASH Global / Talnova TESP  •  Report Ref: ${reportId}  •  Generated: ${generatedAt.toISOString().slice(0, 19).replace('T', ' ')} UTC  •  Page ${i + 1} of ${pageRange.count}`, 44, 795, { fontSize: 7.5, color: '#64748B', width: 507, align: 'center' });
                }
                doc.end();
            }
            catch (err) {
                reject(err);
            }
        });
    }
    drawFourAxisProfileVectorChart(doc, cx, cy, radius, result, writeText) {
        // Subtle concentric grid rings at 25, 50, 75, 100
        [0.25, 0.5, 0.75, 1.0].forEach((ratio) => {
            const r = radius * ratio;
            doc
                .polygon([cx - r, cy], [cx, cy - r], [cx + r, cy], [cx, cy + r])
                .lineWidth(0.5)
                .strokeColor('#E2E8F0')
                .stroke();
        });
        // Main horizontal & vertical axes
        doc
            .moveTo(cx - radius, cy)
            .lineTo(cx + radius, cy)
            .moveTo(cx, cy - radius)
            .lineTo(cx, cy + radius)
            .lineWidth(1.2)
            .strokeColor('#475569')
            .stroke();
        // 20 tick marks per semi-axis (matching DAASH Global Page 3 Graph)
        for (let tick = 1; tick <= 20; tick++) {
            const offset = (tick / 20) * radius;
            const tickHalf = tick % 5 === 0 ? 3.5 : 1.8;
            doc
                .moveTo(cx - offset, cy - tickHalf)
                .lineTo(cx - offset, cy + tickHalf)
                .moveTo(cx + offset, cy - tickHalf)
                .lineTo(cx + offset, cy + tickHalf)
                .moveTo(cx - tickHalf, cy - offset)
                .lineTo(cx + tickHalf, cy - offset)
                .moveTo(cx - tickHalf, cy + offset)
                .lineTo(cx + tickHalf, cy + offset)
                .lineWidth(0.6)
                .strokeColor('#64748B')
                .stroke();
        }
        // Axis Pole Labels & Behavioral Sub-labels
        writeText(`Driver (${result.finalScores.driver})`, cx - 35, cy - radius - 22, {
            bold: true,
            fontSize: 8.5,
            color: '#B91C1C',
            width: 70,
            align: 'center',
        });
        writeText('Less Responsive | Task-oriented', cx - 70, cy - radius - 11, {
            fontSize: 6.5,
            color: '#64748B',
            width: 140,
            align: 'center',
        });
        writeText(`Amiable (${result.finalScores.amiable})`, cx - 35, cy + radius + 6, {
            bold: true,
            fontSize: 8.5,
            color: '#047857',
            width: 70,
            align: 'center',
        });
        writeText('More Responsive | Relationship-oriented', cx - 75, cy + radius + 17, {
            fontSize: 6.5,
            color: '#64748B',
            width: 150,
            align: 'center',
        });
        writeText(`Analytical\n(${result.finalScores.analytical})`, cx - radius - 42, cy - 10, {
            bold: true,
            fontSize: 7.5,
            color: '#1D4ED8',
            width: 40,
            align: 'center',
        });
        writeText(`Expressive\n(${result.finalScores.expressive})`, cx + radius + 3, cy - 10, {
            bold: true,
            fontSize: 7.5,
            color: '#B45309',
            width: 42,
            align: 'center',
        });
        // Plot the 4-point diamond polygon
        const geom = this.graphService.projectToCanvasGeometry({
            graphVersion: result.graphVersion,
            fourAxisProfile: result.fourAxisProfile,
            netBalanceCoordinate: result.netBalanceCoordinate,
        }, cx, cy, radius);
        const { leftAnalytical, topDriver, rightExpressive, bottomAmiable } = geom.fourAxisVertices;
        doc
            .polygon([leftAnalytical.x, leftAnalytical.y], [topDriver.x, topDriver.y], [rightExpressive.x, rightExpressive.y], [bottomAmiable.x, bottomAmiable.y])
            .lineWidth(2)
            .fillOpacity(0.22)
            .fillAndStroke('#2563EB', '#1D4ED8');
        doc.fillOpacity(1);
        // Draw vertex dots
        [leftAnalytical, topDriver, rightExpressive, bottomAmiable].forEach((pt) => {
            doc.circle(pt.x, pt.y, 3.2).fill('#1E3A8A');
        });
    }
    drawNetBalanceVectorChart(doc, cx, cy, radius, result, writeText) {
        // Outer quadrant border & inner 50% grid
        doc
            .rect(cx - radius, cy - radius, radius * 2, radius * 2)
            .lineWidth(0.7)
            .strokeColor('#CBD5E1')
            .stroke();
        doc
            .rect(cx - radius / 2, cy - radius / 2, radius, radius)
            .lineWidth(0.5)
            .strokeColor('#E2E8F0')
            .stroke();
        // Axes
        doc
            .moveTo(cx - radius, cy)
            .lineTo(cx + radius, cy)
            .moveTo(cx, cy - radius)
            .lineTo(cx, cy + radius)
            .lineWidth(1.2)
            .strokeColor('#475569')
            .stroke();
        // Pole Labels
        writeText('+Y Driver (+100)', cx - 40, cy - radius - 14, {
            bold: true,
            fontSize: 7.5,
            color: '#475569',
            width: 80,
            align: 'center',
        });
        writeText('-Y Amiable (-100)', cx - 40, cy + radius + 5, {
            bold: true,
            fontSize: 7.5,
            color: '#475569',
            width: 80,
            align: 'center',
        });
        writeText('-X\nAnalytical', cx - radius - 38, cy - 8, {
            fontSize: 7,
            color: '#475569',
            width: 36,
            align: 'center',
        });
        writeText('+X\nExpressive', cx + radius + 2, cy - 8, {
            fontSize: 7,
            color: '#475569',
            width: 38,
            align: 'center',
        });
        const geom = this.graphService.projectToCanvasGeometry({
            graphVersion: result.graphVersion,
            fourAxisProfile: result.fourAxisProfile,
            netBalanceCoordinate: result.netBalanceCoordinate,
        }, cx, cy, radius);
        const pt = geom.netBalancePoint;
        // Dashed projection lines from axes to net point
        doc
            .moveTo(pt.x, cy)
            .lineTo(pt.x, pt.y)
            .moveTo(cx, pt.y)
            .lineTo(pt.x, pt.y)
            .lineWidth(0.8)
            .strokeColor('#DC2626')
            .stroke();
        // Highlight Net Balance Point
        doc.circle(pt.x, pt.y, 5).fillAndStroke('#DC2626', '#7F1D1D');
        const { x, y, horizontalTendency, verticalTendency } = result.netBalanceCoordinate;
        const xSign = x > 0 ? `+${x}` : `${x}`;
        const ySign = y > 0 ? `+${y}` : `${y}`;
        writeText(`Net (X=${xSign}, Y=${ySign})  •  ${horizontalTendency} / ${verticalTendency}`, cx - 115, cy + radius + 19, { bold: true, fontSize: 8, color: '#0F172A', width: 230, align: 'center' });
    }
}
exports.SocialStylePdfGenerator = SocialStylePdfGenerator;
//# sourceMappingURL=social-style-pdf.generator.js.map