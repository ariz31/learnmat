# Invariants

- Observer is fixed at (0,0,0).
- Target is fixed on the reference line at (0,0,-sightDistance).
- Rod base is (crossTrackOffset,0,-rodStationDistance).
- Cross-track error is `abs(crossTrackOffset)`.
- Alignment is true exactly when cross-track error is less than or equal to alignment tolerance.
- `rodStationDistance < sightDistance` is enforced before replacing state.
- Rod top is directly above its base at +Y = rodHeight.
