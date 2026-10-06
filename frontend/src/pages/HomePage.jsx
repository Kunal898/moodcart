import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductList from '../components/ProductList';
import ProductCard from '../components/ProductCard';
import CategoriesBar from '../components/CategoriesBar';
import HeroSlider from '../components/HeroSlider';
import MarqueeBanner from '../components/MarqueeBanner';
import TrustPerksBar from '../components/TrustPerksBar';
import { getProducts } from '../services/productService';
import { MOODS, getDailyVibe, MOOD_JOURNEY_OPTIONS } from '../utils/moodLogic';
import { Sparkles, ArrowRight, ChevronRight, Zap, Flame, Compass, RefreshCw } from 'lucide-react';

export default function HomePage({ onOpenMoodFinder }) {
  const navigate = useNavigate();

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodProducts, setMoodProducts] = useState([]);
  const [loadingMood, setLoadingMood] = useState(false);

  // Mood Journey state
  const [journeyIdx, setJourneyIdx] = useState(0);

  const dailyVibe = getDailyVibe();
  const currentJourney = MOOD_JOURNEY_OPTIONS[journeyIdx];

  useEffect(() => {
    async function loadInitial() {
      try {
        setLoading(true);
        const { data } = await getProducts();
        setAllProducts(data || []);
      } catch (err) {
        console.error('Failed to load initial products', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  useEffect(() => {
    if (!selectedMood) {
      setMoodProducts([]);
      return;
    }

    async function fetchMoodFiltered() {
      try {
        setLoadingMood(true);
        const { data } = await getProducts({ mood: selectedMood });
        setMoodProducts(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingMood(false);
      }
    }

    fetchMoodFiltered();
  }, [selectedMood]);

  // Featured slices from real products
  const dailyVibeProducts = allProducts.filter((p) => p.mood === dailyVibe.mood).slice(0, 3);
  const journeyProducts = allProducts.filter((p) => p.mood === currentJourney.targetMood).slice(0, 4);
  const recommendedProducts = allProducts.slice(0, 8);

  const heroItem1 = allProducts.find((p) => p.name === 'Mechanical Keyboard' || p.name === 'Tactile Mechanical Keyboard') ||
    allProducts.find((p) => p.mood === 'work') || allProducts[0];
  const heroItem2 = allProducts.find((p) => p.name === 'Scented Candle Set' || p.name === 'Sunset Projection Lamp RGB') ||
    allProducts.find((p) => p.mood === 'relaxed') || allProducts[1];
  const heroMainItem = allProducts.find((p) => p.name === 'Noise-Cancelling Wireless Headphones') ||
    allProducts.find((p) => p.mood === 'happy') || allProducts[2];

  return (
    <div>
      {/* Categories Horizontal Strip (Matching reference mockup below navbar) */}
      <CategoriesBar
        selectedMood={selectedMood}
        onSelectMood={(m) => setSelectedMood((prev) => (prev === m ? null : m))}
      />

      {/* Infinite Continuous Sliding Marquee Ribbon */}
      <MarqueeBanner />

      <div className="container">
        {/* =================================================================
            HERO SECTION (Stacked Side Cards + Sliding Interactive Hero Ad Banner)
            ================================================================= */}
        <section className="hero-layout">
          {/* Left Stacked Side Cards */}
          <div className="hero-side-stack">
            {/* Card 1 - Dark Theme */}
            <div className="hero-side-card hero-side-dark">
              <div>
                <span className="hero-tag hero-tag-new">New</span>
                <h3 className="hero-side-title">{heroItem1?.name || 'Tactile Keyboard'}</h3>
                <p className="hero-side-price">From ₹{Number(heroItem1?.price || 4499).toLocaleString('en-IN')}</p>
              </div>
              <div className="hero-side-img-box">
                <img
                  src={heroItem1?.image_url || 'https://ongnfokecslmatxrdthx.supabase.co/storage/v1/object/public/products/mechanical-keyboard.jpg'}
                  alt={heroItem1?.name || 'Featured product'}
                  className="hero-side-img"
                />
              </div>
              <Link
                to={heroItem1 ? `/products/${heroItem1.id}` : '/products'}
                style={{ fontSize: '0.8rem', fontWeight: '700', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                Shop Work Mode <ChevronRight size={14} />
              </Link>
            </div>

            {/* Card 2 - Mint/Cyan Theme */}
            <div className="hero-side-card hero-side-cyan">
              <div>
                <span className="hero-tag hero-tag-hot">Vibe Pick</span>
                <h3 className="hero-side-title">{heroItem2?.name || 'Scented Candle Set'}</h3>
                <p className="hero-side-price">At ₹{Number(heroItem2?.price || 799).toLocaleString('en-IN')}</p>
              </div>
              <div className="hero-side-img-box">
                <img
                  src={heroItem2?.image_url || 'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?w=600&auto=format&fit=crop&q=80'}
                  alt={heroItem2?.name || 'Relax pick'}
                  className="hero-side-img"
                />
              </div>
              <Link
                to={heroItem2 ? `/products/${heroItem2.id}` : '/products'}
                style={{ fontSize: '0.8rem', fontWeight: '700', color: '#065f46', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                Shop Calm <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* Interactive Sliding Ad Product Hero Banner */}
          <HeroSlider
            onOpenMoodFinder={onOpenMoodFinder}
            products={allProducts}
          />
        </section>

        {/* =================================================================
            TRUST & VALUE PERKS RIBBON (Fills space below hero with vibrant color & credibility)
            ================================================================= */}
        <TrustPerksBar />

        {/* =================================================================
            TODAY'S DEAL / TODAY'S VIBE (Directly from Reference Mockup)
            ================================================================= */}
        <section className="section">
          <div className="section-header">
            <div className="section-header-title">
              <span style={{ fontSize: '1.4rem' }}>{dailyVibe.emoji}</span>
              <div>
                <span>Today's Vibe: {dailyVibe.title}</span>
                <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-muted)' }}>
                  {dailyVibe.tagline}
                </span>
              </div>
            </div>
            <Link to={`/products?mood=${dailyVibe.mood}`} className="view-all-link">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="products-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {/* Spotlight / Continue shopping card (matching reference card 1) */}
            <div
              className="product-card spotlight-vibe-card"
              style={{
                background: 'linear-gradient(145deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)',
                border: '1.5px solid rgba(251, 191, 36, 0.7)',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: '2.25rem 1.75rem',
                boxShadow: '0 10px 25px -4px rgba(245, 158, 11, 0.25)',
              }}
            >
              <div style={{ fontSize: '2.75rem', marginBottom: '0.85rem' }}>✨</div>
              <span style={{ fontSize: '0.725rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#b45309', background: 'rgba(255,255,255,0.85)', padding: '3px 10px', borderRadius: '12px', marginBottom: '0.65rem' }}>
                Featured Vibe
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#78350f', marginBottom: '0.45rem' }}>
                Curated for {dailyVibe.dayName}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '1.4rem', lineHeight: '1.45', fontStyle: 'italic' }}>
                "{dailyVibe.quote}"
              </p>
              <Link
                to={`/products?mood=${dailyVibe.mood}`}
                className="btn btn-secondary btn-sm btn-pill"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Shop {dailyVibe.mood.toUpperCase()} Picks
              </Link>
            </div>

            {/* Daily Vibe Real Products (Direct ProductCard mapping) */}
            {dailyVibeProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                targetMood={dailyVibe.mood}
              />
            ))}
          </div>
        </section>

        {/* =================================================================
            HOW DO YOU WANT TO FEEL? (MOOD JOURNEY - Signature Feature #22)
            ================================================================= */}
        <section className="section">
          <div className="mood-journey-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Compass size={14} /> Signature Experience
                </span>
                <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
                  How do you want to feel?
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Select your current mindset and choose where you want to be. We bridge the transition.
                </p>
              </div>

              {/* Journey Switcher Pills */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {MOOD_JOURNEY_OPTIONS.map((opt, idx) => (
                  <button
                    key={opt.fromId}
                    onClick={() => setJourneyIdx(idx)}
                    className={`btn btn-sm ${journeyIdx === idx ? 'btn-primary' : 'btn-outline'}`}
                    style={{ borderRadius: 'var(--radius-full)' }}
                  >
                    {opt.fromLabel.split(' ')[0]} → {opt.toLabel.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Journey Banner Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-subtle)',
                marginBottom: '1.25rem',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)' }}>
                  TRANSITION: {currentJourney.fromLabel} ➔ {currentJourney.toLabel}
                </span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>
                  {currentJourney.recommendationTitle}
                </h4>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  {currentJourney.recommendationSubtitle}
                </p>
              </div>

              <Link
                to={`/products?mood=${currentJourney.targetMood}`}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                View Collection <ArrowRight size={14} />
              </Link>
            </div>

            {/* Journey Matched Products */}
            <ProductList
              products={journeyProducts}
              loading={loading}
              targetMood={currentJourney.targetMood}
              emptyMessage="No items found for this transition."
            />
          </div>
        </section>

        {/* =================================================================
            DUAL PROMOTIONAL BANNERS (Directly from Reference Mockup)
            ================================================================= */}
        <section className="dual-promo-grid">
          {/* Left Dark Card (Like "boAt Bassheads 900") */}
          <div className="promo-banner-card promo-dark-banner">
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                High-Energy Vibe
              </span>
              <h3 className="promo-banner-title">Deep Bass Audio</h3>
              <p className="promo-banner-sub">Wireless earphones with punchy sound at Just ₹1,299</p>
              <Link to="/products?mood=party" className="btn btn-primary btn-sm btn-pill">
                Explore Party Gear
              </Link>
            </div>
            <img
              src="https://ongnfokecslmatxrdthx.supabase.co/storage/v1/object/public/products/bluetooth-earphones.jpg"
              alt="Bluetooth Earphones"
              className="promo-banner-img"
            />
          </div>

          {/* Right Vibrant Gradient Card (Like "AirPods Pro" Lifestyle Banner) */}
          <div className="promo-banner-card promo-cyan-banner">
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Serene Living
              </span>
              <h3 className="promo-banner-title">Mindful Living</h3>
              <p className="promo-banner-sub">Scented candles & yoga gear to restore your inner balance</p>
              <Link to="/products?mood=relaxed" className="btn btn-secondary btn-sm btn-pill">
                Discover Calm
              </Link>
            </div>
            <img
              src="https://ongnfokecslmatxrdthx.supabase.co/storage/v1/object/public/products/scented-candle-set.jpg"
              alt="Scented Candles"
              className="promo-banner-img"
            />
          </div>
        </section>

        {/* =================================================================
            SHOP BY MOOD GRID (Requirement #8, like "Shop by Brands" in mockup)
            ================================================================= */}
        <section className="section">
          <div className="section-header">
            <div className="section-header-title">
              <span>Shop by Mood & Emotional Vibe</span>
            </div>
            <Link to="/products" className="view-all-link">
              All Moods <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mood-grid">
            {MOODS.map((mood) => {
              const count = allProducts.filter((p) => p.mood === mood.id).length;
              return (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood((prev) => (prev === mood.id ? null : mood.id))}
                  className={`mood-card mood-card-${mood.id} ${selectedMood === mood.id ? 'mood-card-active' : ''}`}
                >
                  <span className="mood-emoji">{mood.emoji}</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="mood-label">{mood.label}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '2px 8px', borderRadius: '12px', background: mood.badgeBg, color: mood.color }}>
                      {count} items
                    </span>
                  </div>
                  <p className="mood-description">{mood.tagline}</p>
                  <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', fontWeight: '700', color: mood.color, display: 'flex', alignItems: 'center', gap: '3px' }}>
                    {selectedMood === mood.id ? 'Showing picks below ↓' : `Explore ${mood.label} →`}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Mood Results Dropdown if selected */}
          {selectedMood && (
            <div style={{ marginTop: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                  {MOODS.find((m) => m.id === selectedMood)?.emoji}{' '}
                  {MOODS.find((m) => m.id === selectedMood)?.label} Handpicked Products
                </h3>
                <button
                  onClick={() => setSelectedMood(null)}
                  className="btn btn-outline btn-sm"
                >
                  Clear Mood Filter
                </button>
              </div>

              <ProductList
                products={moodProducts}
                loading={loadingMood}
                targetMood={selectedMood}
                emptyMessage={`No products found for this mood.`}
              />
            </div>
          )}
        </section>

        {/* =================================================================
            RECOMMENDED FOR YOU / RELATED ITEMS (Matching Reference Mockup)
            ================================================================= */}
        <section className="section">
          <div className="section-header">
            <div className="section-header-title">
              <span>Your Recommended Items..</span>
            </div>
            <Link to="/products" className="view-all-link">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <ProductList
            products={recommendedProducts}
            loading={loading}
            emptyMessage="No products available."
          />
        </section>
      </div>
    </div>
  );
}
