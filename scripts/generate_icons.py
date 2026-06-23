import math
import struct
import zlib
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets"


def rgba(hex_color):
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i : i + 2], 16) for i in (0, 2, 4)) + (255,)


def blend(dst, src):
    alpha = src[3] / 255
    return tuple(round(src[i] * alpha + dst[i] * (1 - alpha)) for i in range(3)) + (255,)


def put(canvas, x, y, color):
    if 0 <= x < len(canvas[0]) and 0 <= y < len(canvas):
        canvas[y][x] = blend(canvas[y][x], color)


def fill_circle(canvas, cx, cy, radius, color):
    min_x = max(0, int(cx - radius))
    max_x = min(len(canvas[0]) - 1, int(cx + radius))
    min_y = max(0, int(cy - radius))
    max_y = min(len(canvas) - 1, int(cy + radius))
    r2 = radius * radius
    for y in range(min_y, max_y + 1):
        for x in range(min_x, max_x + 1):
            if (x - cx) ** 2 + (y - cy) ** 2 <= r2:
                put(canvas, x, y, color)


def point_in_polygon(x, y, polygon):
    inside = False
    j = len(polygon) - 1
    for i, point in enumerate(polygon):
        xi, yi = point
        xj, yj = polygon[j]
        intersects = (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / ((yj - yi) or 1) + xi
        if intersects:
            inside = not inside
        j = i
    return inside


def fill_polygon(canvas, polygon, color):
    min_x = max(0, int(min(x for x, _ in polygon)))
    max_x = min(len(canvas[0]) - 1, int(max(x for x, _ in polygon)))
    min_y = max(0, int(min(y for _, y in polygon)))
    max_y = min(len(canvas) - 1, int(max(y for _, y in polygon)))
    for y in range(min_y, max_y + 1):
        for x in range(min_x, max_x + 1):
            if point_in_polygon(x, y, polygon):
                put(canvas, x, y, color)


def draw_line(canvas, x1, y1, x2, y2, width, color):
    steps = max(abs(x2 - x1), abs(y2 - y1), 1)
    for step in range(int(steps) + 1):
        t = step / steps
        x = x1 + (x2 - x1) * t
        y = y1 + (y2 - y1) * t
        fill_circle(canvas, x, y, width / 2, color)


def draw_polyline(canvas, points, width, color):
    for start, end in zip(points, points[1:]):
        draw_line(canvas, start[0], start[1], end[0], end[1], width, color)


def downsample(canvas, scale):
    height = len(canvas) // scale
    width = len(canvas[0]) // scale
    result = []
    for y in range(height):
        row = []
        for x in range(width):
            totals = [0, 0, 0, 0]
            for yy in range(scale):
                for xx in range(scale):
                    pixel = canvas[y * scale + yy][x * scale + xx]
                    for idx in range(4):
                        totals[idx] += pixel[idx]
            area = scale * scale
            row.append(tuple(round(value / area) for value in totals))
        result.append(row)
    return result


def write_png(path, canvas):
    height = len(canvas)
    width = len(canvas[0])
    raw = bytearray()
    for row in canvas:
        raw.append(0)
        for pixel in row:
            raw.extend(pixel)

    def chunk(kind, data):
        return (
            struct.pack(">I", len(data))
            + kind
            + data
            + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)
        )

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    png += chunk(b"IEND", b"")
    path.write_bytes(png)


def make_icon(size):
    scale = 4
    canvas_size = size * scale
    bg = rgba("#f4f7f8")
    canvas = [[bg for _ in range(canvas_size)] for _ in range(canvas_size)]
    s = canvas_size

    eye = [
        (0.16 * s, 0.50 * s),
        (0.35 * s, 0.33 * s),
        (0.65 * s, 0.33 * s),
        (0.84 * s, 0.50 * s),
        (0.65 * s, 0.67 * s),
        (0.35 * s, 0.67 * s),
    ]
    fill_polygon(canvas, eye, rgba("#ffffff"))
    draw_polyline(canvas, eye + [eye[0]], 0.052 * s, rgba("#2e8798"))
    fill_circle(canvas, 0.50 * s, 0.50 * s, 0.118 * s, rgba("#7b2cc5"))
    fill_circle(canvas, 0.54 * s, 0.455 * s, 0.035 * s, rgba("#ffffff"))
    draw_polyline(
        canvas,
        [
            (0.25 * s, 0.76 * s),
            (0.36 * s, 0.69 * s),
            (0.51 * s, 0.66 * s),
            (0.61 * s, 0.70 * s),
            (0.75 * s, 0.59 * s),
        ],
        0.048 * s,
        rgba("#d28b00"),
    )
    return downsample(canvas, scale)


for icon_size in (180, 192, 512):
    write_png(ASSET_DIR / f"icon-{icon_size}.png", make_icon(icon_size))
