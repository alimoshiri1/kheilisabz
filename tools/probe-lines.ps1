param([string]$File, [string]$Label)
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($File)
$bmp = New-Object System.Drawing.Bitmap($img)
$runs = New-Object System.Collections.Generic.List[string]
$inRun = $false; $start = 0; $last = 0
for ($y = 2600; $y -le 2915; $y++) {
  $n = 0
  for ($x = 834; $x -lt 1290; $x += 2) {
    $c = $bmp.GetPixel($x, $y)
    if (($c.R + $c.G + $c.B) -lt 380) { $n++ }
  }
  if ($n -gt 3) {
    if (-not $inRun) { $inRun = $true; $start = $y }
    $last = $y
  } else {
    if ($inRun) { $runs.Add("$start..$last"); $inRun = $false }
  }
}
if ($inRun) { $runs.Add("$start..$last") }
Write-Output "$Label runs: $($runs -join ' | ')"
$bmp.Dispose(); $img.Dispose()
