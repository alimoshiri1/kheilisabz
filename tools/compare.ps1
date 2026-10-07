param([int]$Y0 = 0, [int]$Y1 = 650, [string]$Out = "")
Add-Type -AssemblyName System.Drawing
$ref = "C:\Users\GASCAN~1\AppData\Local\Temp\opencode\render\home-mobile.png"
$mine = "C:\Users\GASCAN~1\AppData\Local\Temp\opencode\render\mine-mobile.png"
$i1 = [System.Drawing.Image]::FromFile($ref)
$i2 = [System.Drawing.Image]::FromFile($mine)
$w = $i1.Width
$dy0 = $Y0 * 2; $dy1 = [Math]::Min($Y1 * 2, [Math]::Min($i1.Height, $i2.Height))
$h = $dy1 - $dy0
$c1 = New-Object System.Drawing.Bitmap($w, $h)
$c2 = New-Object System.Drawing.Bitmap($w, $h)
$g1 = [System.Drawing.Graphics]::FromImage($c1)
$g1.DrawImage($i1, (New-Object System.Drawing.Rectangle(0,0,$w,$h)), (New-Object System.Drawing.Rectangle(0,$dy0,$w,$h)), [System.Drawing.GraphicsUnit]::Pixel)
$g1.Dispose()
$g2 = [System.Drawing.Graphics]::FromImage($c2)
$g2.DrawImage($i2, (New-Object System.Drawing.Rectangle(0,0,$w,$h)), (New-Object System.Drawing.Rectangle(0,$dy0,$w,$h)), [System.Drawing.GraphicsUnit]::Pixel)
$g2.Dispose()
$gap = 8
$merged = New-Object System.Drawing.Bitmap(($w * 2 + $gap), $h)
$go = [System.Drawing.Graphics]::FromImage($merged)
$go.Clear([System.Drawing.Color]::Magenta)
$go.DrawImage($c1, 0, 0)
$go.DrawImage($c2, ($w + $gap), 0)
$go.Dispose()
if (-not $Out) { $Out = "C:\Users\GASCAN~1\AppData\Local\Temp\opencode\render\cmp-$Y0-$Y1.png" }
$merged.Save($Out, [System.Drawing.Imaging.ImageFormat]::PNG)
$merged.Dispose(); $c1.Dispose(); $c2.Dispose(); $i1.Dispose(); $i2.Dispose()
Write-Output "saved $Out (left=REF right=MINE, CSS $Y0..$Y1, magenta divider)"
