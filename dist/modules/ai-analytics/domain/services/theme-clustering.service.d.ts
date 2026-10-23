export interface ThemeFrequency {
    theme: string;
    count: number;
}
export declare class ThemeClusteringService {
    private knownThemes;
    extractThemes(text: string): string[];
    aggregateThemes(texts: string[]): ThemeFrequency[];
}
