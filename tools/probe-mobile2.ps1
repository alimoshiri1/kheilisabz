param([string]$File, [string]$Label)
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($File)
$bmp = New-Object System.Drawing.Bitmap($img)
$runs = New-Object System.Collections.Generic.List[string]
$lines = New-Object System.Collections.Generic.List[string]
$inRun = $false; $start = 0; $last = 0
$h = $bmp.Height; $w = $bmp.Width
for ($y = 0; $y -lt $h; $y += 2) {
  $nDarkR = 0; $nDark = 0; $nGray = 0
  for ($x = 0; $x -lt $w; $x += 4) {
    $c = $bmp.GetPixel($x, $y)
    $sum = $c.R + $c.G + $c.B
    if ($sum -lt 755) { $nGray++ }
    if ($sum -lt 380) { $nDark++; if ($x -ge 640) { $nDarkR++ } }
  }
  $fw = [int]($w / 4)
  if ($nGray -ge ($fw - 10) -and $nDark -le 14) { $lines.Add([string][int]($y / 2)) }
  if ($nDarkR -gt 1) {
    if (-not $inRun) { $inRun = $true; $start = $y }
    $last = $y
  } else {
    if ($inRun) { $runs.Add("$([int]($start/2))..$([int]($last/2))"); $inRun = $false }
  }
}
if ($inRun) { $runs.Add("$([int]($start/2))..$([int]($last/2))") }
Write-Output "$Label CSS-H=$([int]($h/2))"
Write-Output "$Label thin-lines(CSS): $($lines -join ',')"
Write-Output "$Label right-text-runs(CSS): $($runs -join ' | ')"
$bmp.Dispose(); $img.Dispose()
