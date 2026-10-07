param([string]$File, [string]$Tag, [int]$Y0 = 0, [int]$Y1 = 300, [int]$Step = 1)
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($File)
$bmp = New-Object System.Drawing.Bitmap($img)
$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("== $Tag rows CSS $Y0..$Y1 step $Step ==")
for ($y = $Y0 * 2; $y -lt ($Y1 * 2); $y += ($Step * 2)) {
  $sr = 0; $sg = 0; $sb = 0; $n = 0; $dark = 0
  for ($x = 0; $x -lt $bmp.Width; $x += 4) {
    $c = $bmp.GetPixel($x, $y)
    $sr += $c.R; $sg += $c.G; $sb += $c.B; $n++
    if (($c.R + $c.G + $c.B) / 3 -lt 120) { $dark++ }
  }
  $css = $Y0 + (($y - $Y0 * 2) / 2)
  $lines.Add("y=$css avg=" + [int]($sr / $n) + "," + [int]($sg / $n) + "," + [int]($sb / $n) + " dark=$dark/$n")
}
$out = "C:\Users\GASCAN~1\AppData\Local\Temp\opencode\render\rows-$Tag.txt"
$lines | Out-File $out -Encoding utf8
$bmp.Dispose(); $img.Dispose()
Write-Output "$out ($($lines.Count) lines)"
