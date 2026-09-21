# Parametric reinforcement cage

Status: candidate.

## Learning objective

Show how section size, clear cover, tie diameter, longitudinal-bar diameter, perimeter bar counts, and requested maximum tie spacing determine a rectangular RC cage.

## Model and assumptions

Clear cover is defined explicitly as the distance from the concrete face to the **outer surface of the transverse tie**.

- Tie centerline inset = clear cover + tie diameter / 2.
- Longitudinal-bar centerline inset = clear cover + tie diameter + longitudinal-bar diameter / 2.
- Top/bottom faces each contain `barsAlongWidth` bars including corners.
- Side faces each contain `barsAlongDepth` bars including corners; corner duplicates are removed.
- End tie centerlines use the same tie centerline inset from the member ends.
- The number of tie intervals is `ceil(available cage height / maxTieSpacingM)`, so calculated actual spacing is never greater than the requested maximum.

The model is for **detailing geometry only**. It does not determine whether the layout complies with ACI, NSCP, Eurocode, or any other design code; it does not evaluate reinforcement ratio, confinement, seismic detailing, development length, lap splices, or strength.

## Usage

Use `demo/index.html` or import `src/asset.mjs`. All API dimensions use metres.

Invalid cross-parameter geometry—such as cover plus diameters leaving no interior cage—is rejected before state mutation.

## Reuse and rights

Original repository contribution under the root MIT license. No external dependencies or third-party assets.

## Review evidence

See `REVIEW.md` and `checks/analytical.md`. Live browser screenshot and assistive-technology execution remain for independent review.

## Change history

- 0.1.0 — Initial reinforcement-cage detailing geometry.
