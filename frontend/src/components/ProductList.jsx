import ProductCard from './ProductCard';

export default function ProductList({ products, loading, emptyMessage = 'No products found.', targetMood }) {
  if (loading) {
    return (
      <div className="products-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="product-card" style={{ height: '360px' }}>
            <div className="skeleton" style={{ height: '180px', borderRadius: '12px', marginBottom: '1rem' }} />
            <div className="skeleton" style={{ height: '16px', width: '40%', marginBottom: '0.5rem' }} />
            <div className="skeleton" style={{ height: '22px', width: '85%', marginBottom: '0.75rem' }} />
            <div className="skeleton" style={{ height: '20px', width: '30%', marginTop: 'auto' }} />
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔍</div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>No Products Found</h3>
        <p style={{ color: 'var(--text-muted)' }}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="products-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} targetMood={targetMood} />
      ))}
    </div>
  );
}
