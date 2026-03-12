#!/usr/bin/env python3
"""
Background removal service using rembg library.
Removes backgrounds from images locally without API keys.
"""

import sys
import base64
import io
from PIL import Image
from rembg import remove

def remove_background(input_base64: str) -> str:
    """
    Remove background from a base64-encoded image.
    Returns base64-encoded PNG with transparent background.
    """
    try:
        # Decode base64 input
        if ',' in input_base64:
            input_base64 = input_base64.split(',')[1]
        
        image_data = base64.b64decode(input_base64)
        input_image = Image.open(io.BytesIO(image_data))
        
        # Remove background using rembg
        output_image = remove(input_image)
        
        # Convert to RGBA if not already
        if output_image.mode != 'RGBA':
            output_image = output_image.convert('RGBA')
        
        # Encode result as base64 PNG
        output_buffer = io.BytesIO()
        output_image.save(output_buffer, format='PNG')
        output_buffer.seek(0)
        
        result_base64 = base64.b64encode(output_buffer.read()).decode('utf-8')
        return f"data:image/png;base64,{result_base64}"
    
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python rembg_service.py <base64_image>", file=sys.stderr)
        sys.exit(1)
    
    # Read base64 from stdin if argument is "-"
    if sys.argv[1] == "-":
        input_data = sys.stdin.read().strip()
    else:
        input_data = sys.argv[1]
    
    result = remove_background(input_data)
    print(result)
