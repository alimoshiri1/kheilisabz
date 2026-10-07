Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("C:\Users\GASCAN~1\AppData\Local\Temp\opencode\render\home-desktop.png")
$bmp = New-Object System.Drawing.Bitmap($img)
foreach ($y in @(1064, 1068, 1312, 1320, 1330)) {
  $c1 = $bmp.GetPixel(5, $y); $c2 = $bmp.GetPixel(700, $y); $c3 = $bmp.GetPixel(1435, $y)
  $min = -1; $max = -1
  for ($x = 0; $x -lt 1440; $x++) {
    $c = $bmp.GetPixel($x, $y)
    if (($c.R + $c.G + $c.B) -lt 755) { if ($min -lt 0) { $min = $x }; $max = $x }
  }
  Write-Output ("y=$y x=$min..$max c5=$($c1.R),$($c1.G),$($c1.B) c700=$($c2.R),$($c2.G),$($c2.B) c1435=$($c3.R),$($c3.G),$($c3.B)")
}
$bmp.Dispose(); $img.Dispose()
