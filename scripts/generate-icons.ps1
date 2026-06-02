Add-Type -AssemblyName System.Drawing

$sizes = @(32, 192, 180, 512)
$outDir = "C:\Users\burla\OneDrive\Desktop\portfolio"

# Helper: linear-interpolate two colors
function LerpColor($a, $b, $t) {
  $r = [int]($a.R + ($b.R - $a.R) * $t)
  $g = [int]($a.G + ($b.G - $a.G) * $t)
  $bl = [int]($a.B + ($b.B - $a.B) * $t)
  return [System.Drawing.Color]::FromArgb(255, $r, $g, $bl)
}

# Three-stop brand gradient: #6366F1 -> #8B5CF6 -> #06B6D4 (top-left to bottom-right)
$stop1 = [System.Drawing.Color]::FromArgb(255, 0x63, 0x66, 0xF1)
$stop2 = [System.Drawing.Color]::FromArgb(255, 0x8B, 0x5C, 0xF6)
$stop3 = [System.Drawing.Color]::FromArgb(255, 0x06, 0xB6, 0xD4)

foreach ($size in $sizes) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $gfx = [System.Drawing.Graphics]::FromImage($bmp)
  $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $gfx.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  # Rounded-rect background with diagonal gradient
  $rect = New-Object System.Drawing.Rectangle 0, 0, $size, $size
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $radius = [int]($size * 0.22)
  $path.AddArc($rect.X, $rect.Y, $radius * 2, $radius * 2, 180, 90)
  $path.AddArc($rect.Right - $radius * 2, $rect.Y, $radius * 2, $radius * 2, 270, 90)
  $path.AddArc($rect.Right - $radius * 2, $rect.Bottom - $radius * 2, $radius * 2, $radius * 2, 0, 90)
  $path.AddArc($rect.X, $rect.Bottom - $radius * 2, $radius * 2, $radius * 2, 90, 90)
  $path.CloseFigure()
  $gfx.SetClip($path)

  for ($y = 0; $y -lt $size; $y++) {
    for ($x = 0; $x -lt $size; $x++) {
      $t = ($x + $y) / (2.0 * ($size - 1))
      if ($t -lt 0.5) {
        $c = LerpColor $stop1 $stop2 ($t * 2)
      } else {
        $c = LerpColor $stop2 $stop3 (($t - 0.5) * 2)
      }
      $bmp.SetPixel($x, $y, $c)
    }
  }
  $gfx.ResetClip()

  # "BR" text
  $fontSize = [int]($size * 0.42)
  if ($fontSize -lt 6) { $fontSize = 6 }
  $font = New-Object System.Drawing.Font "Segoe UI", $fontSize, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $brush = [System.Drawing.Brushes]::White
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
  $gfx.DrawString("BR", $font, $brush, [float]($size / 2.0), [float]($size / 2.0), $sf)

  $gfx.Dispose()
  $bmp.Save("$outDir\app\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
  Write-Host "Saved $size -> app\icon.png"
  $bmp.Dispose()
}

# Also write apple-touch-icon to public (iOS uses it)
Copy-Item "$outDir\app\icon.png" "$outDir\app\apple-icon.png" -Force
Write-Host "Copied to app\apple-icon.png"
