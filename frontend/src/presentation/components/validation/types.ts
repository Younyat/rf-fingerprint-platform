export interface ValidationRecordReport {
  true_device: string;
  session_id: string;
  num_windows: number;
  predicted_device_majority_vote: string | null;
  closed_set_correct: boolean;
  distance_to_true_profile: number;
  true_accept_threshold: number;
  same_device_accept: boolean;
  nearest_profile_device: string;
  nearest_profile_distance: number;
  all_profile_distances: Record<string, number>;
  vote_distribution: Record<string, number>;
}

export interface ValidationReport {
  num_validation_records: number;
  window_level_closed_set_accuracy: number;
  record_level_closed_set_accuracy: number;
  records: ValidationRecordReport[];
}

export interface ValidationRunResponse {
  command_result: {
    returncode: number;
    stdout: string;
    stderr: string;
  };
  output_json: string;
  selected_count: number;
  report?: ValidationReport;
}

export interface DeviceValidationStats {
  device: string;
  records: number;
  sessions: number;
  recordAccuracy: number;
  acceptRate: number;
  meanDistance: number;
  meanThreshold: number;
  suspiciousRate: number;
}

export interface ValidationScientificSummary {
  records: number;
  windowAccuracy: number;
  recordAccuracy: number;
  acceptanceRate: number;
  suspiciousRate: number;
  meanDistanceToTrueProfile: number;
  meanDistanceMargin: number;
  qualityLabel: string;
  interpretation: string;
  warnings: string[];
  perDevice: DeviceValidationStats[];
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function buildScientificSummary(report: ValidationReport): ValidationScientificSummary {
  const records = report.records || [];
  const acceptRate = mean(records.map((r) => (r.same_device_accept ? 1 : 0)));
  const suspiciousRate = mean(
    records.map((r) => (!r.same_device_accept || r.nearest_profile_device !== r.true_device ? 1 : 0)),
  );
  const meanDistance = mean(records.map((r) => r.distance_to_true_profile));

  const margins = records.map((r) => {
    const entries = Object.entries(r.all_profile_distances || {}).sort((a, b) => a[1] - b[1]);
    if (entries.length < 2) return 0;
    const trueDist = r.all_profile_distances[r.true_device] ?? Number.POSITIVE_INFINITY;
    const bestOther = entries.find(([dev]) => dev !== r.true_device)?.[1] ?? entries[0][1];
    return bestOther - trueDist;
  });
  const meanMargin = mean(margins);

  let qualityLabel = "Low";
  let interpretation = "Separabilidad baja. Requiere más sesiones por emisor y control estricto de condiciones.";
  if (report.record_level_closed_set_accuracy >= 0.9 && acceptRate >= 0.9 && meanMargin > 0.05) {
    qualityLabel = "High";
    interpretation = "Modelo consistente en clasificación y verificación. El margen de distancia sugiere buena separabilidad.";
  } else if (report.record_level_closed_set_accuracy >= 0.75 && acceptRate >= 0.75) {
    qualityLabel = "Medium";
    interpretation = "Rendimiento útil pero sensible a condiciones de captura. Conviene ampliar dataset de validación.";
  }

  const byDevice = new Map<string, ValidationRecordReport[]>();
  for (const rec of records) {
    const arr = byDevice.get(rec.true_device) || [];
    arr.push(rec);
    byDevice.set(rec.true_device, arr);
  }

  const perDevice: DeviceValidationStats[] = Array.from(byDevice.entries()).map(([device, recs]) => {
    const sessions = new Set(recs.map((r) => r.session_id)).size;
    return {
      device,
      records: recs.length,
      sessions,
      recordAccuracy: mean(recs.map((r) => (r.closed_set_correct ? 1 : 0))),
      acceptRate: mean(recs.map((r) => (r.same_device_accept ? 1 : 0))),
      meanDistance: mean(recs.map((r) => r.distance_to_true_profile)),
      meanThreshold: mean(recs.map((r) => r.true_accept_threshold)),
      suspiciousRate: mean(recs.map((r) => (!r.same_device_accept || r.nearest_profile_device !== r.true_device ? 1 : 0))),
    };
  });

  const warnings: string[] = [];
  if (report.num_validation_records < 2) warnings.push("Menos de 2 capturas de validación: resultado estadísticamente débil.");
  if (perDevice.some((d) => d.records < 2)) warnings.push("Hay emisores con menos de 2 capturas en validación.");
  if (perDevice.some((d) => d.sessions < 2)) warnings.push("Hay emisores con menos de 2 sesiones en validación.");
  if (report.record_level_closed_set_accuracy < 0.7) warnings.push("Accuracy por captura por debajo de 0.70.");
  if (acceptRate < 0.7) warnings.push("Tasa de aceptación baja: revisar umbrales de enrolamiento.");
  if (meanMargin <= 0) warnings.push("Margen de distancias no separa claramente emisor verdadero frente a otros perfiles.");

  return {
    records: report.num_validation_records,
    windowAccuracy: report.window_level_closed_set_accuracy,
    recordAccuracy: report.record_level_closed_set_accuracy,
    acceptanceRate: acceptRate,
    suspiciousRate,
    meanDistanceToTrueProfile: meanDistance,
    meanDistanceMargin: meanMargin,
    qualityLabel,
    interpretation,
    warnings,
    perDevice,
  };
}
