import React, {lazy, Suspense} from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
const Demo = lazy(() => import('../components/VPLDemo'));
export default function DemoPage() {
 return <Layout title="Live demo" description="Explore virtual point light illumination in a WebGPU room"><main className="demo-page"><span className="eyebrow">INTERACTIVE LIGHT STUDY</span><h1>Follow the bounce.</h1><p>Compare direct light with diffuse interreflection. Drag to orbit; scroll to zoom.</p><BrowserOnly fallback={<div className="demo-placeholder">Preparing interactive demo…</div>}>{() => <Suspense fallback={<div className="demo-placeholder">Loading demo…</div>}><Demo/></Suspense>}</BrowserOnly><p className="demo-note">Procedural scene · No downloaded models · WebGPU hardware required. Changing quality rebuilds samples and visibility maps; large budgets may take a moment.</p></main></Layout>;
}

