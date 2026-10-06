
$env:Path = "E:\nodejs;" + $env:Path
Write-Host "Temporarily renaming package.jsons to bypass Vercel services detection..."
Rename-Item frontend\package.json package.tmp.json -ErrorAction SilentlyContinue
Rename-Item backend\package.json package.tmp.json -ErrorAction SilentlyContinue

Write-Host "Starting Vercel Deployment..."
vercel --prod

Write-Host "Restoring package.jsons..."
Rename-Item frontend\package.tmp.json package.json -ErrorAction SilentlyContinue
Rename-Item backend\package.tmp.json package.json -ErrorAction SilentlyContinue
Write-Host "Deployment finished! You can close this window."

