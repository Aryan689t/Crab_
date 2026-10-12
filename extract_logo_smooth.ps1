Add-Type -AssemblyName System.Drawing
$file = "C:\Users\ANIMESH\.gemini\antigravity-ide\brain\0ca1426a-1959-4c55-85e8-c9d05743c418\.user_uploaded\media_1791813709157.png"
$bmp = New-Object System.Drawing.Bitmap($file)

$minX = 79; $maxX = 480; $minY = 213; $maxY = 566
$margin = 4
$x0 = [Math]::Max(0, $minX - $margin)
$y0 = [Math]::Max(0, $minY - $margin)
$x1 = [Math]::Min($bmp.Width - 1, $maxX + $margin)
$y1 = [Math]::Min($bmp.Height - 1, $maxY + $margin)
$w = $x1 - $x0 + 1
$h = $y1 - $y0 + 1

$targetBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Background color in the uploaded image
$bgR = 244.0; $bgG = 243.0; $bgB = 239.0

# Target pure Crab Orange
$orangeR = 255.0; $orangeG = 107.0; $orangeB = 0.0

for ($dy = 0; $dy -lt $h; $dy++) {
    for ($dx = 0; $dx -lt $w; $dx++) {
        $c = $bmp.GetPixel($x0 + $dx, $y0 + $dy)
        $r = [double]$c.R
        $g = [double]$c.G
        $b = [double]$c.B

        # Distance from background
        $distBg = [Math]::Sqrt(($r - $bgR)*($r - $bgR) + ($g - $bgG)*($g - $bgG) + ($b - $bgB)*($b - $bgB))
        
        # Check warmth/saturation: orange has high R and lower G, B
        $warmth = $r - [Math]::Max($g, $b)

        if ($distBg -lt 15.0 -or $warmth -lt 25.0) {
            # Completely transparent background
            $targetBmp.SetPixel($dx, $dy, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } else {
            # Calculate alpha based on warmth and distance from background
            $alphaRatio = [Math]::Min(1.0, [Math]::Max(0.0, ($distBg - 15.0) / 70.0))
            $alpha = [int]([Math]::Round($alphaRatio * 255.0))
            
            # Blend pixel smoothly to match crisp vibrant orange
            $outR = [int]([Math]::Round($r))
            $outG = [int]([Math]::Round($g))
            $outB = [int]([Math]::Round($b))
            
            $targetBmp.SetPixel($dx, $dy, [System.Drawing.Color]::FromArgb($alpha, $outR, $outG, $outB))
        }
    }
}

$destPath = "c:\Users\ANIMESH\OneDrive\Desktop\hack 1\Crab_\frontend\public\crab-logo.png"
$targetBmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Refined crab-logo.png saved successfully ($w x $h)"
$targetBmp.Dispose()
$bmp.Dispose()
