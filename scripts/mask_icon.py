from PIL import Image, ImageDraw, ImageOps
import sys

def make_rounded_icon(input_path, output_path, corner_radius_ratio=0.2):
    try:
        # Open the image
        img = Image.open(input_path).convert("RGBA")
        width, height = img.size
        
        # Determine strict square crop first to center
        min_dim = min(width, height)
        left = (width - min_dim) / 2
        top = (height - min_dim) / 2
        right = (width + min_dim) / 2
        bottom = (height + min_dim) / 2
        img = img.crop((left, top, right, bottom))
        
        # Create a mask for rounded corners
        mask = Image.new('L', img.size, 0)
        draw = ImageDraw.Draw(mask)
        
        # Draw rounded rectangle on the mask (white = opaque, black = transparent)
        # We leave a tiny margin to ensure clean edges or full bleed
        # User wanted full bleed icon, so we round the corners of the full image
        draw.rounded_rectangle([(0, 0), img.size], radius=min_dim * corner_radius_ratio, fill=255)
        
        # Apply the mask
        img.putalpha(mask)
        
        # Save
        img.save(output_path, "PNG")
        print(f"Successfully saved rounded transparent icon to {output_path}")

    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python mask_icon.py <input_path> <output_path>")
        sys.exit(1)
        
    make_rounded_icon(sys.argv[1], sys.argv[2])
