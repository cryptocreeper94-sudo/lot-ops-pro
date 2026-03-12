#!/usr/bin/env python3
"""Process the Lot Buddy emblem with pastel glow effect"""

import os
from PIL import Image, ImageFilter, ImageEnhance
from rembg import remove
import numpy as np

def add_pastel_glow(img, glow_color=(100, 200, 220), intensity=80):
    """Add a soft pastel glow (light cyan/mint)"""
    img_array = np.array(img)
    alpha = img_array[:, :, 3]
    
    # Create glow layer
    glow_size = img.width + intensity * 2
    glow = Image.new('RGBA', (glow_size, glow_size), (0, 0, 0, 0))
    
    # Paste and blur for glow
    offset = intensity
    temp = Image.new('RGBA', (glow_size, glow_size), (0, 0, 0, 0))
    temp.paste(img, (offset, offset), img)
    
    # Create colored glow from alpha
    temp_array = np.array(temp)
    glow_array = np.zeros_like(temp_array)
    glow_array[:, :, 0] = glow_color[0]
    glow_array[:, :, 1] = glow_color[1]
    glow_array[:, :, 2] = glow_color[2]
    glow_array[:, :, 3] = temp_array[:, :, 3]
    
    glow_img = Image.fromarray(glow_array.astype('uint8'))
    
    # Multiple blur passes for smooth glow
    for _ in range(3):
        glow_img = glow_img.filter(ImageFilter.GaussianBlur(radius=25))
    
    # Boost glow opacity
    glow_array = np.array(glow_img)
    glow_array[:, :, 3] = np.minimum(glow_array[:, :, 3] * 2.5, 255).astype('uint8')
    glow_img = Image.fromarray(glow_array.astype('uint8'))
    
    # Composite: glow behind original
    result = glow_img.copy()
    result.paste(img, (offset, offset), img)
    
    return result

def process():
    print("Loading emblem...")
    img = Image.open("attached_assets/generated_images/safety_vest_worker_waving_car.png").convert('RGBA')
    
    print("Removing background with rembg...")
    transparent = remove(img)
    
    print("Adding pastel cyan/mint glow...")
    # Light cyan/mint glow color
    glowing = add_pastel_glow(transparent, glow_color=(120, 220, 200), intensity=60)
    
    print("Saving emblem files...")
    for folder in ['public', 'client/public']:
        os.makedirs(folder, exist_ok=True)
        glowing.save(f"{folder}/lotops-emblem-transparent.png", format='PNG')
        
        # Create icons at various sizes
        for sz, fn in [(512, 'icon-512x512.png'), (192, 'icon-192x192.png'), 
                       (180, 'apple-touch-icon.png'), (32, 'favicon.png')]:
            icon = glowing.copy()
            icon.thumbnail((sz, sz), Image.Resampling.LANCZOS)
            canvas = Image.new('RGBA', (sz, sz), (0, 0, 0, 0))
            px = (sz - icon.width) // 2
            py = (sz - icon.height) // 2
            canvas.paste(icon, (px, py), icon)
            canvas.save(f"{folder}/{fn}", format='PNG')
    
    # Export copy
    glowing.save("attached_assets/lotops-emblem-export.png", format='PNG')
    print("Done! Emblem with pastel glow applied.")

if __name__ == "__main__":
    process()
