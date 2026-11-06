import { SocialStyleFinalScores, SocialStyleRawScores } from './social-style-scoring.service';
export type HorizontalTendency = 'ANALYTICAL' | 'EXPRESSIVE' | 'BALANCED';
export type VerticalTendency = 'DRIVER' | 'AMIABLE' | 'BALANCED';
export type QuadrantRegion = 'DRIVER_EXPRESSIVE' | 'DRIVER_ANALYTICAL' | 'AMIABLE_EXPRESSIVE' | 'AMIABLE_ANALYTICAL' | 'AXIS_BOUNDARY' | 'ORIGIN_BALANCED';
export interface FourAxisTickMarks {
    leftAnalytical: number;
    rightExpressive: number;
    topDriver: number;
    bottomAmiable: number;
}
export interface FourAxisProfileData {
    leftAnalytical: number;
    rightExpressive: number;
    topDriver: number;
    bottomAmiable: number;
    tickMarks: FourAxisTickMarks;
}
export interface NetBalanceCoordinateData {
    x: number;
    y: number;
    normalizedX: number;
    normalizedY: number;
    horizontalTendency: HorizontalTendency;
    verticalTendency: VerticalTendency;
    quadrantRegion: QuadrantRegion;
}
export interface Point2D {
    x: number;
    y: number;
}
export interface RendererGeometryProjection {
    centerX: number;
    centerY: number;
    semiAxisRadius: number;
    fourAxisVertices: {
        leftAnalytical: Point2D;
        topDriver: Point2D;
        rightExpressive: Point2D;
        bottomAmiable: Point2D;
    };
    netBalancePoint: Point2D;
}
export interface SocialStyleGraphCalculationResult {
    graphVersion: string;
    fourAxisProfile: FourAxisProfileData;
    netBalanceCoordinate: NetBalanceCoordinateData;
}
/**
 * Pure, renderer-independent domain service implementing Confirmed Option A Graph Calculations:
 * - Visualization A: Four-Axis Profile (Analytical Left, Expressive Right, Driver Top, Amiable Bottom, 0..100 diamond).
 * - Visualization B: Net Balance Coordinate (X = Expressive - Analytical, Y = Driver - Amiable in -100..+100).
 */
export declare class SocialStyleGraphService {
    /**
     * Computes both approved visualizations from finalScores (0..100) and optional rawScores (0..20).
     */
    calculateGraphData(finalScores: Pick<SocialStyleFinalScores, 'analytical' | 'amiable' | 'expressive' | 'driver'>, rawScores?: Pick<SocialStyleRawScores, 'analytical' | 'amiable' | 'expressive' | 'driver'>, graphVersion?: string): SocialStyleGraphCalculationResult;
    /**
     * Projects deterministic graph data onto any 2D screen/SVG/PDF coordinate space
     * where (centerX, centerY) is the origin and Y grows downward (standard SVG & PDFKit convention).
     */
    projectToCanvasGeometry(graphData: SocialStyleGraphCalculationResult, centerX: number, centerY: number, semiAxisRadius: number): RendererGeometryProjection;
    private validateScoreInputs;
}
