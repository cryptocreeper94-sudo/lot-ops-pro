#!/usr/bin/env python3
"""
Process emblem with circular mask - removes ALL corners
"""

import os
from PIL import Image, ImageFilter, ImageDraw
import numpy as np

def process_emblem():
    input_path = "attached_assets/Copilot_20251120_123722_1764941319084.png"
    
    print(f"Loading image from {input_path}...")
    img = Image.open(input_path).convert('RGBA')
    
    width, height = img.size
    print(f"Original size: {width}x{height}")
    
    # Tight crop to emblem
    crop_top = int(height * 0.08)
    crop_bottom = int(height * 0.48)
    crop_left = int(width * 0.20)
    crop_right = int(width * 0.80)
    
    cropped = img.crop((crop_left, crop_top, crop_right, crop_bottom))
    print(f"Cropped to: {cropped.size}")
    
    # Make square
    cw, ch = cropped.size
    size = max(cw, ch)
    square = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    x = (size - cw) // 2
    y = (size - ch) // 2
    square.paste(cropped, (x, y))
    
    arr = np.array(square).astype(float)
    r, g, b, a = arr[:,:,0], arr[:,:,1], arr[:,:,2], arr[:,:,3]
    
    # Create circular mask
    h, w = arr.shape[:2]
    center = h // 2
    Y, X = np.ogrid[:h, :w]
    dist = np.sqrt((X - center)**2 + (Y - center)**2)
    radius = center * 0.92  # Slightly smaller than full to cut edges
    
    # Soft edge circular mask
    circular_mask = np.clip(1.0 - (dist - radius) / 30, 0, 1)
    
    # Content detection
    brightness = (r + g + b) / 3
    is_chrome = brightness > 130
    is_glow = (b > 80) | (brightness > 60)
    
    # Alpha from content and circular mask
    content_alpha = np.zeros_like(brightness)
    content_alpha[is_chrome] = 255
    content_alpha[is_glow & ~is_chrome] = np.clip(brightness[is_glow & ~is_chrome] * 2, 40, 220)
    
    # Apply circular mask
    new_alpha = content_alpha * circular_mask
    
    # Purple shift for glow
    new_r = r.copy()
    new_g = g.copy()
    new_b = b.copy()
    
    glow_mask = is_glow & ~is_chrome
    new_r[glow_mask] = np.clip(r[glow_mask] + b[glow_mask] * 0.65, 0, 255)
    new_g[glow_mask] = np.clip(g[glow_mask] * 0.45, 0, 255)
    
    result_arr = np.stack([new_r, new_g, new_b, new_alpha], axis=2).astype(np.uint8)
    result = Image.fromarray(result_arr, 'RGBA')
    
    # Add glow
    glow = result.copy()
    glow_arr = np.array(glow)
    glow_arr[:,:,0] = np.clip(glow_arr[:,:,0].astype(float) * 1.5, 0, 255).astype(np.uint8)
    glow_arr[:,:,1] = np.clip(glow_arr[:,:,1].astype(float) * 0.25, 0, 255).astype(np.uint8)
    glow_arr[:,:,2] = np.clip(glow_arr[:,:,2].astype(float) * 1.4, 0, 255).astype(np.uint8)
    glow = Image.fromarray(glow_arr, 'RGBA')
    glow = glow.filter(ImageFilter.GaussianBlur(radius=30))
    
    final = Image.new('RGBA', result.size, (0, 0, 0, 0))
    final = Image.alpha_composite(final, glow)
    final = Image.alpha_composite(final, result)
    
    # Save
    for folder in ['public', 'client/public']:
        os.makedirs(folder, exist_ok=True)
        final.save(f"{folder}/lotops-emblem-transparent.png", format='PNG')
        print(f"Saved to {folder}/lotops-emblem-transparent.png")
        
        for sz, fn in [(512, 'icon-512x512.png'), (192, 'icon-192x192.png'), 
                       (180, 'apple-touch-icon.png'), (32, 'favicon.png')]:
            icon = final.copy()
            icon.thumbnail((sz, sz), Image.Resampling.LANCZOS)
            canvas = Image.new('RGBA', (sz, sz), (0, 0, 0, 0))
            px = (sz - icon.width) // 2
            py = (sz - icon.height) // 2
            canvas.paste(icon, (px, py), icon)
            canvas.save(f"{folder}/{fn}", format='PNG')
            print(f"Saved {sz}x{sz} to {folder}/{fn}")
    
    print("\nDone! Circular emblem with purple glow.")

if __name__ == "__main__":
    process_emblem()
