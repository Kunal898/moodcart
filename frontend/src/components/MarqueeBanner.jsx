import { Link } from 'react-router-dom';
import { Sparkles, Truck, ShieldCheck, Heart, Zap, Flame } from 'lucide-react';

export default function MarqueeBanner() {
  const tickerItems = [
    { icon: Sparkles, text: '96% MOOD MATCH GUARANTEE', link: '/find-mood' },
    { icon: Truck, text: 'FREE EXPRESS SHIPPING ON ORDERS OVER ₹999', link: '/products' },
    { icon: Zap, text: 'NEW ARRIVALS: 50+ CURATED MOOD DROPS', link: '/products' },
    { icon: Flame, text: 'WEEKEND PARTY VIBE COLLECTION AT UP TO 30% OFF', link: '/products?mood=party' },
    { icon: ShieldCheck, text: '100% SECURE CHECKOUT & VERIFIED AUTHENTICITY', link: '/about' },
    { icon: Heart, text: 'SHOP MINDFULLY ACCORDING TO HOW YOU FEEL', link: '/products?mood=relaxed' },
  ];

  return (
    <div className="marquee-wrapper">
      <div className="marquee-track">
        {/* Render twice for continuous infinite seamless loop */}
        {[...tickerItems, ...tickerItems].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link key={idx} to={item.link} className="marquee-item">
              <Icon size={14} className="marquee-icon" />
              <span>{item.text}</span>
              <span className="marquee-dot">•</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
