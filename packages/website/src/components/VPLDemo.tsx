import React, {useEffect, useRef, useState} from 'react';
export default function VPLDemo() {
 const host = useRef<HTMLDivElement>(null);
 const change = useRef<(value: {mode: string; count: number; bounces: number}) => void>();
 const [mode, setMode] = useState('combined');
 const [count, setCount] = useState(64);
 const [bounces, setBounces] = useState(2);
 const [status, setStatus] = useState('Checking WebGPU support…');
 const [ready, setReady] = useState(false);
 useEffect(() => {
  let cancelled = false;
  let cleanup = () => {};
  (async () => {
   const [{createDemo}] = await Promise.all([import('./createDemo')]);
   if (cancelled) return;
   const result = await createDemo(host.current!, (message) => {if (!cancelled) setStatus(message);});
   if (cancelled) {result.dispose(); return;}
   cleanup = result.dispose;
   change.current = result.update;
   setReady(true); setStatus('Drag to orbit · Scroll to zoom');
  })().catch(error => {if (!cancelled) setStatus(`Rendering unavailable: ${error.message}`);});
  return () => {cancelled = true; cleanup(); change.current = undefined;};
 }, []);
 useEffect(() => {change.current?.({mode, count, bounces});}, [mode, count, bounces, ready]);
 return <><div className="demo-controls"><label>Lighting<select value={mode} disabled={!ready} onChange={e => setMode(e.target.value)}><option value="combined">Combined</option><option value="direct">Direct only</option><option value="indirect">Indirect only</option></select></label><label>VPL budget<select value={count} disabled={!ready} onChange={e => setCount(Number(e.target.value))}>{[32,64,128,256].map(n => <option key={n}>{n}</option>)}</select></label><label>Diffuse bounces<select value={bounces} disabled={!ready} onChange={e => setBounces(Number(e.target.value))}>{[1,2,3,4].map(n => <option key={n}>{n}</option>)}</select></label></div><div className="demo-canvas" ref={host}/><div role="status" className="demo-status">{status}</div></>;
}
