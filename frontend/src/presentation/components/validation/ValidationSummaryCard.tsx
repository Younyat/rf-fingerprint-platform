import { ValidationScientificSummary } from "./types";

function pct(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

interface ValidationSummaryCardProps {
  summary: ValidationScientificSummary;
}

export function ValidationSummaryCard({ summary }: ValidationSummaryCardProps) {
  return (
    <section className="panel validation-summary">
      <div className="validation-summary-top">
        <h3>Validation Scientific Report</h3>
        <span className={`quality quality-${summary.qualityLabel.toLowerCase()}`}>Quality: {summary.qualityLabel}</span>
      </div>

      <div className="validation-kpi-grid">
        <div className="validation-kpi">
          <div className="kpi-label">Record Accuracy</div>
          <div className="kpi-value">{pct(summary.recordAccuracy)}</div>
        </div>
        <div className="validation-kpi">
          <div className="kpi-label">Window Accuracy</div>
          <div className="kpi-value">{pct(summary.windowAccuracy)}</div>
        </div>
        <div className="validation-kpi">
          <div className="kpi-label">Acceptance Rate</div>
          <div className="kpi-value">{pct(summary.acceptanceRate)}</div>
        </div>
        <div className="validation-kpi">
          <div className="kpi-label">Suspicious Rate</div>
          <div className="kpi-value">{pct(summary.suspiciousRate)}</div>
        </div>
        <div className="validation-kpi">
          <div className="kpi-label">Mean True Distance</div>
          <div className="kpi-value">{summary.meanDistanceToTrueProfile.toFixed(4)}</div>
        </div>
        <div className="validation-kpi">
          <div className="kpi-label">Mean Distance Margin</div>
          <div className="kpi-value">{summary.meanDistanceMargin.toFixed(4)}</div>
        </div>
      </div>

      <div className="validation-interpretation">
        <strong>Interpretación:</strong> {summary.interpretation}
      </div>

      {summary.warnings.length > 0 && (
        <div className="validation-warnings">
          <strong>Warnings de rigor:</strong>
          <ul>
            {summary.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
