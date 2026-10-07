Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("C:\Users\GASCAN~1\AppData\Local\Temp\opencode\render\login-desktop.png")
$bmp = New-Object System.Drawing.Bitmap($img)
$w = $bmp.Width; $h = $bmp.Height
$out = New-Object System.Collections.Generic.List[string]
$bandStart = -1; $bandCount = 0
for ($y = 0; $y -lt $h; $y += 2) {
  $cnt = 0
  for ($x = 0; $x -lt $w; $x += 4) {
    $c = $bmp.GetPixel($x, $y)
    if ($c.A -gt 200 -and ($c.R + $c.G + $c.B) -lt 600) { $cnt++ }
  }
  if ($cnt -gt 0) {
    if ($bandStart -lt 0) { $bandStart = $y }
    $bandCount++
    $bandEnd = $y
  } else {
    if ($bandStart -ge 0 -and $bandCount -gt 0) {
      $out.Add("band $bandStart..$bandEnd (h=$($bandEnd-$bandStart+2))")
      $bandStart = -1; $bandCount = 0
    }
  }
}
if ($bandStart -ge 0) { $out.Add("band $bandStart..$bandEnd") }
$out | Out-File -FilePath "C:\Users\GASCAN~1\AppData\Local\Temp\opencode\render\login-bands.txt" -Encoding utf8
$bmp.Dispose(); $img.Dispose()
Write-Output "rows done $h"
