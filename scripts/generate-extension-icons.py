#!/usr/bin/env python3
"""
Generate browser extension icons from SVG template.
Requires: pip install pillow
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw
except ImportError:
    print("Error: Pillow not installed. Run: pip install pillow")
    sys.exit(1)


def create_icon(size: int) -> Image.Image:
    """Create a Todone icon of the specified size."""
    # Create image with green background
    img = Image.new("RGBA", (size, size), "#10b981")
    draw = ImageDraw.Draw(img)

    # Draw rounded corners
    radius = int(size * 0.19)  # 24/128 ≈ 0.19
    for x in range(radius):
        y = int((radius**2 - x**2) ** 0.5)
        draw.ellipse(
            [x, 0, x, y],
            fill="#10b981",
        )

    # Draw checkmark
    center_x = size / 2
    center_y = size / 2
    stroke_width = max(1, int(size / 9))

    # Points for checkmark
    start_x = center_x - size * 0.23
    start_y = center_y - size * 0.04
    mid_x = center_x - size * 0.08
    mid_y = center_y + size * 0.16
    end_x = center_x + size * 0.24
    end_y = center_y - size * 0.16

    # Draw checkmark lines
    draw.line(
        [(start_x, start_y), (mid_x, mid_y)],
        fill="white",
        width=stroke_width,
    )
    draw.line(
        [(mid_x, mid_y), (end_x, end_y)],
        fill="white",
        width=stroke_width,
    )

    return img


def main():
    """Generate all icon sizes."""
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    icons_dir = project_dir / "public" / "extension" / "icons"

    # Create directory if it doesn't exist
    icons_dir.mkdir(parents=True, exist_ok=True)

    # Generate icons for each size
    sizes = [16, 48, 128]
    for size in sizes:
        img = create_icon(size)
        output_path = icons_dir / f"icon-{size}x{size}.png"
        img.save(output_path, "PNG")
        print(f"✓ Created {output_path}")

    print(f"\nAll icons generated successfully in {icons_dir}")


if __name__ == "__main__":
    main()
