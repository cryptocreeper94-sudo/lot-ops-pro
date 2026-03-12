#!/usr/bin/env python3
"""
Process emblem with STRONG visible glow
"""

import os
from PIL import Image, ImageFilter
from rembg import remove
import numpy as np

def process_emblem():
    input_path = "attached_assets/generated_images/chrome_car_checkmark_emblem.png"
    
    print(f"Loading image...")
    img = Image.open(input_path).convert('RGBA')
    
    width, height = img.size
    
    # Crop to remove text
    crop_bottom = int(height * 0.78)
    crop_top = int(height * 0.05)
    cropped = img.crop((0, crop_top, width, crop_bottom))
    
    # Use rembg for background removal
    print("Removing background...")
    transparent = remove(cropped)
    
    # Make square
    cw, ch = transparent.size
    size = max(cw, ch)
    square = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    x = (size - cw) // 2
    y = (size - ch) // 2
    square.paste(transparent, (x, y), transparent)
    
    # Create STRONG purple/magenta glow
    print("Adding strong glow...")
    
    # Create multiple glow layers for intensity
    glow1 = square.copy()
    glow2 = square.copy()
    glow3 = square.copy()
    
    # Tint each layer purple/magenta
    for glow in [glow1, glow2, glow3]:
        arr = np.array(glow).astype(float)
        # Strong purple: boost red and blue, kill green
        arr[:,:,0] = np.clip(arr[:,:,0] * 1.8 + 80, 0, 255)  # Red boost
        arr[:,:,1] = np.clip(arr[:,:,1] * 0.2, 0, 255)       # Green down
        arr[:,:,2] = np.clip(arr[:,:,2] * 1.5 + 60, 0, 255)  # Blue boost
        glow_data = arr.astype(np.uint8)
        glow.paste(Image.fromarray(glow_data, 'RGBA'))
    
    # Blur each layer differently for layered glow
    glow1 = glow1.filter(ImageFilter.GaussianBlur(radius=50))
    glow2 = glow2.filter(ImageFilter.GaussianBlur(radius=30))
    glow3 = glow3.filter(ImageFilter.GaussianBlur(radius=15))
    
    # Composite all layers
    final = Image.new('RGBA', square.size, (0, 0, 0, 0))
    final = Image.alpha_composite(final, glow1)
    final = Image.alpha_composite(final, glow2)
    final = Image.alpha_composite(final, glow3)
    final = Image.alpha_composite(final, square)
    
    # Save everywhere
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
    
    # Export copy
    final.save("attached_assets/lotops-emblem-export.png", format='PNG')
    print("Saved export to attached_assets/lotops-emblem-export.png")
    
    print("\nDone! Strong purple glow applied.")

if __name__ == "__main__":
    process_emblem()
