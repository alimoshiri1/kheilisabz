param([int]$Scale = 2, [string]$File, [string]$Tag, [int]$Y0 = 1100, [int]$Y1 = 2660, [int]$MinN = 3)
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($File)
$bmp = New-Object System.Drawing.Bitmap($img)
$H = [Math]::Min(($Y1 * $Scale), $bmp.Height)
$rows = New-Object 'System.Collections.Generic.List[int]'
for ($y = ($Y0 * $Scale); $y -lt $H; $y++) {
  $n = 0
  for ($x = 0; $x -lt $bmp.Width; $x += 4) {
    $c = $bmp.GetPixel($x, $y)
    if (($c.R + $c.G + $c.B) / 3 -lt 120) { $n++ }
  }
  $rows.Add($n)
}
$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("== $Tag bands CSS (y0..y1 h) ==")
$in = $false; $s = 0; $peak = 0
for ($i = 0; $i -lt $rows.Count; $i++) {
  $on = $rows[$i] -ge $MinN
  if ($on -and -not $in) { $in = $true; $s = $i; $peak = $rows[$i] }
  elseif ($on -and $rows[$i] -gt $peak) { $peak = $rows[$i] }
  if ((-not $on) -and $in) {
    $in = $false
    $yA = $Y0 + [int]($s / $Scale); $yB = $Y0 + [int]($i / $Scale) - 1
    $lines.Add("$yA..$yB h=" + ($yB - $yA + 1) + " peak=$peak")
  }
}
if ($in) { $yA = $Y0 + [int]($s / $Scale); $lines.Add("$yA.." + ($H / $Scale) + " peak=$peak") }
$out = "C:\Users\GASCAN~1\AppData\Local\Temp\opencode\render\bands-$Tag.txt"
$lines | Out-File $out -Encoding utf8
$bmp.Dispose(); $img.Dispose()
Write-Output "$out ($($lines.Count) lines)"

