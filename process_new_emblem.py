#!/usr/bin/env python3
"""
Process the new Lot Ops Pro emblem:
1. Use rembg for clean background removal
2. Crop out the text at bottom
3. Add purple glow effect
4. Save to all locations
"""

import os
from PIL import Image, ImageFilter
from rembg import remove
import numpy as np

def process_emblem():
    input_path = "attached_assets/generated_images/chrome_car_checkmark_emblem.png"
    
    print(f"Loading image from {input_path}...")
    img = Image.open(input_path).convert('RGBA')
    
    width, height = img.size
    print(f"Original size: {width}x{height}")
    
    # Crop to remove text at bottom - keep just the car with checkmark
    crop_bottom = int(height * 0.78)  # Remove bottom 22% with text
    crop_top = int(height * 0.05)
    cropped = img.crop((0, crop_top, width, crop_bottom))
    print(f"Cropped to: {cropped.size}")
    
    # Use rembg for professional background removal
    print("Removing background with rembg...")
    transparent = remove(cropped)
    
    # Make it square
    cw, ch = transparent.size
    size = max(cw, ch)
    square = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    x = (size - cw) // 2
    y = (size - ch) // 2
    square.paste(transparent, (x, y), transparent)
    
    # Add purple glow effect
    print("Adding glow effect...")
    glow = square.copy()
    glow_arr = np.array(glow).astype(float)
    
    # Shift to purple tint
    glow_arr[:,:,0] = np.clip(glow_arr[:,:,0] * 1.3, 0, 255)  # More red
    glow_arr[:,:,1] = np.clip(glow_arr[:,:,1] * 0.4, 0, 255)  # Less green
    glow_arr[:,:,2] = np.clip(glow_arr[:,:,2] * 1.2, 0, 255)  # Slightly more blue
    
    glow = Image.fromarray(glow_arr.astype(np.uint8), 'RGBA')
    glow = glow.filter(ImageFilter.GaussianBlur(radius=25))
    
    # Composite: glow behind, original on top
    final = Image.new('RGBA', square.size, (0, 0, 0, 0))
    final = Image.alpha_composite(final, glow)
    final = Image.alpha_composite(final, square)
    
    # Save to both public folders
    for folder in ['public', 'client/public']:
        os.makedirs(folder, exist_ok=True)
        
        # Main emblem
        final.save(f"{folder}/lotops-emblem-transparent.png", format='PNG')
        print(f"Saved emblem to {folder}/lotops-emblem-transparent.png")
        
        # All icon sizes
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
    
    # Save a standalone copy for external use (slideshow)
    final.save("attached_assets/lotops-emblem-export.png", format='PNG')
    print("\nSaved export copy to attached_assets/lotops-emblem-export.png")
    
    print("\nDone! New emblem applied site-wide.")

if __name__ == "__main__":
    process_emblem()
