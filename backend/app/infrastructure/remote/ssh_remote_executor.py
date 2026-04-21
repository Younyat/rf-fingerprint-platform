import subprocess


class SSHRemoteExecutor:
    def run(self, command: list[str], cwd: str | None = None) -> dict:
        proc = subprocess.run(command, cwd=cwd, capture_output=True, text=True)
        return {
            "returncode": proc.returncode,
            "stdout": proc.stdout,
            "stderr": proc.stderr,
        }
