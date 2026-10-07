Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("C:\Users\GASCAN~1\AppData\Local\Temp\opencode\render\home-mobile.png")
$bmp = New-Object System.Drawing.Bitmap($img)
Write-Output "== vertical center x=195 CSS, y=0..340 =="
for ($y = 0; $y -le 340; $y += 5) {
  $c = $bmp.GetPixel(390, $y * 2)
  Write-Output ("y=$y " + $c.R + "," + $c.G + "," + $c.B)
}
Write-Output "== horizontal y=650 (green button) =="
for ($x = 0; $x -lt 390; $x += 5) {
  $c = $bmp.GetPixel($x * 2, 1300)
  Write-Output ("x=$x " + $c.R + "," + $c.G + "," + $c.B)
}
Write-Output "== horizontal y=865 (red button) =="
for ($x = 0; $x -lt 390; $x += 5) {
  $c = $bmp.GetPixel($x * 2, 1730)
  Write-Output ("x=$x " + $c.R + "," + $c.G + "," + $c.B)
}
$bmp.Dispose(); $img.Dispose()
