param([string]$File, [string]$Label)
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($File)
$bmp = New-Object System.Drawing.Bitmap($img)
$logoTop = -1; $logoBot = -1
$descTop = -1; $descBot = -1
$linksTop = -1; $linksBot = -1
$divRow = -1
$copyTop = -1
for ($y = 2460; $y -lt $bmp.Height; $y++) {
  $nLogo = 0; $nDesc = 0; $nLinks = 0; $nGray = 0
  for ($x = 150; $x -lt 1290; $x += 2) {
    $c = $bmp.GetPixel($x, $y)
    $sum = $c.R + $c.G + $c.B
    if ($sum -lt 755) {
      $nGray++
      if ($sum -lt 380) {
        if ($x -ge 834) { $nDesc++ } else { $nLinks++ }
        if ($y -lt 2600 -and $x -ge 1180) { $nLogo++ }
      }
    }
  }
  if ($nLogo -gt 4) { if ($logoTop -lt 0) { $logoTop = $y }; $logoBot = $y }
  if ($y -ge 2590 -and $nDesc -gt 4) { if ($descTop -lt 0) { $descTop = $y }; $descBot = $y }
  if ($nLinks -gt 4) { if ($linksTop -lt 0) { $linksTop = $y }; $linksBot = $y }
  if ($nGray -ge 500 -and $y -gt 2800) { if ($divRow -lt 0) { $divRow = $y } }
  if ($divRow -gt 0 -and $y -ge 2900 -and $nGray -gt 4) { if ($copyTop -lt 0) { $copyTop = $y } }
}
Write-Output "$Label logo=$logoTop..$logoBot desc=$descTop..$descBot links=$linksTop..$linksBot divider=$divRow copy=$copyTop doc=$($bmp.Height)"
$bmp.Dispose(); $img.Dispose()
