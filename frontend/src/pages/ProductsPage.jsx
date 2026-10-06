import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductList from '../components/ProductList';
import CategoriesBar from '../components/CategoriesBar';
import { getProducts } from '../services/productService';
import { getCategories } from '../services/categoryService';
import { MOODS } from '../utils/moodLogic';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialMood = searchParams.get('mood') || '';

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedMood, setSelectedMood] = useState(initialMood);
  const [sortBy, setSortBy] = useState('newest');

  // Sync state if URL query params change
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedMood(searchParams.get('mood') || '');
  }, [searchParams]);

  useEffect(() => {
    getCategories()
      .then(({ data }) => setCategories(data || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFilteredProducts();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedMood, sortBy]);

  async function fetchFilteredProducts() {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedMood) params.mood = selectedMood;
      if (sortBy) params.sort = sortBy;

      const { data } = await getProducts(params);
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleClearAll() {
    setSearch('');
    setSelectedCategory('');
    setSelectedMood('');
    setSortBy('newest');
    setSearchParams({});
  }

  const activeMoodInfo = MOODS.find((m) => m.id === selectedMood);

  return (
    <div>
      <CategoriesBar
        selectedCategory={selectedCategory}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          const p = new URLSearchParams(searchParams);
          if (catId) p.set('category', catId);
          else p.delete('category');
          setSearchParams(p);
        }}
        selectedMood={selectedMood}
        onSelectMood={(mId) => {
          setSelectedMood(mId);
          const p = new URLSearchParams(searchParams);
          if (mId) p.set('mood', mId);
          else p.delete('mood');
          setSearchParams(p);
        }}
      />

      <div className="container section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>
              {activeMoodInfo ? `${activeMoodInfo.emoji} ${activeMoodInfo.label} Collection` : 'All Products'}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {activeMoodInfo ? activeMoodInfo.tagline : 'Discover hand-picked items tailored for your lifestyle and mood.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SlidersHorizontal size={16} color="#64748b" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input"
                style={{ padding: '0.45rem 0.85rem', width: 'auto', fontSize: '0.85rem', borderRadius: 'var(--radius-full)' }}
              >
                <option value="newest">Sort by: Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Alphabetical: A - Z</option>
              </select>
            </div>

            {(search || selectedCategory || selectedMood) && (
              <button
                onClick={handleClearAll}
                className="btn btn-outline btn-sm btn-pill"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <X size={14} /> Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Product Grid */}
        <ProductList
          products={products}
          loading={loading}
          targetMood={selectedMood}
          emptyMessage="No products match your current filters. Try selecting a different mood or category."
        />
      </div>
    </div>
  );
}
