$ErrorActionPreference = 'SilentlyContinue'
$WorkingDir = "C:\Users\madoc\OneDrive\Documents\Lodge&Hotel\frontend"

Write-Host "Starting Vite dev server..."
Write-Host "Working directory: $WorkingDir"

# Set current directory
Set-Location $WorkingDir

# Start node process in background
$Process = Start-Process -FilePath "node" -ArgumentList "./node_modules/vite/bin/vite.js", "--host", "--port", "5173" -PassThru -NoNewWindow

Write-Host "Started process with PID: $($Process.Id)"
Start-Sleep -Seconds 3

# Check if process is still running
if (!$Process.HasExited) {
    Write-Host "Process is running"
    
    # Wait a bit more for server to start
    Start-Sleep -Seconds 2
    
    # Try to connect
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5
        Write-Host "SUCCESS! Server is accessible at http://localhost:5173"
    } catch {
        Write-Host "Server process running but can't connect - may be an IP binding issue"
        Write-Host "Error: $($_.Exception.Message)"
    }
} else {
    Write-Host "Process exited with code: $($Process.ExitCode)"
}