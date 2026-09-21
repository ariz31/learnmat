# Review — geo-open-channel

## Engineering review

Reference state: b = 3 m, y = 1.2 m, Q = 4 m³/s, S = 0.0015, n = 0.015, g = 9.81 m/s².

- A = 3.6 m²; P = 5.4 m; R = 0.6667 m.
- V = 1.1111 m/s.
- Fr = V/√(gy) ≈ 0.324, therefore subcritical.
- E = y + V²/(2g) ≈ 1.263 m.
- Manning capacity at the specified depth is about 6.59 m³/s.

The visual and copy explicitly avoid describing the supplied depth as a computed normal depth.

## Robustness

Zero discharge is supported. Negative discharge/slope and non-positive width/depth/n/gravity are rejected. Bed slope may be zero, producing zero Manning capacity without division errors in the displayed ratio.

## Accessibility / visual review

The SVG exposes the depth, Froude number, and regime in its accessible label. Demo controls are native labelled inputs. Live browser and assistive-technology review were unavailable, so this remains a candidate asset.
