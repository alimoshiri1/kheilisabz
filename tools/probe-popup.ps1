Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("C:\Users\GASCAN~1\AppData\Local\Temp\opencode\render\home-mobile.png")
$bmp = New-Object System.Drawing.Bitmap($img)
function Sat([System.Drawing.Color]$c) { return [Math]::Abs($c.R-255) + [Math]::Abs($c.G-255) + [Math]::Abs($c.B-255) }
Write-Output "== vertical center x=195 CSS (device 390) =="
for ($y = 300; $y -le 920; $y += 10) {
  $c = $bmp.GetPixel(390, $y * 2)
  Write-Output ("y=$y " + $c.R + "," + $c.G + "," + $c.B)
}
Write-Output "== horizontal y=700 CSS (device 1400) =="
for ($x = 0; $x -le 390; $x += 5) {
  $c = $bmp.GetPixel($x * 2, 1400)
  $tag = ""
  if ((Sat $c) -eq 0) { $tag = " WHITE" }
  Write-Output ("x=$x " + $c.R + "," + $c.G + "," + $c.B + $tag)
}
Write-Output "== horizontal y=500 CSS =="
for ($x = 0; $x -le 390; $x += 5) {
  $c = $bmp.GetPixel($x * 2, 1000)
  $tag = ""
  if ((Sat $c) -eq 0) { $tag = " WHITE" }
  Write-Output ("x=$x " + $c.R + "," + $c.G + "," + $c.B + $tag)
}
$bmp.Dispose(); $img.Dispose()
