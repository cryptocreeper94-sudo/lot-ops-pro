#!/usr/bin/env python3
"""Create PWA icons with full-color background (no white edges)"""

from PIL import Image
import os

# Background color matching the app theme (dark slate)
BG_COLOR = (15, 23, 42, 255)  # #0f172a - slate-900

# Source emblem (transparent PNG)
SOURCE = "client/public/lotops-emblem-transparent.png"

# Output paths
OUTPUTS = {
    "client/public/icon-192x192.png": 192,
    "client/public/icon-512x512.png": 512,
    "client/public/icon-192.png": 192,
    "client/public/icon-512.png": 512,
    "client/public/apple-touch-icon.png": 180,
    "client/public/favicon.png": 32,
    "public/icon-192x192.png": 192,
    "public/icon-512x512.png": 512,
    "public/apple-touch-icon.png": 180,
    "public/favicon.png": 32,
}

def create_icon(source_path, output_path, size):
    """Create an icon with dark background and centered emblem"""
    # Open source image
    emblem = Image.open(source_path).convert("RGBA")
    
    # Create new image with dark background
    icon = Image.new("RGBA", (size, size), BG_COLOR)
    
    # Calculate size for emblem (80% of icon size for padding)
    emblem_size = int(size * 0.8)
    
    # Resize emblem maintaining aspect ratio
    emblem.thumbnail((emblem_size, emblem_size), Image.Resampling.LANCZOS)
    
    # Calculate position to center
    x = (size - emblem.width) // 2
    y = (size - emblem.height) // 2
    
    # Paste emblem onto background
    icon.paste(emblem, (x, y), emblem)
    
    # Convert to RGB for final output (removes alpha for better compatibility)
    icon_rgb = Image.new("RGB", icon.size, BG_COLOR[:3])
    icon_rgb.paste(icon, mask=icon.split()[3])
    
    # Save
    icon_rgb.save(output_path, "PNG", optimize=True)
    print(f"Created: {output_path} ({size}x{size})")

def main():
    if not os.path.exists(SOURCE):
        print(f"Source not found: {SOURCE}")
        return
    
    for output_path, size in OUTPUTS.items():
        # Ensure directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        create_icon(SOURCE, output_path, size)
    
    print("\nAll PWA icons created with dark background!")

if __name__ == "__main__":
    main()
