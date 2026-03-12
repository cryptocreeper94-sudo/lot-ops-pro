#!/usr/bin/env python3
"""
Process the Lot Ops Pro emblem v2:
1. Crop to just the circular icon (remove text at bottom)
2. Keep the glow effect intact
3. Create truly transparent background
"""

import os
from PIL import Image
import numpy as np

def process_emblem():
    input_path = "attached_assets/Copilot_20251120_123722_1764916130184.png"
    
    print(f"Loading image from {input_path}...")
    img = Image.open(input_path).convert('RGBA')
    
    width, height = img.size
    print(f"Original size: {width}x{height}")
    
    # The emblem is in the top portion, text is at the bottom
    # Crop to just above the text - approximately top 52% to get circle + glow
    crop_height = int(height * 0.52)
    
    # Center crop to get just the circular emblem with glow
    # The emblem appears centered, so we can crop symmetrically
    margin = int(width * 0.05)  # Small margin on sides
    cropped = img.crop((margin, 0, width - margin, crop_height))
    print(f"Cropped to: {cropped.size}")
    
    # Convert to numpy array for processing
    arr = np.array(cropped)
    
    # Create transparency based on the dark background
    # The glow has blue/cyan colors, the background is dark gray/black
    # We want to make the dark corners transparent while keeping the glow
    
    # Get the RGB channels
    r, g, b, a = arr[:,:,0], arr[:,:,1], arr[:,:,2], arr[:,:,3]
    
    # Calculate brightness
    brightness = (r.astype(float) + g.astype(float) + b.astype(float)) / 3
    
    # Calculate "blueness" - higher blue relative to red indicates glow
    blueness = b.astype(float) - r.astype(float) * 0.5
    
    # Create alpha mask:
    # - Keep bright pixels (the chrome emblem)
    # - Keep blue-ish pixels (the glow)
    # - Make dark gray pixels transparent
    
    # Base alpha from brightness and blueness
    alpha_from_bright = np.clip(brightness / 255 * 1.5, 0, 1)
    alpha_from_blue = np.clip(blueness / 100, 0, 1)
    
    # Combine - keep either bright OR blue areas
    new_alpha = np.maximum(alpha_from_bright, alpha_from_blue)
    
    # Apply threshold for cleaner edges, but keep glow gradient
    # Areas below threshold get reduced alpha
    threshold = 0.15
    new_alpha = np.where(new_alpha > threshold, new_alpha, new_alpha * 0.3)
    
    # Boost the glow areas (blue-ish regions)
    glow_mask = blueness > 20
    new_alpha = np.where(glow_mask, np.clip(new_alpha * 1.5, 0, 1), new_alpha)
    
    # Convert back to 0-255 range
    new_alpha = (new_alpha * 255).astype(np.uint8)
    
    # Apply new alpha channel
    arr[:,:,3] = new_alpha
    
    # Create the result image
    result = Image.fromarray(arr, 'RGBA')
    
    # Make it square by padding
    max_dim = max(result.size)
    square = Image.new('RGBA', (max_dim, max_dim), (0, 0, 0, 0))
    x = (max_dim - result.width) // 2
    y = (max_dim - result.height) // 2
    square.paste(result, (x, y), result)
    
    # Save the main emblem
    output_path = "public/lotops-emblem.png"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    square.save(output_path, format='PNG')
    print(f"Saved emblem to {output_path}")
    
    # Create all icon sizes from the same source
    sizes = [
        (512, 'icon-512x512.png'),
        (192, 'icon-192x192.png'),
        (180, 'apple-touch-icon.png'),
        (32, 'favicon.png'),
    ]
    
    for size, filename in sizes:
        icon = square.copy()
        icon.thumbnail((size, size), Image.Resampling.LANCZOS)
        
        # Center on square canvas
        canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        x = (size - icon.width) // 2
        y = (size - icon.height) // 2
        canvas.paste(icon, (x, y), icon)
        
        icon_path = f"public/{filename}"
        canvas.save(icon_path, format='PNG')
        print(f"Saved {size}x{size} icon to {icon_path}")
    
    # Also save the watermark version (same as main emblem)
    square.save("public/lotops-emblem-transparent.png", format='PNG')
    print("Saved watermark emblem to public/lotops-emblem-transparent.png")
    
    print("\nDone! All icons now use the same source emblem.")

if __name__ == "__main__":
    process_emblem()
