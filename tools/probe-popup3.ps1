Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("C:\Users\GASCAN~1\AppData\Local\Temp\opencode\render\home-mobile.png")
$bmp = New-Object System.Drawing.Bitmap($img)
foreach ($yy in @(100, 300, 400, 900, 1000)) {
  Write-Output "== horizontal y=$yy =="
  $prev = ""
  for ($x = 0; $x -lt 390; $x += 2) {
    $c = $bmp.GetPixel($x * 2, $yy * 2)
    $k = "" + $c.R + "," + $c.G + "," + $c.B
    if ($k -ne $prev) { Write-Output ("x=$x " + $k); $prev = $k }
  }
}
$bmp.Dispose(); $img.Dispose()
