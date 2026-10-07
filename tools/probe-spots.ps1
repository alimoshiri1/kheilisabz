param([string]$File, [string]$Label)
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($File)
$bmp = New-Object System.Drawing.Bitmap($img)
$bands = @(@(1710,1736), @(2404,2450), @(1060,1072), @(1310,1335))
$out = New-Object System.Collections.Generic.List[string]
foreach ($b in $bands) {
  $cnt = 0; $colored = 0
  for ($y = $b[0]; $y -le $b[1]; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x += 2) {
      $c = $bmp.GetPixel($x, $y)
      if (($c.R + $c.G + $c.B) -lt 755) {
        $cnt++
        $mx = [Math]::Max($c.R, [Math]::Max($c.G, $c.B))
        $mn = [Math]::Min($c.R, [Math]::Min($c.G, $c.B))
        if (($mx - $mn) -gt 25) { $colored++ }
      }
    }
  }
  $out.Add("$Label band $($b[0])..$($b[1]): nonwhite=$cnt colored=$colored")
}
$out | Out-File -FilePath "C:\Users\GASCAN~1\AppData\Local\Temp\opencode\render\spots-$Label.txt" -Encoding utf8
$bmp.Dispose(); $img.Dispose()
Write-Output "done $Label"
