param(
  [Parameter(Mandatory=$true)][string]$File,
  [int]$Scale = 1,
  [Parameter(Mandatory=$true)][int]$Y0,
  [Parameter(Mandatory=$true)][int]$Y1,
  [int]$X0 = 0,
  [int]$X1 = -1,
  [int]$Thresh = 245
)
Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile($File)
$w = $bmp.Width
$X0d = [int]($X0 * $Scale)
if ($X1 -lt 0) { $X1d = [int]($w - 1) } else { $X1d = [int]($X1 * $Scale - 1) }
$Y0d = [int]($Y0 * $Scale)
$Y1d = [int]([Math]::Min($Y1 * $Scale, $bmp.Height) - 1)
for ($y = $Y0d; $y -le $Y1d; $y++) {
  $sr = 0; $sg = 0; $sb = 0; $nw = 0; $n = 0
  for ($x = $X0d; $x -le $X1d; $x++) {
    $p = $bmp.GetPixel($x, $y)
    $sr += $p.R; $sg += $p.G; $sb += $p.B; $n++
    if ($p.R -lt $Thresh -or $p.G -lt $Thresh -or $p.B -lt $Thresh) { $nw++ }
  }
  $iy = [Math]::Floor($y / $Scale)
  "y=$iy avg=$([int]($sr/$n)),$([int]($sg/$n)),$([int]($sb/$n)) nw=$nw"
}
$bmp.Dispose()
