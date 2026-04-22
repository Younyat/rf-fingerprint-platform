import { DeviceValidationStats } from "./types";

function pct(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

interface PerDeviceValidationTableProps {
  rows: DeviceValidationStats[];
}

export function PerDeviceValidationTable({ rows }: PerDeviceValidationTableProps) {
  return (
    <section className="panel">
      <h3>Per Device Validation</h3>
      <div className="validation-table-wrap">
        <table className="validation-table">
          <thead>
            <tr>
              <th>Device</th>
              <th>Records</th>
              <th>Sessions</th>
              <th>Record Accuracy</th>
              <th>Accept Rate</th>
              <th>Suspicious Rate</th>
              <th>Mean Distance</th>
              <th>Mean Threshold</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.device}>
                <td>{row.device}</td>
                <td>{row.records}</td>
                <td>{row.sessions}</td>
                <td>{pct(row.recordAccuracy)}</td>
                <td>{pct(row.acceptRate)}</td>
                <td>{pct(row.suspiciousRate)}</td>
                <td>{row.meanDistance.toFixed(4)}</td>
                <td>{row.meanThreshold.toFixed(4)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8}>No per-device data available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
