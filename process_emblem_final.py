#!/usr/bin/env python3
"""
Process the Lot Ops Pro emblem - FINAL VERSION:
1. Crop to just the circular chrome car+checkmark icon (no text)
2. Remove background properly
3. Add a visible glow that shows on dark backgrounds (purple/magenta)
"""

import os
from PIL import Image, ImageFilter, ImageEnhance
import numpy as np

def process_emblem():
    input_path = "attached_assets/Copilot_20251120_123722_1764941319084.png"
    
    print(f"Loading image from {input_path}...")
    img = Image.open(input_path).convert('RGBA')
    
    width, height = img.size
    print(f"Original size: {width}x{height}")
    
    # Crop to just the circular emblem - top portion only
    # The emblem appears to be in roughly the top 50% of the image
    # We want to capture the circle with some margin for the glow
    
    # Calculate crop box: center horizontally, top portion vertically
    crop_top = int(height * 0.02)  # Start just below top
    crop_bottom = int(height * 0.52)  # End before the text starts
    crop_left = int(width * 0.15)  # Slight margin on sides
    crop_right = int(width * 0.85)
    
    cropped = img.crop((crop_left, crop_top, crop_right, crop_bottom))
    print(f"Cropped to: {cropped.size}")
    
    # Convert to numpy for processing
    arr = np.array(cropped).astype(float)
    r, g, b, a = arr[:,:,0], arr[:,:,1], arr[:,:,2], arr[:,:,3]
    
    # Calculate what's "emblem" vs "background"
    # The chrome emblem is bright (high values)
    # The blue glow has high blue values
    # The dark background corners are dark gray
    
    brightness = (r + g + b) / 3
    
    # Detect the chrome emblem (bright metallic parts)
    chrome_mask = brightness > 120
    
    # Detect the glow (blue-ish areas that are moderately bright)
    glow_mask = (b > 80) & (brightness > 40) & (brightness < 200)
    
    # Combine: keep chrome AND glow
    keep_mask = chrome_mask | glow_mask
    
    # Create alpha channel based on what we want to keep
    # Full opacity for chrome, partial for glow, transparent for background
    new_alpha = np.zeros_like(brightness)
    
    # Chrome gets full alpha
    new_alpha[chrome_mask] = 255
    
    # Glow gets graduated alpha based on brightness
    glow_only = glow_mask & ~chrome_mask
    new_alpha[glow_only] = np.clip(brightness[glow_only] * 2, 50, 200)
    
    # Convert the blue glow to purple/magenta for visibility
    # Shift blue towards purple by boosting red in glow areas
    new_r = r.copy()
    new_g = g.copy()
    new_b = b.copy()
    
    # In glow areas, shift color from blue to purple/magenta
    # Add red component, reduce green slightly
    new_r[glow_only] = np.clip(r[glow_only] + b[glow_only] * 0.7, 0, 255)
    new_g[glow_only] = np.clip(g[glow_only] * 0.6, 0, 255)
    new_b[glow_only] = np.clip(b[glow_only] * 0.9, 0, 255)
    
    # Rebuild the image array
    result_arr = np.stack([new_r, new_g, new_b, new_alpha], axis=2).astype(np.uint8)
    result = Image.fromarray(result_arr, 'RGBA')
    
    # Make it square
    max_dim = max(result.size)
    square = Image.new('RGBA', (max_dim, max_dim), (0, 0, 0, 0))
    x = (max_dim - result.width) // 2
    y = (max_dim - result.height) // 2
    square.paste(result, (x, y), result)
    
    # Add a subtle outer glow effect (purple)
    # Create a blurred version for the glow
    glow_layer = square.copy()
    glow_arr = np.array(glow_layer)
    # Make glow purple-ish
    glow_arr[:,:,0] = np.clip(glow_arr[:,:,0].astype(float) * 1.2, 0, 255).astype(np.uint8)  # More red
    glow_arr[:,:,1] = np.clip(glow_arr[:,:,1].astype(float) * 0.5, 0, 255).astype(np.uint8)  # Less green
    glow_arr[:,:,2] = np.clip(glow_arr[:,:,2].astype(float) * 1.3, 0, 255).astype(np.uint8)  # More blue
    glow_layer = Image.fromarray(glow_arr, 'RGBA')
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(radius=15))
    
    # Composite: glow behind, then original on top
    final = Image.new('RGBA', square.size, (0, 0, 0, 0))
    final = Image.alpha_composite(final, glow_layer)
    final = Image.alpha_composite(final, square)
    
    # Save the main emblem
    output_path = "public/lotops-emblem-transparent.png"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    final.save(output_path, format='PNG')
    print(f"Saved main emblem to {output_path}")
    
    # Create all icon sizes from the same source
    sizes = [
        (512, 'icon-512x512.png'),
        (192, 'icon-192x192.png'),
        (180, 'apple-touch-icon.png'),
        (32, 'favicon.png'),
    ]
    
    for size, filename in sizes:
        icon = final.copy()
        icon.thumbnail((size, size), Image.Resampling.LANCZOS)
        
        # Center on square canvas
        canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        x_pos = (size - icon.width) // 2
        y_pos = (size - icon.height) // 2
        canvas.paste(icon, (x_pos, y_pos), icon)
        
        icon_path = f"public/{filename}"
        canvas.save(icon_path, format='PNG')
        print(f"Saved {size}x{size} icon to {icon_path}")
    
    print("\nDone! Chrome emblem with purple glow - consistent across all icons.")

if __name__ == "__main__":
    process_emblem()
