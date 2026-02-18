$port = 8080
$tcp = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($tcp) {
    $processId = $tcp.OwningProcess
    $processId = $processId | Select-Object -Unique
    foreach ($pid in $processId) {
        Write-Host "Killing process ID: $pid"
        Stop-Process -Id $pid -Force
    }
} else {
    Write-Host "No process found on port $port."
}
