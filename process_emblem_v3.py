#!/usr/bin/env python3
"""
Process the Lot Ops Pro emblem - V3:
Remove ALL dark corners, keep only the emblem and glow
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
    
    # Crop to just the circular emblem - tighter crop
    crop_top = int(height * 0.05)
    crop_bottom = int(height * 0.50)
    crop_left = int(width * 0.18)
    crop_right = int(width * 0.82)
    
    cropped = img.crop((crop_left, crop_top, crop_right, crop_bottom))
    print(f"Cropped to: {cropped.size}")
    
    # Make it square first
    cw, ch = cropped.size
    max_dim = max(cw, ch)
    square = Image.new('RGBA', (max_dim, max_dim), (0, 0, 0, 0))
    x = (max_dim - cw) // 2
    y = (max_dim - ch) // 2
    square.paste(cropped, (x, y))
    
    # Convert to numpy
    arr = np.array(square).astype(float)
    r, g, b, a = arr[:,:,0], arr[:,:,1], arr[:,:,2], arr[:,:,3]
    
    # Create radial mask - fade out corners
    h, w = arr.shape[:2]
    center_y, center_x = h // 2, w // 2
    Y, X = np.ogrid[:h, :w]
    dist_from_center = np.sqrt((X - center_x)**2 + (Y - center_y)**2)
    max_dist = np.sqrt(center_x**2 + center_y**2)
    
    # Normalize distance (0 at center, 1 at corners)
    norm_dist = dist_from_center / max_dist
    
    # Calculate brightness
    brightness = (r + g + b) / 3
    
    # Detect what to keep:
    # - Chrome (bright metallic) 
    # - Blue/cyan glow
    # - Purple areas from glow
    
    # Chrome: very bright
    is_chrome = brightness > 150
    
    # Blue glow: has blue/cyan component
    is_blue_glow = (b > 100) & (b > r * 0.8)
    
    # Combined keep mask
    keep_mask = is_chrome | is_blue_glow
    
    # Create alpha based on what to keep AND radial falloff
    # Corners get more transparent even if they have content
    radial_alpha = 1.0 - np.clip((norm_dist - 0.6) * 3, 0, 1)
    
    # Base alpha from content
    content_alpha = np.zeros_like(brightness)
    content_alpha[is_chrome] = 255
    content_alpha[is_blue_glow & ~is_chrome] = np.clip(brightness[is_blue_glow & ~is_chrome] * 2, 50, 230)
    
    # Apply radial fade to corners
    new_alpha = content_alpha * radial_alpha
    
    # Make sure corners are fully transparent
    corner_mask = norm_dist > 0.85
    new_alpha[corner_mask] = 0
    
    # Shift blue to purple for visibility
    new_r = r.copy()
    new_g = g.copy()
    new_b = b.copy()
    
    glow_mask = is_blue_glow & ~is_chrome
    new_r[glow_mask] = np.clip(r[glow_mask] + b[glow_mask] * 0.7, 0, 255)
    new_g[glow_mask] = np.clip(g[glow_mask] * 0.5, 0, 255)
    
    # Rebuild image
    result_arr = np.stack([new_r, new_g, new_b, new_alpha], axis=2).astype(np.uint8)
    result = Image.fromarray(result_arr, 'RGBA')
    
    # Add soft purple glow behind
    glow = result.copy()
    glow_arr = np.array(glow)
    glow_arr[:,:,0] = np.clip(glow_arr[:,:,0].astype(float) * 1.4, 0, 255).astype(np.uint8)
    glow_arr[:,:,1] = np.clip(glow_arr[:,:,1].astype(float) * 0.3, 0, 255).astype(np.uint8)
    glow_arr[:,:,2] = np.clip(glow_arr[:,:,2].astype(float) * 1.3, 0, 255).astype(np.uint8)
    glow = Image.fromarray(glow_arr, 'RGBA')
    glow = glow.filter(ImageFilter.GaussianBlur(radius=25))
    
    # Composite
    final = Image.new('RGBA', result.size, (0, 0, 0, 0))
    final = Image.alpha_composite(final, glow)
    final = Image.alpha_composite(final, result)
    
    # Save to both locations
    for folder in ['public', 'client/public']:
        os.makedirs(folder, exist_ok=True)
        
        final.save(f"{folder}/lotops-emblem-transparent.png", format='PNG')
        print(f"Saved emblem to {folder}/lotops-emblem-transparent.png")
        
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
    
    print("\nDone! Corners removed, emblem with purple glow on transparent background.")

if __name__ == "__main__":
    process_emblem()
