param(
    [string]$RemoteUser = "assouyat",
    [string]$RemoteHost = "192.168.193.49",
    [string]$RemoteBaseDir = "/tmp/rf_train_job",
    [string]$LocalDatasetDir = ".\rf_dataset",
    [string]$LocalTrainScript = ".\train_or_resume_rf_fingerprint.py",
    [string]$LocalOutputDir = ".\remote_trained_model",
    [string]$RemotePython = "python3",
    [string]$RemoteVenvActivate = "",
    [string]$LocalRequirements = "",
    [bool]$InstallRemoteDeps = $true,
    [double]$TargetCenterFrequencyHz = [double]::NaN,
    [double]$CenterFrequencyToleranceHz = 1.0,
    [int]$Epochs = 20,
    [int]$BatchSize = 128,
    [int]$WindowSize = 1024,
    [int]$Stride = 1024
)

$ErrorActionPreference = "Stop"

function Require-Path {
    param(
        [string]$PathValue,
        [string]$Description
    )
    if (-not (Test-Path $PathValue)) {
        throw "$Description not found: $PathValue"
    }
}

function Run-Checked {
    param(
        [string]$FilePath,
        [string[]]$Arguments,
        [string]$ErrorMessage
    )

    & $FilePath @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "$ErrorMessage Exit code: $LASTEXITCODE"
    }
}

function Get-DatasetStats {
    param(
        [string]$DatasetRoot
    )

    $emitters = @{}
    $centerFreqs = @{}
    $sampleRates = @{}

    Get-ChildItem -Path $DatasetRoot -Recurse -Filter *.json -File | ForEach-Object {
        try {
            $meta = Get-Content $_.FullName -Raw | ConvertFrom-Json
            $id = [string]$meta.emitter_device_id
            if (-not [string]::IsNullOrWhiteSpace($id)) {
                if (-not $emitters.ContainsKey($id)) {
                    $emitters[$id] = 0
                }
                $emitters[$id] += 1
            }

            if ($null -ne $meta.center_frequency_hz -and "$($meta.center_frequency_hz)" -ne "") {
                $cf = [string]([Math]::Round([double]$meta.center_frequency_hz, 3))
                if (-not $centerFreqs.ContainsKey($cf)) {
                    $centerFreqs[$cf] = 0
                }
                $centerFreqs[$cf] += 1
            }

            if ($null -ne $meta.sample_rate_hz -and "$($meta.sample_rate_hz)" -ne "") {
                $sr = [string]([Math]::Round([double]$meta.sample_rate_hz, 6))
                if (-not $sampleRates.ContainsKey($sr)) {
                    $sampleRates[$sr] = 0
                }
                $sampleRates[$sr] += 1
            }
        }
        catch {
            # Ignore malformed json files here; training script performs full validation too.
        }
    }

    return [PSCustomObject]@{
        Emitters = $emitters
        CenterFreqs = $centerFreqs
        SampleRates = $sampleRates
    }
}

function Get-FilteredStatsByCenterFrequency {
    param(
        [string]$DatasetRoot,
        [double]$TargetCenterFrequencyHz,
        [double]$ToleranceHz
    )

    $emitters = @{}
    $sampleRates = @{}

    Get-ChildItem -Path $DatasetRoot -Recurse -Filter *.json -File | ForEach-Object {
        try {
            $meta = Get-Content $_.FullName -Raw | ConvertFrom-Json
            if ($null -eq $meta.center_frequency_hz -or "$($meta.center_frequency_hz)" -eq "") {
                return
            }

            $cf = [double]$meta.center_frequency_hz
            if ([Math]::Abs($cf - $TargetCenterFrequencyHz) -gt $ToleranceHz) {
                return
            }

            $id = [string]$meta.emitter_device_id
            if (-not [string]::IsNullOrWhiteSpace($id)) {
                if (-not $emitters.ContainsKey($id)) {
                    $emitters[$id] = 0
                }
                $emitters[$id] += 1
            }

            if ($null -ne $meta.sample_rate_hz -and "$($meta.sample_rate_hz)" -ne "") {
                $sr = [string]([Math]::Round([double]$meta.sample_rate_hz, 6))
                if (-not $sampleRates.ContainsKey($sr)) {
                    $sampleRates[$sr] = 0
                }
                $sampleRates[$sr] += 1
            }
        }
        catch {
        }
    }

    return [PSCustomObject]@{
        Emitters = $emitters
        SampleRates = $sampleRates
    }
}

Require-Path -PathValue $LocalDatasetDir -Description "Local dataset directory"
Require-Path -PathValue $LocalTrainScript -Description "Local training script"
if ($LocalRequirements -eq "") {
    $LocalRequirements = Join-Path $PSScriptRoot "..\requirements.txt"
}
if ($InstallRemoteDeps) {
    Require-Path -PathValue $LocalRequirements -Description "Local requirements file"
}

$DatasetStats = Get-DatasetStats -DatasetRoot $LocalDatasetDir
if (-not [double]::IsNaN($TargetCenterFrequencyHz)) {
    $FilteredStats = Get-FilteredStatsByCenterFrequency -DatasetRoot $LocalDatasetDir -TargetCenterFrequencyHz $TargetCenterFrequencyHz -ToleranceHz $CenterFrequencyToleranceHz
    if ($FilteredStats.Emitters.Count -lt 2) {
        $summary = if ($FilteredStats.Emitters.Count -eq 0) { "<none>" } else { ($FilteredStats.Emitters.GetEnumerator() | Sort-Object Name | ForEach-Object { "$($_.Name)=$($_.Value)" }) -join ", " }
        throw "Dataset precheck failed for target center frequency $TargetCenterFrequencyHz Hz (+/- $CenterFrequencyToleranceHz): at least 2 unique emitter_device_id values are required. Found $($FilteredStats.Emitters.Count): $summary"
    }
    if ($FilteredStats.SampleRates.Count -ne 1) {
        $summary = if ($FilteredStats.SampleRates.Count -eq 0) { "<none>" } else { ($FilteredStats.SampleRates.GetEnumerator() | Sort-Object Name | ForEach-Object { "$($_.Name)sps=$($_.Value)" }) -join ", " }
        throw "Dataset precheck failed for target center frequency $TargetCenterFrequencyHz Hz (+/- $CenterFrequencyToleranceHz): exactly 1 sample_rate_hz is required. Found $($FilteredStats.SampleRates.Count): $summary"
    }
}
elseif ($DatasetStats.Emitters.Count -lt 2) {
    $summary = if ($DatasetStats.Emitters.Count -eq 0) { "<none>" } else { ($DatasetStats.Emitters.GetEnumerator() | Sort-Object Name | ForEach-Object { "$($_.Name)=$($_.Value)" }) -join ", " }
    throw "Dataset precheck failed: at least 2 unique emitter_device_id values are required. Found $($DatasetStats.Emitters.Count): $summary"
}
elseif ($DatasetStats.CenterFreqs.Count -ne 1) {
    $summary = if ($DatasetStats.CenterFreqs.Count -eq 0) { "<none>" } else { ($DatasetStats.CenterFreqs.GetEnumerator() | Sort-Object Name | ForEach-Object { "$($_.Name)Hz=$($_.Value)" }) -join ", " }
    throw "Dataset precheck failed: exactly 1 center_frequency_hz is required. Found $($DatasetStats.CenterFreqs.Count): $summary"
}
elseif ($DatasetStats.SampleRates.Count -ne 1) {
    $summary = if ($DatasetStats.SampleRates.Count -eq 0) { "<none>" } else { ($DatasetStats.SampleRates.GetEnumerator() | Sort-Object Name | ForEach-Object { "$($_.Name)sps=$($_.Value)" }) -join ", " }
    throw "Dataset precheck failed: exactly 1 sample_rate_hz is required. Found $($DatasetStats.SampleRates.Count): $summary"
}

New-Item -ItemType Directory -Force -Path $LocalOutputDir | Out-Null

$DatasetZip = Join-Path $env:TEMP "rf_dataset_upload.zip"
$TempRemoteScript = Join-Path $env:TEMP "run_remote_training.sh"
$LocalTarOut = Join-Path $LocalOutputDir "model_artifacts.tar.gz"
$LocalLogOut = Join-Path $LocalOutputDir "training_remote.log"

$RemoteDatasetZip = "$RemoteBaseDir/rf_dataset_upload.zip"
$RemoteTrainScript = "$RemoteBaseDir/train_or_resume_rf_fingerprint.py"
$RemoteRequirements = "$RemoteBaseDir/requirements.txt"
$RemoteRunScript = "$RemoteBaseDir/run_remote_training.sh"
$RemoteModelDir = "$RemoteBaseDir/rf_model_store"
$RemoteDatasetDir = "$RemoteBaseDir/rf_dataset"
$RemoteTarOut = "$RemoteBaseDir/model_artifacts.tar.gz"
$RemoteLogOut = "$RemoteBaseDir/training.log"
$TargetFreqArgs = ""
if (-not [double]::IsNaN($TargetCenterFrequencyHz)) {
    $TargetFreqArgs = "--target-center-frequency-hz $TargetCenterFrequencyHz --center-frequency-tolerance-hz $CenterFrequencyToleranceHz"
}

if (Test-Path $DatasetZip) {
    Remove-Item $DatasetZip -Force
}
if (Test-Path $TempRemoteScript) {
    Remove-Item $TempRemoteScript -Force
}
if (Test-Path $LocalTarOut) {
    Remove-Item $LocalTarOut -Force
}
if (Test-Path $LocalLogOut) {
    Remove-Item $LocalLogOut -Force
}

Write-Host "[INFO] Compressing dataset..."
Compress-Archive -Path (Join-Path $LocalDatasetDir "*") -DestinationPath $DatasetZip -Force

Write-Host "[INFO] Preparing remote base directory..."
Run-Checked -FilePath "ssh" -Arguments @(
    "$RemoteUser@$RemoteHost",
    "rm -rf '$RemoteBaseDir' && mkdir -p '$RemoteBaseDir'"
) -ErrorMessage "Remote base directory preparation failed."

Write-Host "[INFO] Uploading dataset zip..."
Run-Checked -FilePath "scp" -Arguments @(
    $DatasetZip,
    "$RemoteUser@$RemoteHost`:$RemoteDatasetZip"
) -ErrorMessage "Dataset upload failed."

Write-Host "[INFO] Uploading training script..."
Run-Checked -FilePath "scp" -Arguments @(
    $LocalTrainScript,
    "$RemoteUser@$RemoteHost`:$RemoteTrainScript"
) -ErrorMessage "Training script upload failed."

if ($InstallRemoteDeps) {
    Write-Host "[INFO] Uploading requirements file..."
    Run-Checked -FilePath "scp" -Arguments @(
        $LocalRequirements,
        "$RemoteUser@$RemoteHost`:$RemoteRequirements"
    ) -ErrorMessage "Requirements upload failed."
}

$ActivateBlock = @'
if [ -n "$REMOTE_VENV_ACTIVATE" ]; then
  if [ -f "$REMOTE_VENV_ACTIVATE" ]; then
    echo "[INFO] Activating remote virtualenv: $REMOTE_VENV_ACTIVATE"
    # shellcheck source=/dev/null
    source "$REMOTE_VENV_ACTIVATE"
  else
    echo "[WARN] Remote virtualenv activate script not found: $REMOTE_VENV_ACTIVATE"
    echo "[WARN] Continuing without virtualenv activation."
  fi
fi

if [ -z "$REMOTE_VENV_ACTIVATE" ] || [ ! -f "$REMOTE_VENV_ACTIVATE" ]; then
  AUTO_VENV_DIR="$REMOTE_BASE_DIR/.venv"
  echo "[INFO] Creating fallback virtualenv at: $AUTO_VENV_DIR"
  "$REMOTE_PYTHON" -m venv "$AUTO_VENV_DIR"
  source "$AUTO_VENV_DIR/bin/activate"
  REMOTE_PYTHON="python"
else
  REMOTE_PYTHON="python"
fi
'@

$RemoteScriptContent = @'
#!/usr/bin/env bash
set -euo pipefail

REMOTE_BASE_DIR="__REMOTE_BASE_DIR__"
REMOTE_DATASET_ZIP="__REMOTE_DATASET_ZIP__"
REMOTE_DATASET_DIR="__REMOTE_DATASET_DIR__"
REMOTE_MODEL_DIR="__REMOTE_MODEL_DIR__"
REMOTE_TAR_OUT="__REMOTE_TAR_OUT__"
REMOTE_TRAIN_SCRIPT="__REMOTE_TRAIN_SCRIPT__"
REMOTE_REQUIREMENTS="__REMOTE_REQUIREMENTS__"
REMOTE_LOG_OUT="__REMOTE_LOG_OUT__"
REMOTE_PYTHON="__REMOTE_PYTHON__"
REMOTE_VENV_ACTIVATE="__REMOTE_VENV_ACTIVATE__"
INSTALL_REMOTE_DEPS="__INSTALL_REMOTE_DEPS__"
TARGET_FREQ_ARGS="__TARGET_FREQ_ARGS__"

cd "$REMOTE_BASE_DIR"

__ACTIVATE_BLOCK__

echo "[INFO] Remote python executable:"
which "$REMOTE_PYTHON" || true
echo "[INFO] Python version:"
"$REMOTE_PYTHON" --version || true

if [ "$INSTALL_REMOTE_DEPS" = "true" ]; then
  echo "[INFO] Installing remote Python dependencies..."
  "$REMOTE_PYTHON" -m pip install --upgrade pip
  "$REMOTE_PYTHON" -m pip install -r "$REMOTE_REQUIREMENTS"
fi

echo "[INFO] Checking torch availability..."
"$REMOTE_PYTHON" - <<'PY'
import importlib.util
import sys

if importlib.util.find_spec("torch") is None:
    print("[ERROR] Missing dependency: torch")
    print("[HINT] Provide a valid venv in -RemoteVenvActivate or run with -InstallRemoteDeps `$true")
    sys.exit(12)

import torch
print("torch_version=", torch.__version__)
print("torch_cuda_available=", torch.cuda.is_available())
print("torch_device_count=", torch.cuda.device_count())
PY

mkdir -p "$REMOTE_DATASET_DIR"

"$REMOTE_PYTHON" - <<'PY'
import zipfile
zip_path = r"__REMOTE_DATASET_ZIP__"
out_dir = r"__REMOTE_DATASET_DIR__"
with zipfile.ZipFile(zip_path, "r") as zf:
    zf.extractall(out_dir)
print("[OK] Dataset extracted")
PY

echo "[INFO] Starting training..."
"$REMOTE_PYTHON" "$REMOTE_TRAIN_SCRIPT" \
  --data-root "$REMOTE_DATASET_DIR" \
  --model-root "$REMOTE_MODEL_DIR" \
  $TARGET_FREQ_ARGS \
  --epochs __EPOCHS__ \
  --batch-size __BATCH_SIZE__ \
  --window-size __WINDOW_SIZE__ \
  --stride __STRIDE__ 2>&1 | tee "$REMOTE_LOG_OUT"

test -f "$REMOTE_MODEL_DIR/best_model.pt"
test -f "$REMOTE_MODEL_DIR/training_history.json"
test -f "$REMOTE_MODEL_DIR/enrollment_profiles.json"
test -f "$REMOTE_MODEL_DIR/dataset_manifest.json"

tar -czf "$REMOTE_TAR_OUT" -C "$REMOTE_MODEL_DIR" .

echo "[OK] Remote training completed"
'@

$RemoteScriptContent = $RemoteScriptContent.
    Replace("__REMOTE_BASE_DIR__", $RemoteBaseDir).
    Replace("__REMOTE_DATASET_ZIP__", $RemoteDatasetZip).
    Replace("__REMOTE_DATASET_DIR__", $RemoteDatasetDir).
    Replace("__REMOTE_MODEL_DIR__", $RemoteModelDir).
    Replace("__REMOTE_TAR_OUT__", $RemoteTarOut).
    Replace("__REMOTE_TRAIN_SCRIPT__", $RemoteTrainScript).
    Replace("__REMOTE_REQUIREMENTS__", $RemoteRequirements).
    Replace("__REMOTE_LOG_OUT__", $RemoteLogOut).
    Replace("__REMOTE_PYTHON__", $RemotePython).
    Replace("__REMOTE_VENV_ACTIVATE__", $RemoteVenvActivate).
    Replace("__INSTALL_REMOTE_DEPS__", $InstallRemoteDeps.ToString().ToLower()).
    Replace("__TARGET_FREQ_ARGS__", $TargetFreqArgs).
    Replace("__ACTIVATE_BLOCK__", $ActivateBlock).
    Replace("__EPOCHS__", [string]$Epochs).
    Replace("__BATCH_SIZE__", [string]$BatchSize).
    Replace("__WINDOW_SIZE__", [string]$WindowSize).
    Replace("__STRIDE__", [string]$Stride)

$RemoteScriptContent = $RemoteScriptContent -replace "`r`n", "`n"

$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($TempRemoteScript, $RemoteScriptContent, $Utf8NoBom)

Write-Host "[INFO] Uploading remote runner script..."
Run-Checked -FilePath "scp" -Arguments @(
    $TempRemoteScript,
    "$RemoteUser@$RemoteHost`:$RemoteRunScript"
) -ErrorMessage "Remote runner script upload failed."

Write-Host "[INFO] Setting execute permission..."
Run-Checked -FilePath "ssh" -Arguments @(
    "$RemoteUser@$RemoteHost",
    "chmod +x '$RemoteRunScript'"
) -ErrorMessage "chmod on remote script failed."

try {
    Write-Host "[INFO] Launching remote training..."
    Run-Checked -FilePath "ssh" -Arguments @(
        "$RemoteUser@$RemoteHost",
        "'$RemoteRunScript'"
    ) -ErrorMessage "Remote training execution failed."
}
catch {
    Write-Host "[WARN] Remote training failed. Attempting to download remote log if present..."
    try {
        Run-Checked -FilePath "scp" -Arguments @(
            "$RemoteUser@$RemoteHost`:$RemoteLogOut",
            $LocalLogOut
        ) -ErrorMessage "Remote log download after failure failed."
    }
    catch {
        Write-Host "[WARN] Could not download remote log after failure."
    }
    throw
}

Write-Host "[INFO] Verifying remote artifact exists..."
Run-Checked -FilePath "ssh" -Arguments @(
    "$RemoteUser@$RemoteHost",
    "test -f '$RemoteTarOut' && echo '[OK] Remote artifact exists'"
) -ErrorMessage "Remote artifact verification failed."

Write-Host "[INFO] Downloading remote training log..."
Run-Checked -FilePath "scp" -Arguments @(
    "$RemoteUser@$RemoteHost`:$RemoteLogOut",
    $LocalLogOut
) -ErrorMessage "Remote log download failed."

Write-Host "[INFO] Downloading trained model artifacts..."
Run-Checked -FilePath "scp" -Arguments @(
    "$RemoteUser@$RemoteHost`:$RemoteTarOut",
    $LocalTarOut
) -ErrorMessage "Model artifact download failed."

Write-Host "[INFO] Extracting model locally..."
Run-Checked -FilePath "tar" -Arguments @(
    "-xzf",
    $LocalTarOut,
    "-C",
    $LocalOutputDir
) -ErrorMessage "Local model extraction failed."

$ExpectedFiles = @(
    "best_model.pt",
    "training_history.json",
    "enrollment_profiles.json",
    "dataset_manifest.json"
)

foreach ($f in $ExpectedFiles) {
    $p = Join-Path $LocalOutputDir $f
    if (-not (Test-Path $p)) {
        throw "Expected output file missing after extraction: $p"
    }
}

Write-Host "[INFO] Cleaning remote artifacts..."
Run-Checked -FilePath "ssh" -Arguments @(
    "$RemoteUser@$RemoteHost",
    "rm -rf '$RemoteBaseDir'"
) -ErrorMessage "Remote cleanup failed."

Write-Host "[INFO] Verifying remote cleanup..."
Run-Checked -FilePath "ssh" -Arguments @(
    "$RemoteUser@$RemoteHost",
    "if [ -e '$RemoteBaseDir' ]; then echo '[ERROR] Remote cleanup failed'; exit 1; else echo '[OK] Remote cleanup verified'; fi"
) -ErrorMessage "Remote cleanup verification failed."

Write-Host "[OK] Remote training finished"
Write-Host "[OK] Local model available in: $LocalOutputDir"
Write-Host "[OK] Remote log downloaded to: $LocalLogOut"
