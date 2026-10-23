"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeClusteringService = void 0;
class ThemeClusteringService {
    knownThemes = [
        { theme: 'Management Support', keywords: ['management', 'leadership', 'supportive', 'manager'] },
        { theme: 'Workplace Flexibility', keywords: ['hybrid', 'flexible', 'remote', 'hours'] },
        { theme: 'Workload & Burnout', keywords: ['workload', 'audit', 'overtime', 'busy', 'stress'] },
        { theme: 'Cross-Department Communication', keywords: ['communication', 'slack', 'collaboration', 'tools'] },
        { theme: 'Professional Development', keywords: ['training', 'workshop', 'learning', 'growth'] },
        { theme: 'Safety & Equipment', keywords: ['safety', 'equipment', 'hazard', 'press', 'factory'] },
    ];
    extractThemes(text) {
        if (!text)
            return [];
        const lower = text.toLowerCase();
        const matched = [];
        for (const item of this.knownThemes) {
            if (item.keywords.some((kw) => lower.includes(kw))) {
                matched.push(item.theme);
            }
        }
        return matched.length > 0 ? matched : ['General Workplace Feedback'];
    }
    aggregateThemes(texts) {
        const counts = new Map();
        for (const text of texts) {
            const themes = this.extractThemes(text);
            for (const theme of themes) {
                counts.set(theme, (counts.get(theme) || 0) + 1);
            }
        }
        const results = [];
        for (const [theme, count] of counts.entries()) {
            results.push({ theme, count });
        }
        return results.sort((a, b) => b.count - a.count);
    }
}
exports.ThemeClusteringService = ThemeClusteringService;
//# sourceMappingURL=theme-clustering.service.js.map