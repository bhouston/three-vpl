import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
export default function DemoPage() {
 return <Layout title="Live demo" description="Explore virtual point light illumination in a WebGPU room"><main className="demo-page"><span className="eyebrow">INTERACTIVE LIGHT STUDY</span><h1>Follow the bounce.</h1><p>Compare direct light with diffuse interreflection. Drag to orbit; scroll to zoom.</p><BrowserOnly fallback={<div className="demo-placeholder">Preparing interactive demo…</div>}>{() => {const Demo = require('../components/VPLDemo').default; return <Demo/>;}}</BrowserOnly><p className="demo-note">Procedural scene · No downloaded models · WebGPU hardware required. Changing quality rebuilds samples and visibility maps; large budgets may take a moment.</p></main></Layout>;
}
