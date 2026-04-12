$headers = @{
    "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4dnRxZnR0eXpseHN1ZW9pd3V3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUwODU1NywiZXhwIjoyMDkxMDg0NTU3fQ.Z6cefQwmko9tN8Vk-TSev9cbFNG07QoVMigLut9opBY"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4dnRxZnR0eXpseHN1ZW9pd3V3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUwODU1NywiZXhwIjoyMDkxMDg0NTU3fQ.Z6cefQwmko9tN8Vk-TSev9cbFNG07QoVMigLut9opBY"
    "Content-Type" = "application/json"
}

# Update admin user role
$body = @{
    user_metadata = @{
        role = "Administrator"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://wxvtqfttyzlxsueoiwuw.supabase.co/auth/v1/admin/users/26649060-ea49-455c-ba0c-7963fbaf8b19" -Method PUT -Headers $headers -Body $body

# Update manager user role
$body2 = @{
    user_metadata = @{
        role = "Manager"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://wxvtqfttyzlxsueoiwuw.supabase.co/auth/v1/admin/users/d80ecac1-c467-44e3-b260-60a68ef7be2e" -Method PUT -Headers $headers -Body $body2

Write-Host "Roles updated!"