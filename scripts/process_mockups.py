import os
from PIL import Image

def process_mockup(input_path, output_path, bg_threshold=35, edge_range=20):
    """
    Loads a mockup image on a black background, removes the background by making
    it transparent, applies edge smoothing, and saves as a PNG.
    """
    print(f"Processing {input_path} -> {output_path}...")
    if not os.path.exists(input_path):
        print(f"Error: Input path {input_path} does not exist.")
        return False

    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    new_data = []
    # Interpolation limits for smoothing
    min_bright = bg_threshold
    max_bright = bg_threshold + edge_range

    for item in datas:
        r, g, b, a = item
        # Calculate brightness (using max channel value for safety on black)
        brightness = max(r, g, b)

        if brightness <= min_bright:
            # Fully transparent background
            new_data.append((0, 0, 0, 0))
        elif brightness >= max_bright:
            # Keep original pixel
            new_data.append((r, g, b, a))
        else:
            # Linear interpolation of alpha for smooth edges
            factor = (brightness - min_bright) / edge_range
            new_alpha = int(255 * factor)
            # Mix towards white if it's edge detail
            new_data.append((r, g, b, new_alpha))

    img.putdata(new_data)
    
    # Save output
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG")
    print(f"Successfully saved transparent mockup to {output_path}!")
    return True

# Define file paths
brain_dir = "/Users/neerajgawane/.gemini/antigravity-ide/brain/5a16798f-37f5-44c0-b8f1-c9e519258897"
mockups_dest = "/Users/neerajgawane/for-tshirts/public/mockups"

# Map generated raw files to their destinations
mappings = [
    {
        "src": os.path.join(brain_dir, "tshirt_regular_men_front_raw_1782812058290.png"),
        "dest": os.path.join(mockups_dest, "tshirt-regular-men-front.png")
    },
    {
        "src": os.path.join(brain_dir, "tshirt_regular_men_back_raw_1782812074734.png"),
        "dest": os.path.join(mockups_dest, "tshirt-regular-men-back.png")
    },
    {
        "src": os.path.join(brain_dir, "tshirt_women_front_raw_1782811596254.png"),
        "dest": os.path.join(mockups_dest, "tshirt-regular-women-front.png")
    },
    {
        "src": os.path.join(brain_dir, "tshirt_women_back_raw_1782811613068.png"),
        "dest": os.path.join(mockups_dest, "tshirt-regular-women-back.png")
    }
]

for m in mappings:
    process_mockup(m["src"], m["dest"])
