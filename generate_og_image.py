"""
Generates a custom, high-resolution Open Graph (OG) social card image (1200x630)
matching Mohan Jha's sci-fi dark aesthetic for social previews on LinkedIn, Twitter/X, Discord, Slack.
"""

import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630

# Base dark canvas
img = Image.new('RGB', (W, H), '#030014')

# Glow overlay
glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
gdraw = ImageDraw.Draw(glow)

# Top-left cyan glow
for r in range(400, 0, -10):
    alpha = int(40 * (1 - r / 400))
    gdraw.ellipse([(-100 - r, -100 - r), (-100 + r, -100 + r)], fill=(0, 212, 255, alpha))

# Bottom-right violet glow
for r in range(450, 0, -10):
    alpha = int(35 * (1 - r / 450))
    gdraw.ellipse([(1100 - r, 550 - r), (1100 + r, 550 + r)], fill=(124, 58, 237, alpha))

# Top-right blue glow
for r in range(350, 0, -10):
    alpha = int(25 * (1 - r / 350))
    gdraw.ellipse([(900 - r, -50 - r), (900 + r, -50 + r)], fill=(41, 151, 255, alpha))

base = Image.new('RGBA', (W, H), (3, 0, 20, 255))
base = Image.alpha_composite(base, glow)
img = base.convert('RGB')
draw = ImageDraw.Draw(img)

# Subtle grid overlay
for x in range(0, W, 40):
    draw.line([(x, 0), (x, H)], fill=(255, 255, 255, 8), width=1)
for y in range(0, H, 40):
    draw.line([(0, y), (W, y)], fill=(255, 255, 255, 8), width=1)

# Inner glass frame
draw.rounded_rectangle([40, 40, W-40, H-40], radius=24, outline=(41, 151, 255), width=2)
# Top terminal bar line
draw.line([(40, 95), (W-40, 95)], fill=(60, 80, 120), width=1)

# Mac window dots
draw.ellipse([65, 62, 77, 74], fill=(239, 68, 68))
draw.ellipse([87, 62, 99, 74], fill=(245, 158, 11))
draw.ellipse([109, 62, 121, 74], fill=(16, 185, 129))

# Font paths
font_paths = [
    '/System/Library/Fonts/Supplemental/Arial.ttf',
    '/Library/Fonts/Arial.ttf',
    '/System/Library/Fonts/Helvetica.ttc'
]
chosen_font = next((p for p in font_paths if os.path.exists(p)), None)

if chosen_font:
    font_title = ImageFont.truetype(chosen_font, 56)
    font_sub = ImageFont.truetype(chosen_font, 28)
    font_mono = ImageFont.truetype(chosen_font, 16)
    font_badge = ImageFont.truetype(chosen_font, 16)
    font_body = ImageFont.truetype(chosen_font, 20)
else:
    font_title = font_sub = font_mono = font_badge = font_body = ImageFont.load_default()

# Terminal title
draw.text((140, 60), 'mohan-portfolio ~ devops-cloud-infrastructure', fill=(160, 175, 200), font=font_mono)

# Status pill
pill_box = [70, 130, 420, 166]
draw.rounded_rectangle(pill_box, radius=18, fill=(10, 40, 30), outline=(16, 185, 129), width=1)
draw.ellipse([86, 143, 96, 153], fill=(48, 209, 88))
draw.text((106, 139), 'AVAILABLE FOR DEVOPS ROLES', fill=(48, 209, 88), font=font_badge)

# Main Name
draw.text((70, 195), 'MOHAN JHA', fill=(255, 255, 255), font=font_title)

# Role / Tagline
draw.text((70, 268), 'DevOps & Cloud Infrastructure Engineer', fill=(0, 212, 255), font=font_sub)

# Description
draw.text((70, 318), 'Bridging Development & Operations with Automation, CI/CD Pipelines,', fill=(200, 210, 230), font=font_body)
draw.text((70, 348), 'Container Orchestration, and Production-Grade Observability.', fill=(200, 210, 230), font=font_body)

# Skill badges
badges = ['AWS Certified', 'Azure Certified (AZ-104 & AZ-900)', 'Docker', 'Kubernetes', 'Prometheus & Grafana', 'Python & Boto3']
bx = 70
by = 410
for b in badges:
    bbox = font_mono.getbbox(b)
    bw = bbox[2] - bbox[0] + 24
    if bx + bw > W - 70:
        bx = 70
        by += 44
    draw.rounded_rectangle([bx, by, bx + bw, by + 32], radius=8, fill=(20, 30, 55), outline=(41, 151, 255), width=1)
    draw.text((bx + 12, by + 6), b, fill=(220, 235, 255), font=font_mono)
    bx += bw + 12

# Footer credentials
draw.line([(70, 510), (W-70, 510)], fill=(60, 80, 120), width=1)
draw.text((70, 535), '⚡ d84o05v9b2k31.cloudfront.net', fill=(41, 151, 255), font=font_body)
draw.text((620, 535), 'github.com/mohbha  •  linkedin.com/in/mohanjha1', fill=(160, 175, 200), font=font_body)

output_path = os.path.join(os.path.dirname(__file__), 'og-image.png')
img.save(output_path, 'PNG', optimize=True)
print(f'Successfully generated {output_path} ({os.path.getsize(output_path)} bytes)')

