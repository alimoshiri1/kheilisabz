param([int]$Y0 = 0, [int]$Y1 = 100, [string]$Src = "", [string]$Out = "crop.png")
Add-Type -AssemblyName System.Drawing
if (-not $Src) { $Src = "C:\Users\GASCAN~1\AppData\Local\Temp\opencode\render\home-mobile.png" }
$img = [System.Drawing.Image]::FromFile($Src)
$w = $img.Width
$dy0 = $Y0 * 2; $dy1 = $Y1 * 2
if ($dy1 -gt $img.Height) { $dy1 = $img.Height }
$h = $dy1 - $dy0
$bmp = New-Object System.Drawing.Bitmap($w, $h)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($img, (New-Object System.Drawing.Rectangle(0,0,$w,$h)), (New-Object System.Drawing.Rectangle(0,$dy0,$w,$h)), [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()
if (-not [System.IO.Path]::IsPathRooted($Out)) { $Out = Join-Path "C:\Users\GASCAN~1\AppData\Local\Temp\opencode\render" $Out }
$bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose(); $img.Dispose()
Write-Output "saved $Out ($w x $h)"
