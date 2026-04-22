param(
    [string]$RemoteUser = "assouyat",
    [string]$RemoteHost = "192.168.193.49",
    [string]$PythonExe = "C:\Users\Usuario\radioconda\python.exe",
    [int]$Port = 8000,
    [switch]$SkipSshSetup
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $ProjectRoot "backend"
$SshDir = Join-Path $env:USERPROFILE ".ssh"
$KeyPath = Join-Path $SshDir "id_ed25519"
$PubKeyPath = "$KeyPath.pub"

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

if (-not $SkipSshSetup) {
    New-Item -ItemType Directory -Force -Path $SshDir | Out-Null

    if (-not (Test-Path $KeyPath)) {
        Write-Host "[INFO] Generating SSH key: $KeyPath"
        # In PowerShell, passing an empty argument to -N can be dropped with call operator.
        # Use Start-Process with explicit quoted empty string to force empty passphrase.
        $proc = Start-Process -FilePath "ssh-keygen" `
            -ArgumentList @("-t", "ed25519", "-f", $KeyPath, "-N", '""') `
            -NoNewWindow -Wait -PassThru
        if ($proc.ExitCode -ne 0) {
            throw "ssh-keygen failed. Exit code: $($proc.ExitCode)"
        }
    }

    Write-Host "[INFO] Testing passwordless SSH..."
    & ssh -o BatchMode=yes -o ConnectTimeout=5 "$RemoteUser@$RemoteHost" "echo OK" | Out-Null
    $passwordlessWorks = ($LASTEXITCODE -eq 0)

    if (-not $passwordlessWorks) {
        Write-Host "[INFO] Installing public key on remote host (password may be requested once)..."
        Get-Content -Raw $PubKeyPath |
            ssh "$RemoteUser@$RemoteHost" "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && sort -u ~/.ssh/authorized_keys -o ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"

        if ($LASTEXITCODE -ne 0) {
            throw "Failed to install SSH key on remote host."
        }

        Write-Host "[INFO] Re-testing passwordless SSH..."
        Run-Checked -FilePath "ssh" -Arguments @("-o", "BatchMode=yes", "-o", "ConnectTimeout=5", "$RemoteUser@$RemoteHost", "echo OK") -ErrorMessage "Passwordless SSH test failed after key installation."
    }

    Write-Host "[OK] SSH is ready for non-interactive remote training."
}

Write-Host "[INFO] Starting backend..."
Set-Location $BackendDir
Run-Checked -FilePath $PythonExe -Arguments @("-m", "uvicorn", "app.main:app", "--reload", "--port", "$Port") -ErrorMessage "Backend startup failed."
