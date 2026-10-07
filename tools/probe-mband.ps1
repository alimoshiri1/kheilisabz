Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("C:\Users\GASCAN~1\AppData\Local\Temp\opencode\render\home-mobile.png")
$bmp = New-Object System.Drawing.Bitmap($img)
Write-Output "== colors x=400 (center, device) =="
for ($y = 1300; $y -le 1770; $y += 10) {
  $c = $bmp.GetPixel(400, $y * 2)
  Write-Output ("y=$y " + $c.R + "," + $c.G + "," + $c.B)
}
Write-Output "== dark x-runs (device coords->CSS) =="
foreach ($yy in @(1490, 1514, 1556, 1682, 1754)) {
  $runs = @(); $in = $false; $s = 0
  for ($x = 0; $x -lt 780; $x++) {
    $c = $bmp.GetPixel($x, $yy * 2)
    $dark = (($c.R + $c.G + $c.B) -lt 330)
    if ($dark -and -not $in) { $in = $true; $s = $x }
    if ((-not $dark) -and $in) { $in = $false; $runs += "$([int]($s/2))-$([int](($x-1)/2))" }
  }
  if ($in) { $runs += "$([int]($s/2))-$([int]((779)/2))" }
  Write-Output "y=$yy runsCSS: $($runs -join ',')"
}
$bmp.Dispose(); $img.Dispose()
