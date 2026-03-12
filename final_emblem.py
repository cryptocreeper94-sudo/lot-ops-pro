#!/usr/bin/env python3
"""Process the unified worker+car emblem with full body"""

import os
from PIL import Image, ImageFilter
from rembg import remove
import numpy as np

def create_soft_glow(img, glow_color=(140, 220, 200), blur_radius=12, glow_opacity=0.25):
    """Create soft emanating glow"""
    w, h = img.size
    padding = 50
    canvas_size = (w + padding*2, h + padding*2)
    
    alpha = np.array(img)[:, :, 3]
    
    glow_base = Image.new('RGBA', img.size, (*glow_color, 0))
    glow_data = np.array(glow_base)
    glow_data[:, :, 3] = alpha
    glow_img = Image.fromarray(glow_data.astype('uint8'))
    
    canvas = Image.new('RGBA', canvas_size, (0, 0, 0, 0))
    canvas.paste(glow_img, (padding, padding), glow_img)
    
    blurred = canvas.filter(ImageFilter.GaussianBlur(radius=blur_radius))
    blurred = blurred.filter(ImageFilter.GaussianBlur(radius=blur_radius))
    
    blurred_data = np.array(blurred)
    blurred_data[:, :, 3] = (blurred_data[:, :, 3] * glow_opacity).astype('uint8')
    blurred = Image.fromarray(blurred_data.astype('uint8'))
    
    blurred.paste(img, (padding, padding), img)
    return blurred

def process():
    print("Processing unified worker+car emblem...")
    img = Image.open("attached_assets/generated_images/worker_with_car_emblem_unified.png").convert('RGBA')
    
    # Remove background - keeps worker AND car together
    transparent = remove(img)
    
    # Add soft mint glow
    final = create_soft_glow(transparent, glow_color=(140, 220, 200), blur_radius=15, glow_opacity=0.2)
    
    # Save everywhere
    for folder in ['public', 'client/public']:
        os.makedirs(folder, exist_ok=True)
        final.save(f"{folder}/lotops-emblem-transparent.png", format='PNG')
        
        for sz, fn in [(512, 'icon-512x512.png'), (192, 'icon-192x192.png'), 
                       (180, 'apple-touch-icon.png'), (32, 'favicon.png')]:
            icon = final.copy()
            icon.thumbnail((sz, sz), Image.Resampling.LANCZOS)
            canvas = Image.new('RGBA', (sz, sz), (0, 0, 0, 0))
            px = (sz - icon.width) // 2
            py = (sz - icon.height) // 2
            canvas.paste(icon, (px, py), icon)
            canvas.save(f"{folder}/{fn}", format='PNG')
    
    final.save("attached_assets/lotops-emblem-export.png", format='PNG')
    print("Done!")

if __name__ == "__main__":
    process()
