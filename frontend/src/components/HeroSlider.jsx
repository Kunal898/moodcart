import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroSlider({ onOpenMoodFinder, products = [] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Dynamic products from database or curated hero imagery with premier aesthetics
  const happyProduct = products.find((p) => p.name === 'Noise-Cancelling Wireless Headphones' || p.name === 'Bluetooth Earphones') ||
    products.find((p) => p.mood === 'happy') || {
      name: 'Wireless Studio Headphones',
      price: 3999,
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    };

  const partyProduct = products.find((p) => p.name === 'Portable Waterproof Bluetooth Speaker' || p.name === 'Smart Dual RGB Light Bars') ||
    products.find((p) => p.mood === 'party') || {
      name: 'Portable Bluetooth Speaker',
      price: 1799,
      image_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
    };

  const workProduct = products.find((p) => p.name === 'Mechanical Keyboard' || p.name === 'Dual-Wireless Ergonomic Mouse') ||
    products.find((p) => p.mood === 'work') || {
      name: 'Tactile Mechanical Keyboard',
      price: 4499,
      image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    };

  const relaxedProduct = products.find((p) => p.name === 'Ultrasonic Essential Oil Diffuser' || p.name === 'Sunset Projection Lamp RGB' || p.name === 'Scented Candle Set') ||
    products.find((p) => p.mood === 'relaxed') || {
      name: 'Ultrasonic Essential Diffuser',
      price: 1399,
      image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80',
    };

  const slides = [
    {
      id: 'happy',
      tag: '✨ EMOTION-DRIVEN COMMERCE',
      headline: 'SHOP YOUR MOOD.',
      subtext: 'Discover everyday essentials, audio gear, and lifestyle products curated to fit exactly how you feel.',
      startingTag: 'Curated collections starting at ₹249',
      ctaText: 'Explore Products',
      ctaLink: '/products',
      mood: 'happy',
      product: happyProduct,
      gradient: 'linear-gradient(135deg, #d9f99d 0%, #6ee7b7 30%, #67e8f9 65%, #93c5fd 100%)',
      textColor: '#090d16',
      badgeBg: '#ffffff',
      badgeColor: '#2563eb',
    },
    {
      id: 'party',
      tag: '🔥 HIGH-ENERGY SOUND & LIGHTS',
      headline: 'TURN THE ENERGY UP.',
      subtext: 'Waterproof 360° wireless speakers, smart dual RGB light bars, and party gear for epic celebrations.',
      startingTag: 'Party essentials starting at ₹349',
      ctaText: 'Explore Party Picks',
      ctaLink: '/products?mood=party',
      mood: 'party',
      product: partyProduct,
      gradient: 'linear-gradient(135deg, #fed7aa 0%, #f472b6 35%, #c084fc 70%, #818cf8 100%)',
      textColor: '#090d16',
      badgeBg: '#ffffff',
      badgeColor: '#9333ea',
    },
    {
      id: 'work',
      tag: '⚡ PEAK FOCUS & MOMENTUM',
      headline: 'DIAL IN YOUR FOCUS.',
      subtext: 'Precision tactile keyboards, ergonomic wrist rests, and artisanal dark roast coffee for deep work.',
      startingTag: 'Productivity gear starting at ₹299',
      ctaText: 'Shop Work Mode',
      ctaLink: '/products?mood=work',
      mood: 'work',
      product: workProduct,
      gradient: 'linear-gradient(135deg, #bae6fd 0%, #7dd3fc 35%, #93c5fd 65%, #c7d2fe 100%)',
      textColor: '#090d16',
      badgeBg: '#ffffff',
      badgeColor: '#1d4ed8',
    },
    {
      id: 'relaxed',
      tag: '🌿 SLOW DOWN & BREATHE',
      headline: 'UNWIND IN PEACE.',
      subtext: 'Aromatherapy ultrasonic diffusers, chunky weighted blankets, and lavender herbal infusions.',
      startingTag: 'Calming comfort starting at ₹399',
      ctaText: 'Discover Calm',
      ctaLink: '/products?mood=relaxed',
      mood: 'relaxed',
      product: relaxedProduct,
      gradient: 'linear-gradient(135deg, #dcfce7 0%, #a7f3d0 35%, #6ee7b7 70%, #5eead4 100%)',
      textColor: '#064e3b',
      badgeBg: '#ffffff',
      badgeColor: '#047857',
    },
  ];

  // Auto-play sliding banner (pause on hover)
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timerRef.current);
  }, [isPaused, slides.length]);

  function handlePrev() {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }

  function handleNext() {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }

  const active = slides[currentSlide];

  return (
    <div
      className="hero-slider-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="hero-main-banner animated-slide"
        key={active.id}
        style={{
          background: active.gradient,
          color: active.textColor,
        }}
      >
        {/* Slide Content */}
        <div className="hero-main-content">
          <span
            className="hero-slide-badge"
            style={{
              background: active.badgeBg,
              color: active.badgeColor,
            }}
          >
            <Sparkles size={13} /> {active.tag}
          </span>

          <h1 className="hero-main-headline slide-text-anim">
            {active.headline}
          </h1>

          <p className="hero-main-subtext slide-sub-anim">
            {active.subtext}
          </p>

          <p className="hero-starting-tag slide-tag-anim">
            {active.startingTag}
          </p>

          <div className="hero-main-ctas">
            <Link to={active.ctaLink} className="btn btn-secondary btn-pill">
              {active.ctaText} <ArrowRight size={16} />
            </Link>
            <button
              onClick={onOpenMoodFinder}
              className="btn btn-primary btn-pill"
            >
              <Sparkles size={16} /> Find My Mood
            </button>
          </div>
        </div>

        {/* Floating Animated Product Showcase Card (Eliminates raw letterboxing/blank space) */}
        <div className="hero-visual-wrap">
          <div className="hero-floating-halo" />
          <div className="hero-showcase-card floating-anim">
            <img
              src={active.product.image_url}
              alt={active.product.name}
              className="hero-showcase-img"
            />
            <div className="hero-showcase-overlay">
              <span className="hero-showcase-badge">
                ★ 4.9 Rated
              </span>
              <div className="hero-showcase-details">
                <span className="hero-showcase-title">{active.product.name}</span>
                <span className="hero-showcase-price">₹{Number(active.product.price).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Slider Arrow Controls (Directly matching the chevron arrow in the reference mockup) */}
        <button
          onClick={handlePrev}
          className="hero-slider-arrow hero-slider-prev"
          aria-label="Previous Slide"
        >
          <ChevronLeft size={22} />
        </button>

        <button
          onClick={handleNext}
          className="hero-slider-arrow hero-slider-next"
          aria-label="Next Slide"
        >
          <ChevronRight size={22} />
        </button>

        {/* Slide Dots / Progress Indicator */}
        <div className="hero-slider-dots">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={`hero-dot ${currentSlide === idx ? 'hero-dot-active' : ''}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
