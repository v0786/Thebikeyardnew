import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, MessageCircle, Phone } from 'lucide-react';
import { whatsAppLink, telLink } from '../lib/whatsapp';
import { formatInr } from '../lib/currency';
import type { Motorcycle } from '../types';
import './showroom-hero.css';

const spotlights = [
  { id: 'bike-re-hunter-350', image: 'hunter_red_bike_1793848015303.jpg', tint: '#ff4c66', mood: 'Street character' },
  { id: 'bike-triumph-speed-400', image: 'bike_speed400_blue_1793847681418.jpg', tint: '#58abff', mood: 'Modern classic' },
  { id: 'bike-ktm-duke-390', image: 'bike_duke390_blue_1793847713369.jpg', tint: '#ff9a4a', mood: 'Street performance' },
];

interface ShowroomHeroProps {
  bikes: Motorcycle[];
  inStockTotal: number;
  phone: string;
  onExploreClick: () => void;
  onTestRideClick: (bike: Motorcycle | null) => void;
  onEmiClick: () => void;
}

export function ShowroomHero({ bikes, inStockTotal, phone, onExploreClick, onTestRideClick, onEmiClick }: ShowroomHeroProps) {
  const lineup = spotlights.flatMap((feature) => {
    const bike = bikes.find((item) => item.id === feature.id);
    return bike ? [{ ...feature, bike }] : [];
  });
  const [index, setIndex] = useState(0);
  const feature = lineup[index] ?? lineup[0];
  const bike = feature?.bike;
  const move = (step: number) => setIndex((current) => (current + step + lineup.length) % lineup.length);
  const image = feature?.image ?? 'hero_motorcycle_showroom_1793817699343.jpg';

  return (
    <section className="yard-stage" aria-label="The Bike Yard showroom spotlight" style={{ '--stage-tint': feature?.tint ?? '#ff4c66' } as CSSProperties}>
      <div className="yard-stage-inner">
        <div className="yard-stage-top">
          <span><i /> DIGITAL SHOWROOM / THANE</span>
          <span>KHOPAT · MH-04</span>
        </div>
        <div className="yard-stage-main">
          <div className="yard-stage-copy">
            <p className="yard-stage-kicker">THE BIKE YARD / MOTORCYCLES</p>
            <h1>Find your<br /><em>next ride.</em></h1>
            <p className="yard-stage-intro">Explore the Khopat showroom, compare on-road estimates and find the motorcycle you want to take out for a test ride.</p>
            <button type="button" className="yard-stage-cta" onClick={onExploreClick}>Explore motorcycles <ArrowRight size={17} aria-hidden="true" /></button>
          </div>
          <div className="yard-stage-media" key={image}>
            <div className="yard-stage-photo">
              <img src={`/assets/images/${image}`} alt={bike ? `${bike.brand} ${bike.model}` : 'The Bike Yard showroom'} fetchPriority="high" />
            </div>
            <span className="yard-stage-caption"><i /> {feature?.mood ?? 'Showroom floor'}</span>
          </div>
          {bike && (
            <div className="yard-stage-spec" aria-live="polite">
              <p className="yard-stage-kicker">IN THE SPOTLIGHT</p>
              <p className="yard-stage-model">{bike.brand}<strong>{bike.model}</strong></p>
              <dl>
                <div><dt>Engine</dt><dd>{bike.engineCc} cc</dd></div>
                <div><dt>Peak power</dt><dd>{bike.powerBhp} bhp</dd></div>
                <div><dt>Demo ex-showroom</dt><dd>{formatInr(bike.exShowroomPaise)}</dd></div>
              </dl>
              <Link to={`/bike/${bike.id}`} className="yard-stage-link">View motorcycle <ArrowUpRight size={15} aria-hidden="true" /></Link>
            </div>
          )}
        </div>

        <div className="yard-stage-footer">
          {lineup.length > 1 && (
            <div className="yard-stage-selector" role="group" aria-label="Select a featured motorcycle">
              <button type="button" onClick={() => move(-1)} aria-label="Previous featured motorcycle"><ChevronLeft size={18} aria-hidden="true" /></button>
              <div className="yard-stage-options">
                {lineup.map(({ bike: item }, i) => (
                  <button type="button" key={item.id} aria-pressed={item.id === bike?.id} onClick={() => setIndex(i)}>
                    <small>{String(i + 1).padStart(2, '0')}</small>{item.model}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => move(1)} aria-label="Next featured motorcycle"><ChevronRight size={18} aria-hidden="true" /></button>
            </div>
          )}
          <div className="yard-stage-actions">
            <button type="button" onClick={() => onTestRideClick(bike ?? null)}>Book test ride</button>
            <button type="button" onClick={onEmiClick}>Calculate EMI</button>
            <a href={whatsAppLink(phone, 'Hi The Bike Yard! I would like to enquire about a motorcycle.')} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"><MessageCircle size={17} aria-hidden="true" /></a>
            <a href={telLink(phone)} aria-label="Call the showroom"><Phone size={17} aria-hidden="true" /></a>
          </div>
        </div>
        <div className="yard-stage-meta">{inStockTotal} READY IN DEMO INVENTORY <span>NEW & CERTIFIED PRE-OWNED</span></div>
      </div>
    </section>
  );
}
