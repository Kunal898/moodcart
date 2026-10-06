import { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct, uploadProductImage } from '../services/productService';
import { getCategories } from '../services/categoryService';
import { getOrders, updateOrderStatus, getDashboardStats } from '../services/orderService';
import { useToast } from '../context/ToastContext';
import { Package, ShoppingBag, DollarSign, Clock, AlertTriangle, Plus, Edit2, Trash2, Upload, CheckCircle2 } from 'lucide-react';

const MOODS = ['happy', 'relaxed', 'party', 'work'];
const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const emptyProduct = {
  name: '', description: '', price: '', original_price: '', image_url: '',
  category_id: '', stock: '', mood: '',
};

export default function AdminPage() {
  const { addToast } = useToast();
  const [tab, setTab] = useState('overview');

  // Stats state
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });

  // Products state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [productError, setProductError] = useState('');
  const [productSaving, setProductSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    fetchStats();
    fetchProducts();
    getCategories().then(({ data }) => setCategories(data || [])).catch(console.error);
  }, []);

  useEffect(() => {
    if (tab === 'orders' || tab === 'overview') fetchOrders();
  }, [tab]);

  async function fetchStats() {
    try {
      const { data } = await getDashboardStats();
      setStats(data);
    } catch {
      // fallback
    }
  }

  async function fetchProducts() {
    try {
      setLoadingProducts(true);
      const { data } = await getProducts();
      setProducts(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProducts(false);
    }
  }

  async function fetchOrders() {
    try {
      setLoadingOrders(true);
      const { data } = await getOrders();
      setOrders(data || []);
    } catch {
      setOrderError('Failed to load orders.');
    } finally {
      setLoadingOrders(false);
    }
  }

  function openCreateForm() {
    setEditingProduct(null);
    setProductForm(emptyProduct);
    setProductError('');
    setShowForm(true);
  }

  function openEditForm(product) {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      original_price: product.original_price || '',
      image_url: product.image_url || '',
      category_id: product.category_id || '',
      stock: product.stock,
      mood: product.mood || '',
    });
    setProductError('');
    setShowForm(true);
  }

  function handleProductFormChange(e) {
    const { name, value } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleImageFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingImage(true);
      const { data } = await uploadProductImage(formData);
      setProductForm((prev) => ({ ...prev, image_url: data.imageUrl }));
      addToast('Image uploaded successfully!', 'success');
    } catch {
      setProductError('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleProductSubmit(e) {
    e.preventDefault();
    setProductError('');

    if (!productForm.name || !productForm.price || !productForm.category_id) {
      setProductError('Name, Price, and Category are required.');
      return;
    }

    try {
      setProductSaving(true);
      if (editingProduct) {
        await updateProduct(editingProduct.id, productForm);
        addToast('Product updated successfully!', 'success');
      } else {
        await createProduct(productForm);
        addToast('Product created successfully!', 'success');
      }

      setShowForm(false);
      fetchProducts();
      fetchStats();
    } catch (err) {
      setProductError(err.response?.data?.error || 'Failed to save product.');
    } finally {
      setProductSaving(false);
    }
  }

  async function handleDeleteProduct(id) {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      addToast('Product deleted.', 'info');
      fetchProducts();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete product.');
    }
  }

  async function handleStatusChange(orderId, newStatus) {
    try {
      await updateOrderStatus(orderId, newStatus);
      addToast(`Order status updated to ${newStatus}`, 'success');
      fetchOrders();
      fetchStats();
    } catch {
      alert('Failed to update status.');
    }
  }

  return (
    <div className="container section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.2rem' }}>Admin Operations Center</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Monitor metrics, fulfill customer orders, and manage catalog inventory.
          </p>
        </div>

        {tab === 'products' && (
          <button onClick={openCreateForm} className="btn btn-primary btn-pill">
            <Plus size={16} /> Add New Product
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs-nav">
        <button
          onClick={() => setTab('overview')}
          className={`tab-btn ${tab === 'overview' ? 'active' : ''}`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setTab('products')}
          className={`tab-btn ${tab === 'products' ? 'active' : ''}`}
        >
          📦 Catalog & Inventory ({products.length})
        </button>
        <button
          onClick={() => setTab('orders')}
          className={`tab-btn ${tab === 'orders' ? 'active' : ''}`}
        >
          🛒 Customer Orders ({orders.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {tab === 'overview' && (
        <div>
          <div className="admin-stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrap" style={{ backgroundColor: '#eff6ff', color: 'var(--primary)' }}>
                <DollarSign size={24} />
              </div>
              <div>
                <p className="stat-value">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
                <p className="stat-label">Total Revenue</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap" style={{ backgroundColor: '#ecfdf5', color: '#047857' }}>
                <ShoppingBag size={24} />
              </div>
              <div>
                <p className="stat-value">{stats.totalOrders}</p>
                <p className="stat-label">Total Orders</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
                <Clock size={24} />
              </div>
              <div>
                <p className="stat-value">{stats.pendingOrders}</p>
                <p className="stat-label">Pending Fulfillment</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap" style={{ backgroundColor: '#f3e8ff', color: '#7e22ce' }}>
                <Package size={24} />
              </div>
              <div>
                <p className="stat-value">{stats.totalProducts}</p>
                <p className="stat-label">Total Products</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <p className="stat-value">{stats.lowStockProducts}</p>
                <p className="stat-label">Low Stock Alerts</p>
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>Recent Orders</h3>
          {orders.slice(0, 5).map((order) => (
            <div key={order.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '0.65rem' }}>
              <div>
                <span style={{ fontWeight: '700' }}>#{order.id.slice(0, 8)}</span> • {order.name} ({order.phone})
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.order_items?.length} items • ₹{Number(order.total).toLocaleString('en-IN')}</p>
              </div>
              <span style={{ fontWeight: '700', fontSize: '0.85rem', textTransform: 'capitalize' }}>{order.status}</span>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: PRODUCTS */}
      {tab === 'products' && (
        <div>
          {/* Create / Edit Form Modal */}
          {showForm && (
            <div className="modal-overlay">
              <div className="modal-card" style={{ maxWidth: '640px' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '1.25rem' }}>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>

                {productError && (
                  <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '6px', marginBottom: '1rem' }}>
                    {productError}
                  </div>
                )}

                <form onSubmit={handleProductSubmit}>
                  <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={productForm.name}
                      onChange={handleProductFormChange}
                      className="input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      rows={3}
                      value={productForm.description}
                      onChange={handleProductFormChange}
                      className="input"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Selling Price (₹) *</label>
                      <input
                        type="number"
                        name="price"
                        required
                        min="0"
                        value={productForm.price}
                        onChange={handleProductFormChange}
                        className="input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Original / MRP Price (₹)</label>
                      <input
                        type="number"
                        name="original_price"
                        min="0"
                        value={productForm.original_price}
                        onChange={handleProductFormChange}
                        className="input"
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Category *</label>
                      <select
                        name="category_id"
                        required
                        value={productForm.category_id}
                        onChange={handleProductFormChange}
                        className="input"
                      >
                        <option value="">Select category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Mood Vibe</label>
                      <select
                        name="mood"
                        value={productForm.mood}
                        onChange={handleProductFormChange}
                        className="input"
                      >
                        <option value="">None</option>
                        {MOODS.map((m) => (
                          <option key={m} value={m}>{m.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Stock Quantity *</label>
                      <input
                        type="number"
                        name="stock"
                        min="0"
                        value={productForm.stock}
                        onChange={handleProductFormChange}
                        className="input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Image URL / Upload</label>
                      <input
                        type="text"
                        name="image_url"
                        value={productForm.image_url}
                        onChange={handleProductFormChange}
                        className="input"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Upload size={15} /> Upload Image File to Supabase Storage
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      disabled={uploadingImage}
                      style={{ fontSize: '0.85rem' }}
                    />
                    {uploadingImage && <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Uploading...</span>}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={productSaving}
                      className="btn btn-primary"
                    >
                      {productSaving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Products List Table */}
          <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Product</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Mood</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Price</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Stock Status</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const isOut = p.stock === 0;
                  const isLow = p.stock > 0 && p.stock <= 5;

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={p.image_url} alt={p.name} style={{ width: '38px', height: '38px', objectFit: 'contain', background: '#f8fafc', borderRadius: '4px' }} />
                        <span style={{ fontWeight: '600' }}>{p.name}</span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>{p.categories?.name || '—'}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {p.mood ? (
                          <span style={{ padding: '2px 8px', borderRadius: '12px', background: '#f1f5f9', fontSize: '0.75rem', fontWeight: '700' }}>{p.mood}</span>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>₹{Number(p.price).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {isOut ? (
                          <span style={{ color: '#ef4444', fontWeight: '700', fontSize: '0.8rem' }}>Out of Stock</span>
                        ) : isLow ? (
                          <span style={{ color: '#ea580c', fontWeight: '700', fontSize: '0.8rem' }}>Low Stock ({p.stock})</span>
                        ) : (
                          <span style={{ color: '#10b981', fontWeight: '700', fontSize: '0.8rem' }}>In Stock ({p.stock})</span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <button onClick={() => openEditForm(p)} style={{ marginRight: '0.65rem', color: 'var(--primary)' }} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteProduct(p.id)} style={{ color: '#ef4444' }} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS */}
      {tab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map((o) => (
            <div key={o.id} style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <strong>Order #{o.id.slice(0, 8)}</strong> • Recipient: {o.name} ({o.phone})
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 {o.address}, {o.city} - {o.pincode}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: '800' }}>₹{Number(o.total).toLocaleString('en-IN')}</span>
                  <select
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    className="input"
                    style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.85rem', fontWeight: '700' }}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {o.order_items?.map((item) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.4rem 0.65rem', borderRadius: '6px', fontSize: '0.825rem' }}>
                    <img src={item.products?.image_url} alt={item.products?.name} style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                    <span>{item.products?.name} × {item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
