Place the provided game field image here as:

field-map.png

The runtime loader expects this exact path:

/public/assets/maps/field-map.png

The current world size is set to 1920x1080 to match the edge-to-edge battlefield layout.

Editable source output is also generated alongside the PNG as:

field-map-source.svg

Regenerate both files with:

npm run generate:map

The generator prefers a local Chrome/Chromium binary for PNG export.
If that renderer is unavailable or restricted, the editable SVG source is still updated.
