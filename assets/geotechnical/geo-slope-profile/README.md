# Slope profile — surveying-grade 3D rebuild

The scoped planar infinite-slope model remains the sole engineering calculation. The primary renderer is now a real Three.js terrain wedge preserving the analytical H:run slope angle, with a translucent planar representative slice, downslope and normal force cues, pore-pressure markers, spatial depth, occlusion and classroom camera framing.

The amber plane is explicitly **not** a circular slip surface. It represents the planar unit-area slice used by the existing model. Vector lengths, terrain size and marker motion are presentation-normalized; β, stresses, resistance and factor of safety remain exact model outputs.

The four-step demo teaches geometry, scope, stress resolution and the model factor of safety. It deliberately reports the FS without making a safe/unsafe judgment.
