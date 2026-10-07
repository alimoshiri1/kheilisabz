param([string]$File, [string]$Tag, [int]$X0 = 0, [int]$X1 = 390, [int]$Y0 = 0, [int]$Y1 = 600, [int]$MinN = 2)
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($File)
$bmp = New-Object System.Drawing.Bitmap($img)
$H = [Math]::Min($Y1 * 2, $bmp.Height)
$W = [Math]::Min($X1 * 2, $bmp.Width)
$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("== $Tag strip x$X0..$X1 bands CSS y$Y0..$Y1 ==")
$in = $false; $s = 0; $peak = 0
for ($y = $Y0 * 2; $y -lt $H; $y++) {
  $n = 0
  for ($x = $X0 * 2; $x -lt $W; $x += 4) {
    $c = $bmp.GetPixel($x, $y)
    if (($c.R + $c.G + $c.B) / 3 -lt 120) { $n++ }
  }
  $on = $n -ge $MinN
  if ($on -and -not $in) { $in = $true; $s = $y; $peak = $n }
  elseif ($on -and $n -gt $peak) { $peak = $n }
  if ((-not $on) -and $in) {
    $in = $false
    $yA = $Y0 + [int](($s - $Y0 * 2) / 2); $yB = $Y0 + [int](($y - 1 - $Y0 * 2) / 2)
    $lines.Add("$yA..$yB h=" + ($yB - $yA + 1) + " peak=$peak")
  }
}
if ($in) {
  $yA = $Y0 + [int](($s - $Y0 * 2) / 2); $yB = $Y0 + [int](($H - 1 - $Y0 * 2) / 2)
  $lines.Add("$yA..$yB h=" + ($yB - $yA + 1) + " peak=$peak")
}
$out = "C:\Users\GASCAN~1\AppData\Local\Temp\opencode\render\strip-$Tag.txt"
$lines | Out-File $out -Encoding utf8
$bmp.Dispose(); $img.Dispose()
Write-Output "$out ($($lines.Count) lines)"
