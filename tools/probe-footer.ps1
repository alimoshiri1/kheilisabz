Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("C:\Users\GASCAN~1\AppData\Local\Temp\opencode\render\home-desktop.png")
$bmp = New-Object System.Drawing.Bitmap($img)
$out = New-Object System.Collections.Generic.List[string]
for ($y = 2330; $y -lt 2480; $y++) {
  $cnt = 0; $min = -1; $max = -1
  for ($x = 0; $x -lt 1440; $x += 2) {
    $c = $bmp.GetPixel($x, $y)
    if (($c.R + $c.G + $c.B) -lt 755) {
      $cnt++
      if ($min -lt 0) { $min = $x }
      $max = $x
    }
  }
  $c10 = $bmp.GetPixel(10, $y)
  $out.Add("y=$y cnt=$cnt x=$min..$max p10=$($c10.R),$($c10.G),$($c10.B)")
}
$out | Out-File -FilePath "C:\Users\GASCAN~1\AppData\Local\Temp\opencode\render\probe-footer.txt" -Encoding utf8
$bmp.Dispose(); $img.Dispose()
Write-Output "done"
