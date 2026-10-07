param([string]$File, [string]$Label)
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($File)
$bmp = New-Object System.Drawing.Bitmap($img)
$lines = New-Object System.Collections.Generic.List[string]
$runs = New-Object System.Collections.Generic.List[string]
$inRun = $false; $start = 0; $last = 0
for ($y = 0; $y -lt $bmp.Height; $y += 1) {
  $nGray = 0; $nDark = 0
  for ($x = 0; $x -lt $bmp.Width; $x += 4) {
    $c = $bmp.GetPixel($x, $y)
    $sum = $c.R + $c.G + $c.B
    if ($sum -lt 755) { $nGray++ }
    if ($sum -lt 380) { $nDark++ }
  }
  $w = [int]($bmp.Width / 4)
  if ($nGray -ge ($w - 8)) { $lines.Add($y) }
  if ($nDark -gt 2) {
    if (-not $inRun) { $inRun = $true; $start = $y }
    $last = $y
  } else {
    if ($inRun) { if (($last - $start) -ge 3) { $runs.Add("$start..$last") }; $inRun = $false }
  }
}
if ($inRun) { $runs.Add("$start..$last") }
Write-Output "$Label H=$($bmp.Height)"
Write-Output "$Label fullwidth-lines: $($lines -join ',')"
Write-Output "$Label dark-runs(first 40): $((($runs | Select-Object -First 40)) -join ' | ')"
Write-Output "$Label dark-runs(last 15): $((($runs | Select-Object -Last 15)) -join ' | ')"
$bmp.Dispose(); $img.Dispose()
