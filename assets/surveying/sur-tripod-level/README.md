# 3D Surveying Tripod and Level

Status: in-review. Version 0.2.0 replaces the schematic SVG with a real procedural Three.js instrument.

## Learning objective
Identify the tripod, tribrach/leveling screws, instrument body, telescope, objective, eyepiece, focus knob, bubble element, instrument height, and spatial sight axis. Connect surveying azimuth/elevation inputs to the actual 3D sight direction.

## Model
Optical-axis origin is **(0, instrumentHeight, 0)**. With azimuth A clockwise from north (-Z) and sight elevation e, the unit direction remains **(cos e sin A, sin e, -cos e cos A)**. A=0° points north; A=90° points east.

## 3D implementation
The tripod has three real volumetric legs positioned from the current spread. The level is assembled from metal/plastic/glass procedural meshes, with a dashed 3D sight ray and target cone. Camera presets make the elevation and plan relationships directly inspectable.

The component requires host-supplied Three.js and scene; the host owns camera/renderer/clock. Demo pins Three.js 0.185.1 and supplies orbit/pan/zoom, PBR lighting, shadows, ground, grid, focus mode and responsive presentation.

## Rights
Original procedural geometry only; no images or downloaded 3D models.

## Review evidence
Live rendered/browser evidence remains pending; the former SVG is not referenced as the upgraded preview.

## Change history
- 0.2.0 — Detailed Three.js tripod/level, volumetric parts and true 3D sight vector.
- 0.1.0 — SVG schematic.
