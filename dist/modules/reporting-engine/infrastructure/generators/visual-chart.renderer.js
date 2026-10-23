"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisualChartRenderer = void 0;
class VisualChartRenderer {
    /**
     * 1. Radial eNPS Semi-Gauge SVG (-100 to +100)
     */
    renderEnpsGauge(enpsScore, width = 360, height = 200) {
        const clamped = Math.max(-100, Math.min(100, enpsScore));
        // Map -100..+100 to 180°..0° (counter-clockwise or standard gauge angle)
        // Angle in degrees from left (180°) to right (0°)
        const angleDeg = 180 - ((clamped + 100) / 200) * 180;
        const angleRad = (angleDeg * Math.PI) / 180;
        const cx = width / 2;
        const cy = height - 30;
        const radius = 120;
        const needleLen = radius - 15;
        const needleX = cx + needleLen * Math.cos(angleRad);
        const needleY = cy - needleLen * Math.sin(angleRad);
        const scoreColor = clamped >= 50 ? '#10b981' : clamped >= 0 ? '#f59e0b' : '#ef4444';
        const scoreCategory = clamped >= 50 ? 'World-Class' : clamped >= 0 ? 'Favorable' : 'Needs Action';
        const formattedScore = clamped > 0 ? `+${clamped}` : `${clamped}`;
        return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#ef4444" />
            <stop offset="50%" stop-color="#f59e0b" />
            <stop offset="100%" stop-color="#10b981" />
          </linearGradient>
        </defs>

        <!-- Outer Arc Track -->
        <path d="M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}" 
              fill="none" stroke="url(#gaugeGradient)" stroke-width="22" stroke-linecap="round" />

        <!-- Tick marks -->
        <text x="${cx - radius - 10}" y="${cy + 18}" font-family="sans-serif" font-size="11" font-weight="bold" fill="#64748b" text-anchor="middle">-100</text>
        <text x="${cx}" y="${cy - radius - 10}" font-family="sans-serif" font-size="11" font-weight="bold" fill="#64748b" text-anchor="middle">0</text>
        <text x="${cx + radius + 10}" y="${cy + 18}" font-family="sans-serif" font-size="11" font-weight="bold" fill="#64748b" text-anchor="middle">+100</text>

        <!-- Needle -->
        <circle cx="${cx}" cy="${cy}" r="8" fill="#1e293b" />
        <line x1="${cx}" y1="${cy}" x2="${needleX}" y2="${needleY}" stroke="#1e293b" stroke-width="4" stroke-linecap="round" />
        <circle cx="${needleX}" cy="${needleY}" r="3" fill="#1e293b" />

        <!-- Score Value & Label -->
        <text x="${cx}" y="${cy - 20}" font-family="sans-serif" font-size="32" font-weight="800" fill="${scoreColor}" text-anchor="middle">${formattedScore}</text>
        <text x="${cx}" y="${cy + 5}" font-family="sans-serif" font-size="11" font-weight="bold" fill="#64748b" text-anchor="middle">eNPS (${scoreCategory})</text>
      </svg>
    `.trim();
    }
    /**
     * 2. Participation Donut Chart SVG
     */
    renderParticipationDonut(completedPercent, startedPercent = 8, width = 280, height = 220) {
        const comp = Math.max(0, Math.min(100, completedPercent));
        const start = Math.max(0, Math.min(100 - comp, startedPercent));
        const unopened = Math.max(0, 100 - comp - start);
        const cx = width / 2;
        const cy = height / 2 - 15;
        const radius = 65;
        const strokeWidth = 18;
        const circumference = 2 * Math.PI * radius;
        const compDash = (comp / 100) * circumference;
        const startDash = (start / 100) * circumference;
        const unopenedDash = (unopened / 100) * circumference;
        const startOffset = -compDash;
        const unopenOffset = -(compDash + startDash);
        return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
        <g transform="rotate(-90 ${cx} ${cy})">
          <!-- Unopened Track (Grey) -->
          <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="#e2e8f0" stroke-width="${strokeWidth}" />

          <!-- Completed Arc (Emerald) -->
          <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="#10b981" stroke-width="${strokeWidth}"
                  stroke-dasharray="${compDash} ${circumference}" stroke-dashoffset="0" />

          <!-- In-Progress Arc (Sky Blue) -->
          <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="#0ea5e9" stroke-width="${strokeWidth}"
                  stroke-dasharray="${startDash} ${circumference}" stroke-dashoffset="${startOffset}" />
        </g>

        <!-- Center percentage -->
        <text x="${cx}" y="${cy + 6}" font-family="sans-serif" font-size="24" font-weight="800" fill="#0f172a" text-anchor="middle">${comp.toFixed(1)}%</text>
        <text x="${cx}" y="${cy + 22}" font-family="sans-serif" font-size="10" font-weight="bold" fill="#64748b" text-anchor="middle">Participation</text>

        <!-- Legend -->
        <g transform="translate(${cx - 90}, ${height - 22})">
          <circle cx="5" cy="5" r="4" fill="#10b981" />
          <text x="14" y="8" font-family="sans-serif" font-size="9" fill="#475569">Submitted (${comp}%)</text>

          <circle cx="85" cy="5" r="4" fill="#0ea5e9" />
          <text x="94" y="8" font-family="sans-serif" font-size="9" fill="#475569">Started (${start}%)</text>

          <circle cx="155" cy="5" r="4" fill="#cbd5e1" />
          <text x="164" y="8" font-family="sans-serif" font-size="9" fill="#475569">Unopened</text>
        </g>
      </svg>
    `.trim();
    }
    /**
     * 3. Driver Score Horizontal Comparison Bar Chart SVG
     */
    renderDriverScoreBars(drivers, width = 520, height = 240) {
        const barHeight = 16;
        const barSpacing = 36;
        const startY = 30;
        const maxScore = 5.0;
        const barMaxWidth = width - 220;
        const labelX = 140;
        let barsSvg = '';
        drivers.forEach((d, idx) => {
            const y = startY + idx * barSpacing;
            const scoreWidth = (Math.min(maxScore, Math.max(0, d.score)) / maxScore) * barMaxWidth;
            const benchX = labelX + 10 + (Math.min(maxScore, Math.max(0, d.benchmark)) / maxScore) * barMaxWidth;
            const color = d.score >= d.benchmark ? '#10b981' : d.score >= 3.5 ? '#0284c7' : '#ef4444';
            barsSvg += `
        <!-- Label -->
        <text x="${labelX}" y="${y + 12}" font-family="sans-serif" font-size="11" font-weight="600" fill="#334155" text-anchor="end">${d.name}</text>
        
        <!-- Background Track -->
        <rect x="${labelX + 10}" y="${y}" width="${barMaxWidth}" height="${barHeight}" rx="4" fill="#f1f5f9" />
        
        <!-- Score Bar -->
        <rect x="${labelX + 10}" y="${y}" width="${scoreWidth}" height="${barHeight}" rx="4" fill="${color}" />

        <!-- Benchmark vertical marker -->
        <line x1="${benchX}" y1="${y - 3}" x2="${benchX}" y2="${y + barHeight + 3}" stroke="#1e293b" stroke-width="2" stroke-dasharray="2 2" />

        <!-- Numeric value -->
        <text x="${labelX + 15 + scoreWidth}" y="${y + 12}" font-family="sans-serif" font-size="10" font-weight="bold" fill="#0f172a">${d.score.toFixed(1)}</text>
      `;
        });
        return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
        <!-- Legend header -->
        <g transform="translate(${labelX + 10}, 15)">
          <rect x="0" y="0" width="10" height="10" rx="2" fill="#10b981" />
          <text x="14" y="9" font-family="sans-serif" font-size="9" fill="#64748b">Tenant Score</text>

          <line x1="85" y1="1" x2="85" y2="10" stroke="#1e293b" stroke-width="2" stroke-dasharray="2 2" />
          <text x="92" y="9" font-family="sans-serif" font-size="9" fill="#64748b">Industry Benchmark</text>
        </g>

        ${barsSvg}
      </svg>
    `.trim();
    }
    /**
     * 4. AI Sentiment Polarity Stacked Bar SVG
     */
    renderSentimentStackedBar(sentiment, width = 480, height = 65) {
        const barWidth = width - 40;
        const barHeight = 22;
        const posW = (sentiment.positivePercent / 100) * barWidth;
        const neuW = (sentiment.neutralPercent / 100) * barWidth;
        const negW = (sentiment.negativePercent / 100) * barWidth;
        return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
        <g transform="translate(20, 10)">
          <!-- Positive segment -->
          <rect x="0" y="0" width="${posW}" height="${barHeight}" fill="#10b981" rx="4" />
          <!-- Neutral segment -->
          <rect x="${posW}" y="0" width="${neuW}" height="${barHeight}" fill="#94a3b8" />
          <!-- Negative segment -->
          <rect x="${posW + neuW}" y="0" width="${negW}" height="${barHeight}" fill="#ef4444" rx="4" />

          <!-- Labels -->
          <text x="8" y="15" font-family="sans-serif" font-size="10" font-weight="bold" fill="#ffffff">${sentiment.positivePercent}% Pos</text>
          ${neuW > 35 ? `<text x="${posW + neuW / 2}" y="15" font-family="sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">${sentiment.neutralPercent}% Neu</text>` : ''}
          ${negW > 30 ? `<text x="${posW + neuW + negW - 6}" y="15" font-family="sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="end">${sentiment.negativePercent}% Neg</text>` : ''}

          <text x="0" y="${barHeight + 18}" font-family="sans-serif" font-size="10" fill="#64748b">
            NLP Polarity Ratio: <tspan font-weight="bold" fill="#10b981">${sentiment.positivePercent}% Positive</tspan> &bull; <tspan font-weight="bold" fill="#94a3b8">${sentiment.neutralPercent}% Neutral</tspan> &bull; <tspan font-weight="bold" fill="#ef4444">${sentiment.negativePercent}% Negative</tspan>
          </text>
        </g>
      </svg>
    `.trim();
    }
}
exports.VisualChartRenderer = VisualChartRenderer;
//# sourceMappingURL=visual-chart.renderer.js.map