# Find and show an asset

1. Search catalog/catalog.json and candidate metadata by category, objective, and tags.
2. Read asset.json and README; report its candidate/approved status accurately.
3. If previewImage is present, retrieve that actual file. Check version/capture
   evidence in the review record before claiming it represents current source.
4. If missing, render the entrypoint using an available browser and capture a
   documented state. Do not modify source solely to manufacture a desired result.
5. Return the image when supported, its asset ID/version, and a concise description.
6. If retrieval/rendering is unavailable, provide the existing source location and
   explain that no preview could be shown. Never invent a hosted image URL.

Suggested request: “Find a surveying asset for differential leveling, show its
actual preview if available, and explain its assumptions and review status.”
