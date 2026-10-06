import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCategories } from '../services/categoryService';
import { MOODS } from '../utils/moodLogic';

// Visual preview icon helpers for categories
const CATEGORY_ICONS = {
  'Electronics': '💻',
  'Books': '📚',
  'Food & Beverages': '☕',
  'Home & Lifestyle': '🕯️',
  'Fitness': '🧘',
  'Stationery': '✏️',
};

export default function CategoriesBar({ selectedCategory, onSelectCategory, selectedMood, onSelectMood }) {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getCategories()
      .then(({ data }) => setCategories(data || []))
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  function handleCategoryClick(catId) {
    if (onSelectCategory) {
      onSelectCategory(selectedCategory === catId ? '' : catId);
    } else {
      navigate(`/products?category=${catId}`);
    }
  }

  function handleMoodClick(moodId) {
    if (onSelectMood) {
      onSelectMood(selectedMood === moodId ? '' : moodId);
    } else {
      navigate(`/products?mood=${moodId}`);
    }
  }

  return (
    <div className="categories-strip-wrapper">
      <div className="container">
        <div className="categories-strip">
          <span className="categories-label">Categories</span>

          {/* All items pill */}
          <button
            onClick={() => {
              if (onSelectCategory) onSelectCategory('');
              if (onSelectMood) onSelectMood('');
              if (location.pathname !== '/products') navigate('/products');
            }}
            className={`category-pill-card ${!selectedCategory && !selectedMood ? 'active' : ''}`}
          >
            <span>🛍️ All</span>
          </button>

          {/* Database Categories */}
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`category-pill-card ${selectedCategory === cat.id ? 'active' : ''}`}
            >
              <span style={{ fontSize: '1.1rem' }}>{CATEGORY_ICONS[cat.name] || '📦'}</span>
              <span>{cat.name}</span>
            </button>
          ))}

          {/* Mood Categories */}
          {MOODS.map((m) => (
            <button
              key={m.id}
              onClick={() => handleMoodClick(m.id)}
              className={`category-pill-card ${selectedMood === m.id ? 'active' : ''}`}
              style={{
                borderColor: selectedMood === m.id ? m.color : 'var(--border-subtle)',
                backgroundColor: selectedMood === m.id ? m.badgeBg : '#ffffff',
                color: selectedMood === m.id ? m.color : '#334155',
              }}
            >
              <span>{m.emoji}</span>
              <span>{m.label} Vibe</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
