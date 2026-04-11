$ErrorActionPreference = 'SilentlyContinue'
Write-Host "Checking port 5173..."

# Get all listening ports
$listening = Get-NetTCPConnection -State Listen | Select-Object LocalAddress, LocalPort, OwningProcess
$port5173 = $listening | Where-Object { $_.LocalPort -eq 5173 }

if ($port5173) {
    Write-Host "Port 5173 IS listening!"
    $port5173 | Format-List
    $process = Get-Process -Id $port5173.OwningProcess
    Write-Host "Process: $($process.ProcessName)"
} else {
    Write-Host "Port 5173 is NOT listening"
    Write-Host "`nAll listening ports:"
    Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -ge 5000 -and $_.LocalPort -le 6000 } | Format-Table LocalAddress, LocalPort, OwningProcess
}