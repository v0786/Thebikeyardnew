import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Pause, Play, RotateCcw, MoveHorizontal } from 'lucide-react';
import { frameUrl, wrapFrame, type TurntableMedia } from '../data/showroom-media';

interface BikeTurntableProps {
  media?: TurntableMedia;
  image: string;
  label: string;
}

export function BikeTurntable({ media, image, label }: BikeTurntableProps) {
  const [frame, setFrame] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; frame: number } | null>(null);
  const ready = !!media && loaded === media.frameCount && !failed;

  useEffect(() => {
    if (!media) return;
    let active = true;
    const frames: HTMLImageElement[] = [];
    for (let i = 0; i < media.frameCount; i++) {
      const img = new Image();
      frames.push(img);
      img.onload = () => { if (active) setLoaded((n) => n + 1); };
      img.onerror = () => { if (active) { setFailed(true); setPlaying(false); } };
      img.src = frameUrl(media, i);
    }
    return () => { active = false; frames.forEach((img) => { img.onload = null; img.onerror = null; }); };
  }, [media, retry]);

  useEffect(() => {
    if (!playing || !ready || !media) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setFrame((n) => wrapFrame(n + 1, media.frameCount));
    }, 110);
    return () => window.clearInterval(timer);
  }, [playing, ready, media]);

  const rotate = (step: number) => {
    if (!ready || !media) return;
    setPlaying(false);
    setFrame((n) => wrapFrame(n + step, media.frameCount));
  };
  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!ready || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, frame };
    setDragging(true);
    setPlaying(false);
  };
  const pointerEnd = () => { drag.current = null; setDragging(false); };

  return (
    <div className="garage-turntable">
      <div className="garage-spotlight garage-spotlight-left" aria-hidden="true" />
      <div className="garage-spotlight garage-spotlight-right" aria-hidden="true" />
      <div className="garage-platform" aria-hidden="true"><div /></div>
      <div
        className={`garage-viewport ${media ? 'has-turntable' : 'photo-view'} ${dragging ? 'is-dragging' : ''} ${zoom ? 'is-zoomed' : ''}`}
        role={media ? 'slider' : 'img'}
        tabIndex={media ? 0 : undefined}
        aria-label={media ? `${label}. Drag horizontally or use arrow keys to rotate` : label}
        aria-valuemin={media ? 0 : undefined}
        aria-valuemax={media ? 350 : undefined}
        aria-valuenow={media ? Math.round(frame * 360 / media.frameCount) : undefined}
        aria-valuetext={media ? `${Math.round(frame * 360 / media.frameCount)} degrees` : undefined}
        aria-disabled={media ? !ready : undefined}
        aria-describedby="garage-rotation-help"
        onPointerDown={pointerDown}
        onPointerMove={(event) => {
          if (!drag.current || !media || !ready) return;
          const pixelsPerFrame = Math.max(6, event.currentTarget.clientWidth / media.frameCount / 1.7);
          setFrame(wrapFrame(drag.current.frame - Math.round((event.clientX - drag.current.x) / pixelsPerFrame), media.frameCount));
        }}
        onPointerUp={pointerEnd}
        onPointerCancel={pointerEnd}
        onLostPointerCapture={pointerEnd}
        onKeyDown={(event) => {
          if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
            event.preventDefault();
            if (event.key === 'Home' && ready) { setFrame(0); setPlaying(false); }
            else if (event.key === 'End' && ready && media) { setFrame(media.frameCount - 1); setPlaying(false); }
            else rotate(event.key === 'ArrowLeft' ? -1 : 1);
          }
        }}
      >
        <img
          className="garage-bike-image"
          src={media && !failed ? frameUrl(media, frame) : image}
          alt=""
          draggable={false}
          fetchPriority="high"
          onError={() => { if (media) setFailed(true); }}
        />
      </div>
      <div className="garage-view-caption">
        <span className="garage-view-badge">{media && !failed ? '360° TURNTABLE' : 'PHOTO VIEW'}</span>
        <span id="garage-rotation-help">
          {failed ? 'Turntable unavailable. Photo shown.' : media ? ready ? 'Drag to explore every angle' : `Preparing view · ${Math.round(loaded / media.frameCount * 100)}%` : 'Studio photo · rotation unavailable for this model'}
        </span>
        {failed && <button type="button" onClick={() => { setFailed(false); setLoaded(0); setFrame(0); setRetry((n) => n + 1); }}>Retry view</button>}
      </div>
      <div className="garage-view-controls" role="group" aria-label="Bike view controls">
        {media && <>
          <button type="button" aria-label="Rotate bike left" disabled={!ready} onClick={() => rotate(-3)}><ChevronLeft size={16} /></button>
          <button type="button" aria-label={playing ? 'Pause bike rotation' : 'Auto rotate bike'} aria-pressed={playing} disabled={!ready} onClick={() => setPlaying(!playing)}>{playing ? <Pause size={15} /> : <Play size={15} />}</button>
          <button type="button" aria-label="Rotate bike right" disabled={!ready} onClick={() => rotate(3)}><ChevronRight size={16} /></button>
          <span className="garage-angle">{String(frame * 10).padStart(3, '0')}°</span>
          <button type="button" aria-label="Reset bike view" disabled={!ready} onClick={() => { setFrame(0); setPlaying(false); setZoom(false); }}><RotateCcw size={15} /></button>
        </>}
        <button type="button" aria-label={zoom ? 'Zoom out bike' : 'Zoom in bike'} aria-pressed={zoom} onClick={() => setZoom(!zoom)}>{zoom ? <Minimize2 size={15} /> : <Maximize2 size={15} />}</button>
      </div>
      {ready && <div className="garage-drag-mark" aria-hidden="true"><MoveHorizontal size={20} /><span>DRAG TO ROTATE</span></div>}
    </div>
  );
}
