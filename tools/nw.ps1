param([string]$File, [int]$Y0 = 0, [int]$Y1 = 100, [int]$Thresh = 248, [int]$MinN = 30)
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($File)
$bmp = New-Object System.Drawing.Bitmap($img)
$prev = $false
for ($y = $Y0; $y -lt $Y1; $y++) {
  $cnt = 0
  for ($x = 0; $x -lt $bmp.Width; $x += 2) {
    $c = $bmp.GetPixel($x, $y)
    if (($c.R + $c.G + $c.B) / 3 -lt $Thresh) { $cnt++ }
  }
  $on = $cnt -gt $MinN
  if ($on -ne $prev) {
    $tag = "off"
    if ($on) { $tag = "ON" }
    Write-Output ("y=$y nonwhite=$cnt ($tag)")
    $prev = $on
  }
}
$bmp.Dispose()
$img.Dispose()
