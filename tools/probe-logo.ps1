param([string]$File = "C:\Users\GASCAN~1\AppData\Local\Temp\opencode\render\home-mobile.png", [string]$Tag = "ref")
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($File)
$bmp = New-Object System.Drawing.Bitmap($img)
Write-Output "== $Tag red-logo scan (R>150, G<90, B<90) rows 1400..1800 =="
$inRun = $false; $runStart = 0
for ($y = 1400; $y -lt 1800; $y++) {
  $cnt = 0; $minX = 9999; $maxX = -1
  for ($x = 0; $x -lt $bmp.Width; $x += 4) {
    $c = $bmp.GetPixel($x, $y * 2)
    if ($c.R -gt 150 -and $c.G -lt 90 -and $c.B -lt 90) { $cnt++; if ($x -lt $minX) { $minX = $x }; if ($x -gt $maxX) { $maxX = $x } }
  }
  $on = $cnt -ge 2
  if ($on -and -not $inRun) { $inRun = $true; $runStart = $y; $sMin = $minX; $sMax = $maxX }
  if ($on) { if ($minX -lt $sMin) { $sMin = $minX }; if ($maxX -gt $sMax) { $sMax = $maxX } }
  if (-not $on -and $inRun) { $inRun = $false; Write-Output ("y " + $runStart + ".." + ($y-1) + " x " + ($sMin/2) + ".." + ($sMax/2)) }
}
if ($inRun) { Write-Output ("y " + $runStart + "..1799 x " + ($sMin/2) + ".." + ($sMax/2)) }
$bmp.Dispose(); $img.Dispose()
