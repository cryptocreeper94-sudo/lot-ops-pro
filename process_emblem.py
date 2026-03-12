#!/usr/bin/env python3
"""
Process the Lot Ops Pro emblem:
1. Crop to just the circular icon (remove text at bottom)
2. Remove background using rembg while keeping the glow
"""

import sys
from PIL import Image
from rembg import remove
import os

def process_emblem():
    input_path = "attached_assets/Copilot_20251120_123722_1764916130184.png"
    output_path = "public/lotops-emblem-transparent.png"
    
    print(f"Loading image from {input_path}...")
    img = Image.open(input_path)
    
    width, height = img.size
    print(f"Original size: {width}x{height}")
    
    # The emblem is in the top portion, text is at the bottom
    # Crop to top ~55% of the image to get just the circular emblem with glow
    crop_height = int(height * 0.55)
    cropped = img.crop((0, 0, width, crop_height))
    print(f"Cropped to: {width}x{crop_height}")
    
    # Remove background using rembg
    print("Removing background with rembg...")
    result = remove(cropped)
    
    # Ensure RGBA mode
    if result.mode != 'RGBA':
        result = result.convert('RGBA')
    
    # Save the result
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    result.save(output_path, format='PNG')
    print(f"Saved transparent emblem to {output_path}")
    
    # Also create different sizes for PWA icons
    sizes = [192, 512]
    for size in sizes:
        icon = result.copy()
        icon.thumbnail((size, size), Image.Resampling.LANCZOS)
        
        # Create a square canvas
        square = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        # Center the icon
        x = (size - icon.width) // 2
        y = (size - icon.height) // 2
        square.paste(icon, (x, y), icon)
        
        icon_path = f"public/icon-{size}.png"
        square.save(icon_path, format='PNG')
        print(f"Saved icon {size}x{size} to {icon_path}")
    
    print("Done!")

if __name__ == "__main__":
    process_emblem()
