Add-Type -AssemblyName System.Drawing
$file = "C:\Users\ANIMESH\.gemini\antigravity-ide\brain\0ca1426a-1959-4c55-85e8-c9d05743c418\.user_uploaded\media_1791813709157.png"
$bmp = New-Object System.Drawing.Bitmap($file)
$minX = $bmp.Width; $maxX = 0; $minY = $bmp.Height; $maxY = 0

for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt 500; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 200 -and $c.G -lt 140 -and $c.B -lt 60) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}
Write-Host "BBox: minX=$minX maxX=$maxX minY=$minY maxY=$maxY"

# Let's crop it with a small margin, convert background (nearly white / grey) to transparent PNG
$margin = 10
$x0 = [Math]::Max(0, $minX - $margin)
$y0 = [Math]::Max(0, $minY - $margin)
$x1 = [Math]::Min($bmp.Width - 1, $maxX + $margin)
$y1 = [Math]::Min($bmp.Height - 1, $maxY + $margin)
$w = $x1 - $x0 + 1
$h = $y1 - $y0 + 1

$targetBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Background color sampling near corner
$bg = $bmp.GetPixel($x0, $y0)
Write-Host "Sampled BG: R=$($bg.R) G=$($bg.G) B=$($bg.B)"

for ($dy = 0; $dy -lt $h; $dy++) {
    for ($dx = 0; $dx -lt $w; $dx++) {
        $orig = $bmp.GetPixel($x0 + $dx, $y0 + $dy)
        # Check if color is part of orange crab logo
        # The background is very pale grey/beige: R > 230, G > 230, B > 230
        if ($orig.R -gt 200 -and $orig.G -lt 160 -and $orig.B -lt 70) {
            $targetBmp.SetPixel($dx, $dy, $orig)
        } else {
            # Let's calculate distance or anti-aliasing if needed, or make it transparent
            # If it's warm orange tint:
            if ($orig.R -gt 210 -and $orig.G -lt 190 -and ($orig.R - $orig.G) -gt 35) {
                $targetBmp.SetPixel($dx, $dy, $orig)
            } else {
                $targetBmp.SetPixel($dx, $dy, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            }
        }
    }
}

$destPath = "c:\Users\ANIMESH\OneDrive\Desktop\hack 1\Crab_\frontend\public\crab-logo.png"
$targetBmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Saved extracted crab logo to $destPath ($w x $h)"
$targetBmp.Dispose()
$bmp.Dispose()
