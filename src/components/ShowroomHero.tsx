import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, MessageCircle, Phone, Gauge, Layers } from 'lucide-react';
import { whatsAppLink, telLink } from '../lib/whatsapp';
import { formatInr } from '../lib/currency';
import type { Motorcycle } from '../types';
import { SHOWROOM_MEDIA, showroomColor, frameUrl } from '../data/showroom-media';
import { BikeTurntable } from './BikeTurntable';
import './showroom-hero.css';

const curatedIds = ['bike-re-hunter-350', 'bike-re-himalayan-450', 'bike-triumph-speed-400', 'bike-ktm-duke-390'];
const accents: Record<string, string> = {
  'bike-re-hunter-350': '#b8ea81',
  'bike-re-himalayan-450': '#d7c1a1',
  'bike-triumph-speed-400': '#92bfff',
  'bike-ktm-duke-390': '#ff9b62',
};

interface ShowroomHeroProps {
  bikes: Motorcycle[];
  inStockTotal: number;
  phone: string;
  selectedBikeId?: string;
  onSelectBike: (bike: Motorcycle) => void;
  onExploreClick: () => void;
  onTestRideClick: (bike: Motorcycle | null) => void;
  onEmiClick: () => void;
}

export function ShowroomHero({ bikes, inStockTotal, phone, selectedBikeId, onSelectBike, onExploreClick, onTestRideClick, onEmiClick }: ShowroomHeroProps) {
  const lineup = [...bikes].sort((a, b) => {
    const ai = curatedIds.indexOf(a.id), bi = curatedIds.indexOf(b.id);
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
  });
  const [localId, setLocalId] = useState(lineup[0]?.id);
  const [colorChoices, setColorChoices] = useState<Record<string, string>>({});
  const [direction, setDirection] = useState(1);
  const selectedIndex = lineup.findIndex((item) => item.id === (selectedBikeId ?? localId));
  const index = Math.max(0, selectedIndex);
  const bike = lineup[index];
  const colorName = bike ? colorChoices[bike.id] ?? showroomColor(bike) : '';
  const selectedColor = bike?.availableColors.find((color) => color.name === colorName);
  const media = bike ? SHOWROOM_MEDIA[bike.id]?.[colorName] : undefined;
  const image = selectedColor?.image ?? bike?.images?.[colorName] ?? bike?.image ?? '';
  const activeBike = bike ? { ...bike, selectedColor: colorName, image } : null;
  const tint = bike ? accents[bike.id] ?? '#b8ea81' : '#b8ea81';

  const choose = (next: number) => {
    if (!lineup.length) return;
    const target = (next + lineup.length) % lineup.length;
    const item = lineup[target];
    const color = colorChoices[item.id] ?? showroomColor(item);
    setDirection(target >= index ? 1 : -1);
    setLocalId(item.id);
    onSelectBike({ ...item, selectedColor: color, image: item.availableColors.find((c) => c.name === color)?.image ?? item.image });
  };
  const chooseColor = (name: string) => {
    if (!bike) return;
    const color = bike.availableColors.find((item) => item.name === name);
    setColorChoices((previous) => ({ ...previous, [bike.id]: name }));
    onSelectBike({ ...bike, selectedColor: name, image: color?.image ?? bike.image });
  };

  if (!bike || !activeBike) return (
    <section className="yard-stage garage-empty"><h1>Your next ride starts here.</h1><p>Our motorcycle collection is being updated.</p><button type="button" onClick={onExploreClick}>Explore the showroom <ArrowRight size={16} /></button></section>
  );

  return (
    <section className="yard-stage" aria-label="Interactive motorcycle selection showroom" style={{ '--stage-tint': tint, '--slide-direction': direction } as CSSProperties}>
      <div className="yard-stage-inner">
        <div className="garage-topline">
          <span><i /> THE BIKE YARD <b>/</b> DIGITAL GARAGE</span>
          <span className="garage-location">KHOPAT, THANE <span>MH—04</span></span>
        </div>
        <div className="garage-heading-row">
          <div><p className="garage-eyebrow">YOUR RIDE. YOUR RULES.</p><h1>Choose your machine<span>.</span></h1></div>
          <p>Find your favourite.<br />Take a closer look. Make it yours.</p>
        </div>

        <div className="garage-stage-grid">
          <div className="garage-bike-identity" key={`name-${bike.id}`}>
            <span className="garage-category"><Layers size={12} /> {bike.category}</span>
            <p className="garage-brand">{bike.brand}</p>
            <h2>{bike.model}</h2>
            <p className="garage-variant">{bike.variant}</p>
            <div className="garage-price"><small>DEMO EX-SHOWROOM</small><strong>{formatInr(bike.exShowroomPaise)}</strong><span>On-road breakdown on bike details</span></div>
            <Link className="garage-primary" to={`/bike/${bike.id}`}>Explore this bike <ArrowUpRight size={17} /></Link>
            <button className="garage-text-link" type="button" onClick={onExploreClick}>Browse all motorcycles <ArrowRight size={14} /></button>
          </div>

          <div className="garage-centre">
            <span className="garage-backdrop-word" aria-hidden="true">{bike.model.replace(/\s*\(.*\)/, '').replace(/\s\d+/, '')}</span>
            <div className="garage-stage-animation" key={bike.id}>
              <BikeTurntable key={`${bike.id}-${colorName}`} media={media} image={image} label={`${bike.brand} ${bike.model}, ${colorName}`} />
            </div>
            <div className="garage-color-row" role="group" aria-label="Choose bike colour">
              <span>FINISH <strong>{colorName}</strong></span>
              <div>{bike.availableColors.map((color) => (
                <button key={color.name} type="button" className="garage-swatch" aria-label={color.name} aria-pressed={colorName === color.name} title={color.name} onClick={() => chooseColor(color.name)} style={{ '--swatch-color': color.hex } as CSSProperties}><span /></button>
              ))}</div>
            </div>
          </div>

          <div className="garage-spec-panel" aria-live="polite" aria-atomic="true">
            <span className="garage-spec-label"><Gauge size={13} /> MACHINE SPECS</span>
            <dl>
              <div><dt>ENGINE</dt><dd>{bike.engineCc}<small>cc</small></dd><span className="garage-spec-track"><i style={{ width: `${Math.min(bike.engineCc / 650 * 100, 100)}%` }} /></span></div>
              <div><dt>POWER</dt><dd>{bike.powerBhp}<small>bhp</small></dd><span className="garage-spec-track"><i style={{ width: `${Math.min(bike.powerBhp / 60 * 100, 100)}%` }} /></span></div>
              <div><dt>TORQUE</dt><dd>{bike.torqueNm}<small>Nm</small></dd><span className="garage-spec-track"><i style={{ width: `${Math.min(bike.torqueNm / 60 * 100, 100)}%` }} /></span></div>
            </dl>
            <span className="garage-stock">{bike.inStockCount > 0 ? `${bike.inStockCount} in demo inventory` : 'Ask about availability'}</span>
          </div>
        </div>

        <div className="garage-selection-heading"><span>SELECT YOUR RIDE</span><span><strong>{String(index + 1).padStart(2, '0')}</strong> / {String(lineup.length).padStart(2, '0')}</span></div>
        <div className="garage-lineup-row">
          <button type="button" className="garage-nav" onClick={() => choose(index - 1)} disabled={lineup.length < 2} aria-label="Previous motorcycle"><ChevronLeft size={22} /></button>
          <div className="garage-lineup" role="group" aria-label="Select motorcycle">
            {lineup.map((item, i) => {
              const previewColor = colorChoices[item.id] ?? showroomColor(item);
              const previewMedia = SHOWROOM_MEDIA[item.id]?.[previewColor];
              return (
                <button type="button" key={item.id} aria-pressed={item.id === bike.id} className="garage-bike-card" onClick={(event) => { choose(i); event.currentTarget.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest', inline: 'nearest' }); }}>
                  <span className="garage-card-number">{String(i + 1).padStart(2, '0')}</span>
                  <img src={previewMedia ? frameUrl(previewMedia, 0) : item.image} alt="" loading="lazy" />
                  <span className="garage-card-label"><small>{item.brand}</small><strong>{item.model}</strong></span>
                  {previewMedia && <span className="garage-card-360">360°</span>}
                </button>
              );
            })}
          </div>
          <button type="button" className="garage-nav" onClick={() => choose(index + 1)} disabled={lineup.length < 2} aria-label="Next motorcycle"><ChevronRight size={22} /></button>
        </div>

        <div className="garage-bottom-bar">
          <span className="garage-bottom-note">{media ? 'A CLOSER LOOK. A BETTER CHOICE.' : 'FIND THE ONE THAT MOVES YOU.'}<small>{inStockTotal} motorcycles in demo inventory</small></span>
          <div className="garage-actions">
            <button type="button" onClick={() => { onSelectBike(activeBike); onEmiClick(); }}>Calculate EMI <ArrowUpRight size={14} /></button>
            <button type="button" className="garage-book" onClick={() => { onSelectBike(activeBike); onTestRideClick(activeBike); }}>Book a test ride <ArrowRight size={16} /></button>
            <a href={whatsAppLink(phone, `Hi The Bike Yard! I would like to enquire about the ${bike.brand} ${bike.model} in ${colorName}.`)} target="_blank" rel="noopener noreferrer" aria-label="Enquire about selected bike on WhatsApp"><MessageCircle size={17} /></a>
            <a href={telLink(phone)} aria-label="Call the showroom"><Phone size={17} /></a>
          </div>
        </div>
      </div>
    </section>
  );
}
