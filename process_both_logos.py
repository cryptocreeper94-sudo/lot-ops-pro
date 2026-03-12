#!/usr/bin/env python3
"""Process both the emblem and LP watermark logo"""

import os
from PIL import Image, ImageFilter
from rembg import remove
import numpy as np

def add_soft_glow(img, glow_color=(120, 220, 200), intensity=50):
    """Add soft pastel glow"""
    glow_size = img.width + intensity * 2
    
    temp = Image.new('RGBA', (glow_size, glow_size), (0, 0, 0, 0))
    offset = intensity
    temp.paste(img, (offset, offset), img)
    
    temp_array = np.array(temp)
    glow_array = np.zeros_like(temp_array)
    glow_array[:, :, 0] = glow_color[0]
    glow_array[:, :, 1] = glow_color[1]
    glow_array[:, :, 2] = glow_color[2]
    glow_array[:, :, 3] = temp_array[:, :, 3]
    
    glow_img = Image.fromarray(glow_array.astype('uint8'))
    for _ in range(3):
        glow_img = glow_img.filter(ImageFilter.GaussianBlur(radius=20))
    
    glow_array = np.array(glow_img)
    glow_array[:, :, 3] = np.minimum(glow_array[:, :, 3] * 2, 255).astype('uint8')
    glow_img = Image.fromarray(glow_array.astype('uint8'))
    
    result = glow_img.copy()
    result.paste(img, (offset, offset), img)
    return result

def process_emblem():
    print("Processing main emblem...")
    img = Image.open("attached_assets/generated_images/safety_vest_worker_waving_car.png").convert('RGBA')
    
    # Remove background
    transparent = remove(img)
    
    # Crop to remove car remnants - focus on the worker
    w, h = transparent.size
    # Crop from the left to remove car parts
    crop_left = int(w * 0.15)
    cropped = transparent.crop((crop_left, 0, w, h))
    
    # Add soft mint glow
    glowing = add_soft_glow(cropped, glow_color=(130, 210, 190), intensity=40)
    
    # Save everywhere
    for folder in ['public', 'client/public']:
        os.makedirs(folder, exist_ok=True)
        glowing.save(f"{folder}/lotops-emblem-transparent.png", format='PNG')
        
        for sz, fn in [(512, 'icon-512x512.png'), (192, 'icon-192x192.png'), 
                       (180, 'apple-touch-icon.png'), (32, 'favicon.png')]:
            icon = glowing.copy()
            icon.thumbnail((sz, sz), Image.Resampling.LANCZOS)
            canvas = Image.new('RGBA', (sz, sz), (0, 0, 0, 0))
            px = (sz - icon.width) // 2
            py = (sz - icon.height) // 2
            canvas.paste(icon, (px, py), icon)
            canvas.save(f"{folder}/{fn}", format='PNG')
    
    glowing.save("attached_assets/lotops-emblem-export.png", format='PNG')
    print("Emblem done!")

def process_lp_watermark():
    print("Processing LP watermark logo...")
    img = Image.open("attached_assets/generated_images/stylized_lp_monogram_logo.png").convert('RGBA')
    
    # Remove background
    transparent = remove(img)
    
    # Save LP watermark
    for folder in ['public', 'client/public']:
        transparent.save(f"{folder}/lotops-lp-watermark.png", format='PNG')
    
    transparent.save("attached_assets/lotops-lp-watermark.png", format='PNG')
    print("LP watermark done!")

if __name__ == "__main__":
    process_emblem()
    process_lp_watermark()
    print("\nAll logos processed!")
