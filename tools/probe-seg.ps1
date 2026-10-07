Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("C:\Users\GASCAN~1\AppData\Local\Temp\opencode\render\home-desktop.png")
$bmp = New-Object System.Drawing.Bitmap($img)
foreach ($y in @(66, 68, 70, 75, 85, 90, 95, 100, 150)) {
  $c = $bmp.GetPixel(10, $y)
  Write-Output ("ref y=$y = " + $c.R + "," + $c.G + "," + $c.B)
}
$bmp.Dispose(); $img.Dispose()
