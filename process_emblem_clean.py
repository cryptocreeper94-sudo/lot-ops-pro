#!/usr/bin/env python3
"""
Process the Lot Ops Pro emblem - CLEAN VERSION:
1. Crop to just the circular chrome car+checkmark icon (no text)
2. Remove ALL background - truly transparent
3. Keep chrome emblem with purple glow
"""

import os
from PIL import Image, ImageFilter
import numpy as np

def process_emblem():
    input_path = "attached_assets/Copilot_20251120_123722_1764941319084.png"
    
    print(f"Loading image from {input_path}...")
    img = Image.open(input_path).convert('RGBA')
    
    width, height = img.size
    print(f"Original size: {width}x{height}")
    
    # Crop to just the circular emblem
    crop_top = int(height * 0.02)
    crop_bottom = int(height * 0.52)
    crop_left = int(width * 0.12)
    crop_right = int(width * 0.88)
    
    cropped = img.crop((crop_left, crop_top, crop_right, crop_bottom))
    print(f"Cropped to: {cropped.size}")
    
    # Convert to numpy for processing
    arr = np.array(cropped).astype(float)
    r, g, b, a = arr[:,:,0], arr[:,:,1], arr[:,:,2], arr[:,:,3]
    
    # Calculate brightness and color values
    brightness = (r + g + b) / 3
    
    # The background is dark gray (around 50-80 brightness, low saturation)
    # The chrome is bright (150+)
    # The glow is blue/cyan (high blue, moderate brightness)
    
    # Detect background: dark, low saturation areas
    max_rgb = np.maximum(np.maximum(r, g), b)
    min_rgb = np.minimum(np.minimum(r, g), b)
    saturation = np.where(max_rgb > 0, (max_rgb - min_rgb) / max_rgb, 0)
    
    # Background is dark AND low saturation
    is_background = (brightness < 90) & (saturation < 0.3)
    
    # Chrome emblem: bright areas
    is_chrome = brightness > 140
    
    # Glow: blue-ish areas with moderate brightness
    is_glow = (b > r * 1.1) & (brightness > 50) & (brightness < 200)
    
    # Create alpha channel
    new_alpha = np.ones_like(brightness) * 255
    
    # Make background fully transparent
    new_alpha[is_background] = 0
    
    # Glow gets partial transparency based on brightness
    glow_only = is_glow & ~is_chrome & ~is_background
    new_alpha[glow_only] = np.clip(brightness[glow_only] * 1.5, 30, 200)
    
    # Shift glow color from blue to purple
    new_r = r.copy()
    new_g = g.copy() 
    new_b = b.copy()
    
    # Add purple tint to glow areas
    new_r[glow_only] = np.clip(r[glow_only] + b[glow_only] * 0.6, 0, 255)
    new_g[glow_only] = np.clip(g[glow_only] * 0.5, 0, 255)
    
    # Rebuild the image
    result_arr = np.stack([new_r, new_g, new_b, new_alpha], axis=2).astype(np.uint8)
    result = Image.fromarray(result_arr, 'RGBA')
    
    # Make it square with transparent padding
    max_dim = max(result.size)
    square = Image.new('RGBA', (max_dim, max_dim), (0, 0, 0, 0))
    x = (max_dim - result.width) // 2
    y = (max_dim - result.height) // 2
    square.paste(result, (x, y), result)
    
    # Add outer glow effect
    glow = square.copy()
    glow_arr = np.array(glow)
    # Make glow more purple
    glow_arr[:,:,0] = np.clip(glow_arr[:,:,0].astype(float) * 1.3, 0, 255).astype(np.uint8)
    glow_arr[:,:,1] = np.clip(glow_arr[:,:,1].astype(float) * 0.4, 0, 255).astype(np.uint8)
    glow_arr[:,:,2] = np.clip(glow_arr[:,:,2].astype(float) * 1.2, 0, 255).astype(np.uint8)
    glow = Image.fromarray(glow_arr, 'RGBA')
    glow = glow.filter(ImageFilter.GaussianBlur(radius=20))
    
    # Composite
    final = Image.new('RGBA', square.size, (0, 0, 0, 0))
    final = Image.alpha_composite(final, glow)
    final = Image.alpha_composite(final, square)
    
    # Save to both locations
    for folder in ['public', 'client/public']:
        os.makedirs(folder, exist_ok=True)
        
        # Main emblem
        final.save(f"{folder}/lotops-emblem-transparent.png", format='PNG')
        print(f"Saved emblem to {folder}/lotops-emblem-transparent.png")
        
        # Icon sizes
        for size, filename in [(512, 'icon-512x512.png'), (192, 'icon-192x192.png'), 
                                (180, 'apple-touch-icon.png'), (32, 'favicon.png')]:
            icon = final.copy()
            icon.thumbnail((size, size), Image.Resampling.LANCZOS)
            canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
            x_pos = (size - icon.width) // 2
            y_pos = (size - icon.height) // 2
            canvas.paste(icon, (x_pos, y_pos), icon)
            canvas.save(f"{folder}/{filename}", format='PNG')
            print(f"Saved {size}x{size} to {folder}/{filename}")
    
    print("\nDone! Clean transparent emblem with purple glow.")

if __name__ == "__main__":
    process_emblem()
