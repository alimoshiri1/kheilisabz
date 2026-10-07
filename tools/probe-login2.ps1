Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("C:\Users\GASCAN~1\AppData\Local\Temp\opencode\render\login-desktop.png")
$bmp = New-Object System.Drawing.Bitmap($img)
$out = New-Object System.Collections.Generic.List[string]
for ($y = 170; $y -lt 1600; $y += 15) {
  $cnt = 0; $min = -1; $max = -1
  for ($x = 0; $x -lt 1440; $x += 3) {
    $c = $bmp.GetPixel($x, $y)
    if ($c.A -gt 200 -and ($c.R + $c.G + $c.B) -lt 620) {
      $cnt++
      if ($min -lt 0) { $min = $x }
      $max = $x
    }
  }
  if ($cnt -gt 0) {
    $c0 = $bmp.GetPixel(10, $y)
    $out.Add("y=$y cnt=$cnt x=$min..$max bg=$($c0.R),$($c0.G),$($c0.B)")
  } else {
    $c0 = $bmp.GetPixel(10, $y)
    $out.Add("y=$y bg=$($c0.R),$($c0.G),$($c0.B)")
  }
}
$out | Out-File -FilePath "C:\Users\GASCAN~1\AppData\Local\Temp\opencode\render\login-scan.txt" -Encoding utf8
$bmp.Dispose(); $img.Dispose()
Write-Output "done"
