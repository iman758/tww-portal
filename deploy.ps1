$env:Path = "E:\nodejs;" + $env:Path
Write-Host "Starting Vercel Deployment..."
vercel --prod
Write-Host "Deployment finished! You can close this window."
