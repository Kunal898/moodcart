import { Zap, Sparkles, ShieldCheck, HeartHandshake } from 'lucide-react';

const PERKS = [
  {
    id: 'express',
    icon: Zap,
    title: 'Express 2-Day Delivery',
    subtitle: 'Free on all orders over ₹999 across India',
    badge: 'FAST',
    gradient: 'linear-gradient(135deg, rgba(239, 246, 255, 0.85) 0%, rgba(219, 234, 254, 0.95) 100%)',
    borderColor: 'rgba(191, 219, 254, 0.9)',
    iconColor: '#2563eb',
    iconBg: 'rgba(37, 99, 235, 0.12)',
    badgeBg: '#2563eb',
    badgeColor: '#ffffff',
  },
  {
    id: 'match',
    icon: Sparkles,
    title: '98% Mood Match Accuracy',
    subtitle: 'Algorithm-curated products to elevate your vibe',
    badge: 'AI CURATED',
    badgeColor: '#ffffff',
    gradient: 'linear-gradient(135deg, rgba(245, 243, 255, 0.85) 0%, rgba(237, 233, 254, 0.95) 100%)',
    borderColor: 'rgba(221, 214, 254, 0.9)',
    iconColor: '#7c3aed',
    iconBg: 'rgba(124, 58, 237, 0.12)',
    badgeBg: '#7c3aed',
  },
  {
    id: 'artisan',
    icon: HeartHandshake,
    title: '100% Mindful & Verified',
    subtitle: 'Ethically sourced artisan & premium materials',
    badge: 'GENUINE',
    gradient: 'linear-gradient(135deg, rgba(236, 253, 245, 0.85) 0%, rgba(209, 250, 229, 0.95) 100%)',
    borderColor: 'rgba(167, 243, 208, 0.9)',
    iconColor: '#059669',
    iconBg: 'rgba(5, 150, 105, 0.12)',
    badgeBg: '#059669',
    badgeColor: '#ffffff',
  },
  {
    id: 'guarantee',
    icon: ShieldCheck,
    title: 'MoodCart Promise',
    subtitle: '7-day hassle-free returns & instant refunds',
    badge: 'ASSURED',
    gradient: 'linear-gradient(135deg, rgba(255, 251, 235, 0.85) 0%, rgba(254, 243, 199, 0.95) 100%)',
    borderColor: 'rgba(253, 230, 138, 0.9)',
    iconColor: '#d97706',
    iconBg: 'rgba(217, 119, 6, 0.12)',
    badgeBg: '#d97706',
    badgeColor: '#ffffff',
  },
];

export default function TrustPerksBar() {
  return (
    <div className="trust-perks-wrapper">
      <div className="trust-perks-grid">
        {PERKS.map((perk) => {
          const IconComponent = perk.icon;
          return (
            <div
              key={perk.id}
              className="trust-perk-card"
              style={{
                background: perk.gradient,
                borderColor: perk.borderColor,
              }}
            >
              <div
                className="trust-perk-icon-wrap"
                style={{
                  backgroundColor: perk.iconBg,
                  color: perk.iconColor,
                }}
              >
                <IconComponent size={22} className="trust-perk-icon" />
              </div>
              <div className="trust-perk-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                  <h4 className="trust-perk-title">{perk.title}</h4>
                  <span
                    className="trust-perk-badge"
                    style={{
                      backgroundColor: perk.badgeBg,
                      color: perk.badgeColor,
                    }}
                  >
                    {perk.badge}
                  </span>
                </div>
                <p className="trust-perk-desc">{perk.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
