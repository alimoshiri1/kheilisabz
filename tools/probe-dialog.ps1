Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("C:\Users\GASCAN~1\AppData\Local\Temp\opencode\render\home-mobile.png")
$bmp = New-Object System.Drawing.Bitmap($img)
Write-Output "== x=60 (device, CSS30) =="
for ($y = 560; $y -le 1120; $y += 20) {
  $c = $bmp.GetPixel(60, $y * 2)
  Write-Output ("y=$y " + $c.R + "," + $c.G + "," + $c.B)
}
Write-Output "== x=720 (device, CSS360) =="
for ($y = 560; $y -le 1120; $y += 20) {
  $c = $bmp.GetPixel(720, $y * 2)
  Write-Output ("y=$y " + $c.R + "," + $c.G + "," + $c.B)
}
$bmp.Dispose(); $img.Dispose()
