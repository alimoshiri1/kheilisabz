param([string]$File, [string]$Label, [int]$Y0 = 1350, [int]$Y1 = 2550, [int]$Cols = 110)
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($File)
$bmp = New-Object System.Drawing.Bitmap($img)
$dy0 = $Y0 * 2; $dy1 = [Math]::Min($Y1 * 2, $bmp.Height - 1)
$colW = [Math]::Max(1, [int]($bmp.Width / $Cols))
$rowH = [Math]::Max(2, [int](($dy1 - $dy0) / 200))
$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("$Label rows CSS $Y0..$Y1 rowH=$rowH colW=$colW")
for ($y = $dy0; $y -lt $dy1; $y += $rowH) {
  $sb = New-Object System.Text.StringBuilder
  [void]$sb.Append(('{0,4} ' -f [int]($y / 2)))
  for ($x = 0; $x -lt $bmp.Width; $x += $colW) {
    $sum = 0; $n = 0
    for ($yy = $y; $yy -lt [Math]::Min($y + $rowH, $dy1); $yy += 3) {
      for ($xx = $x; $xx -lt [Math]::Min($x + $colW, $bmp.Width); $xx += 3) {
        $c = $bmp.GetPixel($xx, $yy); $sum += ($c.R + $c.G + $c.B) / 3; $n++
      }
    }
    if ($n -eq 0) { $n = 1 }
    $avg = $sum / $n
    if ($avg -lt 110) { [void]$sb.Append('#') }
    elseif ($avg -lt 175) { [void]$sb.Append('+') }
    elseif ($avg -lt 235) { [void]$sb.Append('.') }
    else { [void]$sb.Append(' ') }
  }
  $lines.Add($sb.ToString())
}
$lines | Out-File -FilePath "C:\Users\GASCAN~1\AppData\Local\Temp\opencode\render\ascii-$Label.txt" -Encoding utf8
$bmp.Dispose(); $img.Dispose()
Write-Output "ascii-$Label.txt written ($($lines.Count) lines)"
