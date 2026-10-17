---
sidebar_position: 1
title: Overview
---
# Indirect light, made tangible

**three-vpl** brings virtual point light global illumination to Three.js WebGPU. It samples diffuse light transport on the CPU, places virtual emitters at surface interactions, and evaluates their contribution through Three.js Shader Language (TSL).

Colored walls bleed into neighboring surfaces. Shadows gain bounced illumination. Emissive surfaces can contribute to the room around them. The [live demo](../demo) lets you isolate direct and indirect light to see the difference.

This is an independent project extracted from [Three.js PR #34915](https://github.com/mrdoob/three.js/pull/34915), not an official Three.js feature.

## Why virtual point lights?

- **A familiar rendering model.** Approximate diffuse interreflection with a finite collection of lights.
- **Explicit quality controls.** Trade the virtual light budget, bounce depth, and visibility-map resolution against generation time, GPU work, and memory.
- **Inspectable light transport.** Visualize the virtual emitters and examine the indirect contribution separately.
- **WebGPU integration.** Use node materials and TSL alongside your existing Three.js scene.

## Boundaries of the approximation

VPLs approximate diffuse transport; this is not a general path tracer. Sparse sampling can produce uneven illumination, and near-field singularities need distance clamping, which removes energy. Visibility maps consume memory and rendering work; reducing their resolution can introduce leaks and shadow artifacts. More lights and bounces cost more. Changed geometry, materials, or sources require regeneration and visibility-map updates. Reflective and refractive caustics are outside the method's intended scope.

See [the research background](./research) and [getting started](./getting-started) before integrating it into a production scene.
