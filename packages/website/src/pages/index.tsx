import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
export default function Home() {
  return (
    <Layout title="Let light bounce" description="Virtual point light global illumination for Three.js WebGPU">
      <main>
        <section className="hero-vpl">
          <div className="hero-copy">
            <span className="eyebrow">THREE.JS · WEBGPU · GLOBAL ILLUMINATION</span>
            <h1>
              Let light
              <br />
              <em>bounce.</em>
            </h1>
            <p>
              Bring the color of a room into its shadows.
              <br />
              Diffuse indirect illumination through virtual point lights.
            </p>
            <div className="hero-actions">
              <Link className="button button--primary button--lg" to="/demo">
                Explore the live demo ↗
              </Link>
              <Link className="button button--secondary button--lg" to="/docs/getting-started">
                Start building
              </Link>
            </div>
            <code>npm install three-vpl three</code>
          </div>
          <figure
            className="light-study"
            aria-label="Abstract illustration of red and green light reflecting inside a room"
          >
            <div className="study-box box-one" />
            <div className="study-box box-two" />
            <div className="study-light" />
            <span>01 / A STUDY IN BOUNCED LIGHT</span>
          </figure>
        </section>
        <section className="feature-grid">
          <article>
            <span>01 — TRANSPORT</span>
            <h2>Beyond direct light.</h2>
            <p>Sample diffuse reflections and carry surface color into the surrounding scene.</p>
          </article>
          <article>
            <span>02 — CONTROL</span>
            <h2>A budget you choose.</h2>
            <p>Adjust emitters, bounces and visibility resolution to suit the scene and device.</p>
          </article>
          <article>
            <span>03 — UNDERSTAND</span>
            <h2>Research, in reach.</h2>
            <p>Built on the idea of instant radiosity, with documented APIs and visible tradeoffs.</p>
            <Link to="/docs/research">Read the background →</Link>
          </article>
        </section>
      </main>
    </Layout>
  );
}
