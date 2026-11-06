"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialStyleGraphService = void 0;
const answer_key_v1_definition_1 = require("../constants/answer-key-v1.definition");
const social_style_scoring_service_1 = require("./social-style-scoring.service");
/**
 * Pure, renderer-independent domain service implementing Confirmed Option A Graph Calculations:
 * - Visualization A: Four-Axis Profile (Analytical Left, Expressive Right, Driver Top, Amiable Bottom, 0..100 diamond).
 * - Visualization B: Net Balance Coordinate (X = Expressive - Analytical, Y = Driver - Amiable in -100..+100).
 */
class SocialStyleGraphService {
    /**
     * Computes both approved visualizations from finalScores (0..100) and optional rawScores (0..20).
     */
    calculateGraphData(finalScores, rawScores, graphVersion = answer_key_v1_definition_1.CURRENT_GRAPH_VERSION) {
        this.validateScoreInputs(finalScores);
        const tickMarks = rawScores
            ? {
                leftAnalytical: rawScores.analytical,
                rightExpressive: rawScores.expressive,
                topDriver: rawScores.driver,
                bottomAmiable: rawScores.amiable,
            }
            : {
                leftAnalytical: Math.round(finalScores.analytical / 5),
                rightExpressive: Math.round(finalScores.expressive / 5),
                topDriver: Math.round(finalScores.driver / 5),
                bottomAmiable: Math.round(finalScores.amiable / 5),
            };
        const fourAxisProfile = {
            leftAnalytical: finalScores.analytical,
            rightExpressive: finalScores.expressive,
            topDriver: finalScores.driver,
            bottomAmiable: finalScores.amiable,
            tickMarks,
        };
        const rawX = finalScores.expressive - finalScores.analytical;
        const rawY = finalScores.driver - finalScores.amiable;
        // Clamp strictly within [-100, +100] and eliminate -0
        const x = Math.max(-100, Math.min(100, rawX === 0 ? 0 : rawX));
        const y = Math.max(-100, Math.min(100, rawY === 0 ? 0 : rawY));
        const normalizedX = Number((x / 100).toFixed(4)) === 0 ? 0 : Number((x / 100).toFixed(4));
        const normalizedY = Number((y / 100).toFixed(4)) === 0 ? 0 : Number((y / 100).toFixed(4));
        const horizontalTendency = x > 0 ? 'EXPRESSIVE' : x < 0 ? 'ANALYTICAL' : 'BALANCED';
        const verticalTendency = y > 0 ? 'DRIVER' : y < 0 ? 'AMIABLE' : 'BALANCED';
        let quadrantRegion;
        if (x === 0 && y === 0) {
            quadrantRegion = 'ORIGIN_BALANCED';
        }
        else if (x === 0 || y === 0) {
            quadrantRegion = 'AXIS_BOUNDARY';
        }
        else if (x > 0 && y > 0) {
            quadrantRegion = 'DRIVER_EXPRESSIVE';
        }
        else if (x < 0 && y > 0) {
            quadrantRegion = 'DRIVER_ANALYTICAL';
        }
        else if (x > 0 && y < 0) {
            quadrantRegion = 'AMIABLE_EXPRESSIVE';
        }
        else {
            quadrantRegion = 'AMIABLE_ANALYTICAL';
        }
        return {
            graphVersion,
            fourAxisProfile,
            netBalanceCoordinate: {
                x,
                y,
                normalizedX,
                normalizedY,
                horizontalTendency,
                verticalTendency,
                quadrantRegion,
            },
        };
    }
    /**
     * Projects deterministic graph data onto any 2D screen/SVG/PDF coordinate space
     * where (centerX, centerY) is the origin and Y grows downward (standard SVG & PDFKit convention).
     */
    projectToCanvasGeometry(graphData, centerX, centerY, semiAxisRadius) {
        if (semiAxisRadius <= 0) {
            throw new Error('semiAxisRadius must be greater than 0.');
        }
        const { fourAxisProfile, netBalanceCoordinate } = graphData;
        const leftAnalytical = {
            x: Number((centerX - (fourAxisProfile.leftAnalytical / 100) * semiAxisRadius).toFixed(2)),
            y: centerY,
        };
        const topDriver = {
            x: centerX,
            y: Number((centerY - (fourAxisProfile.topDriver / 100) * semiAxisRadius).toFixed(2)),
        };
        const rightExpressive = {
            x: Number((centerX + (fourAxisProfile.rightExpressive / 100) * semiAxisRadius).toFixed(2)),
            y: centerY,
        };
        const bottomAmiable = {
            x: centerX,
            y: Number((centerY + (fourAxisProfile.bottomAmiable / 100) * semiAxisRadius).toFixed(2)),
        };
        const netBalancePoint = {
            x: Number((centerX + netBalanceCoordinate.normalizedX * semiAxisRadius).toFixed(2)),
            y: Number((centerY - netBalanceCoordinate.normalizedY * semiAxisRadius).toFixed(2)),
        };
        return {
            centerX,
            centerY,
            semiAxisRadius,
            fourAxisVertices: {
                leftAnalytical,
                topDriver,
                rightExpressive,
                bottomAmiable,
            },
            netBalancePoint,
        };
    }
    validateScoreInputs(scores) {
        const keys = ['analytical', 'amiable', 'expressive', 'driver'];
        for (const key of keys) {
            const value = scores[key];
            if (typeof value !== 'number' || Number.isNaN(value) || value < 0 || value > 100) {
                throw new social_style_scoring_service_1.SocialStyleScoringValidationError(`Invalid score for '${key}': ${value}. Must be a number between 0 and 100.`);
            }
        }
    }
}
exports.SocialStyleGraphService = SocialStyleGraphService;
//# sourceMappingURL=social-style-graph.service.js.map