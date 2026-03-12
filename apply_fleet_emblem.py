#!/usr/bin/env python3
"""Apply the fleet cars emblem with emanating light rays"""

import os
from PIL import Image, ImageFilter
from rembg import remove
import numpy as np

def process():
    img = Image.open("attached_assets/generated_images/fleet_cars_with_light_rays.png").convert('RGBA')
    
    print("Removing background...")
    transparent = remove(img)
    
    # Save everywhere
    for folder in ['public', 'client/public']:
        os.makedirs(folder, exist_ok=True)
        transparent.save(f"{folder}/lotops-emblem-transparent.png", format='PNG')
        
        for sz, fn in [(512, 'icon-512x512.png'), (192, 'icon-192x192.png'), 
                       (180, 'apple-touch-icon.png'), (32, 'favicon.png')]:
            icon = transparent.copy()
            icon.thumbnail((sz, sz), Image.Resampling.LANCZOS)
            canvas = Image.new('RGBA', (sz, sz), (0, 0, 0, 0))
            px = (sz - icon.width) // 2
            py = (sz - icon.height) // 2
            canvas.paste(icon, (px, py), icon)
            canvas.save(f"{folder}/{fn}", format='PNG')
    
    transparent.save("attached_assets/lotops-emblem-export.png", format='PNG')
    print("Done!")

if __name__ == "__main__":
    process()
