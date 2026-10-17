---
sidebar_position: 3
title: Research background
---
# From instant radiosity to virtual point lights

Alexander Keller introduced **Instant Radiosity** at SIGGRAPH 1997. The method traces light paths and replaces sampled surface interactions with virtual light sources. Rendering the contributions of these sources approximates indirect illumination using many simpler lighting evaluations.

three-vpl follows this broad idea: generate diffuse surface samples, store their position, orientation and flux, then evaluate the resulting virtual emitters in a Three.js node material. Multiple diffuse bounce depths share a bounded emitter budget. Its sampling and rendering choices are engineering approximations; this package is not a reference implementation of every technique below.

## Primary sources

1. **Alexander Keller. [Instant Radiosity](https://doi.org/10.1145/258734.258769).** SIGGRAPH 1997, pp. 49–56. The foundational virtual-light formulation.
2. **Carsten Dachsbacher and Marc Stamminger. [Reflective Shadow Maps](https://doi.org/10.1145/1053427.1053460).** Symposium on Interactive 3D Graphics and Games, 2005. Related work that represents illuminated surface samples as indirect sources. three-vpl traces samples on the CPU rather than generating them from reflective shadow maps.

## Practical interpretation

A virtual emitter is a sample of reflected energy, not a new physical lamp. Increasing the budget improves the sampling of the indirect field, but does not guarantee convergence to an unbiased reference: distance clamps and finite visibility maps remain approximations. Evaluate quality with your scene's geometry and light distribution. No universal performance or quality claim is implied by the demo.
