#!/usr/bin/env python3
"""Fix transparency - proper floating emblem with soft glow"""

import os
from PIL import Image, ImageFilter
from rembg import remove
import numpy as np

def create_soft_glow(img, glow_color=(130, 210, 190), blur_radius=15, glow_opacity=0.4):
    """Create soft emanating glow that fades out"""
    w, h = img.size
    padding = 80
    canvas_size = (w + padding*2, h + padding*2)
    
    # Get alpha channel
    alpha = np.array(img)[:, :, 3]
    
    # Create glow from alpha
    glow_base = Image.new('RGBA', img.size, (*glow_color, 0))
    glow_data = np.array(glow_base)
    glow_data[:, :, 3] = alpha
    glow_img = Image.fromarray(glow_data.astype('uint8'))
    
    # Put on larger canvas and blur
    canvas = Image.new('RGBA', canvas_size, (0, 0, 0, 0))
    canvas.paste(glow_img, (padding, padding), glow_img)
    
    # Heavy blur for soft glow
    blurred = canvas.filter(ImageFilter.GaussianBlur(radius=blur_radius))
    blurred = blurred.filter(ImageFilter.GaussianBlur(radius=blur_radius))
    
    # Reduce glow opacity
    blurred_data = np.array(blurred)
    blurred_data[:, :, 3] = (blurred_data[:, :, 3] * glow_opacity).astype('uint8')
    blurred = Image.fromarray(blurred_data.astype('uint8'))
    
    # Composite original on top
    blurred.paste(img, (padding, padding), img)
    
    return blurred

def process_emblem():
    print("Processing emblem with proper transparency...")
    img = Image.open("attached_assets/generated_images/safety_vest_worker_waving_car.png").convert('RGBA')
    
    # Remove background
    transparent = remove(img)
    
    # Crop left side to remove car remnants
    w, h = transparent.size
    cropped = transparent.crop((int(w * 0.18), 0, w, h))
    
    # Add soft glow
    final = create_soft_glow(cropped, glow_color=(140, 220, 200), blur_radius=20, glow_opacity=0.35)
    
    # Save
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
    print("Emblem done!")

def process_lp():
    print("Processing LP watermark...")
    img = Image.open("attached_assets/generated_images/stylized_lp_monogram_logo.png").convert('RGBA')
    
    # Remove background
    transparent = remove(img)
    
    for folder in ['public', 'client/public']:
        transparent.save(f"{folder}/lotops-lp-watermark.png", format='PNG')
    
    transparent.save("attached_assets/lotops-lp-watermark.png", format='PNG')
    print("LP done!")

if __name__ == "__main__":
    process_emblem()
    process_lp()
    print("All done!")
