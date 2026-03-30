/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CldUploadWidget } from 'next-cloudinary';
import { ArrowLeft, Save, Upload, Trash2, Plus, X } from 'lucide-react';

interface ProductVariant {
  id?: string;
  color: string;
  colorName: string;
  size: string;
  frontImage: string;
  backImage: string;
  stock: number;
  sku?: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  printPrice: number;
  category: string;
  gender: string;
  fit: string;
  isActive: boolean;
  isFeatured: boolean;
  stockCount: number;
  variants: ProductVariant[];
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const GENDERS = ['Men', 'Women', 'Unisex'];
const FITS = ['Regular', 'Slim', 'Oversized', 'Relaxed'];
const CATEGORIES = ['T-Shirt', 'Hoodie', 'Sweatshirt', 'Tank Top', 'Polo'];

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editable fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [printPrice, setPrintPrice] = useState('');
  const [category, setCategory] = useState('t-shirt');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedFit, setSelectedFit] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Add variant modal
  const [showAddVariant, setShowAddVariant] = useState(false);
  const [newVariant, setNewVariant] = useState<ProductVariant>({
    color: '#000000',
    colorName: '',
    size: 'M',
    frontImage: '',
    backImage: '',
    stock: 50,
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/admin/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        const p = data.product;
        setProduct(p);
        setName(p.name);
        setDescription(p.description || '');
        setBasePrice(String(p.basePrice));
        setPrintPrice(String(p.printPrice));
        setCategory(p.category);
        setSelectedGender(p.gender || 'unisex');
        setSelectedFit(p.fit || 'regular');
        setIsFeatured(p.isFeatured);
        setIsActive(p.isActive);
        setVariants(p.variants || []);
      } catch (err) {
        setError('Failed to load product');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const selectGender = (gender: string) => {
    setSelectedGender(gender.toLowerCase());
  };

  const selectFit = (fit: string) => {
    setSelectedFit(fit.toLowerCase());
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    if (!newVariant.colorName || !newVariant.frontImage) {
      setError('Color name and front image are required');
      return;
    }
    setVariants([...variants, { ...newVariant }]);
    setNewVariant({ color: '#000000', colorName: '', size: 'M', frontImage: '', backImage: '', stock: 50 });
    setShowAddVariant(false);
    setError('');
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || null,
          basePrice: parseInt(basePrice),
          printPrice: parseInt(printPrice),
          category,
          gender: selectedGender,
          fit: selectedFit,
          isFeatured,
          isActive,
          variants: variants.map(v => ({
            color: v.color,
            colorName: v.colorName,
            size: v.size,
            frontImage: v.frontImage,
            backImage: v.backImage || v.frontImage,
            stock: v.stock,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('Product updated successfully!');
        setProduct(data.product);
        setVariants(data.product.variants);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to update product');
      }
    } catch (err) {
      setError('Something went wrong: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6 text-center">
          <p className="text-red-600 mb-4">Product not found</p>
          <button onClick={() => router.push('/admin/products')} className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-gray-500 text-sm mt-1">ID: {product.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹)</label>
                  <input type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Print Price (₹)</label>
                  <input type="number" value={printPrice} onChange={(e) => setPrintPrice(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent">
                    {CATEGORIES.map(cat => (<option key={cat} value={cat.toLowerCase()}>{cat}</option>))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Options</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <div className="flex flex-wrap gap-2">
                  {GENDERS.map(gender => (
                    <button key={gender} type="button" onClick={() => selectGender(gender)} className={`px-4 py-2 rounded-lg font-medium transition border ${selectedGender === gender.toLowerCase() ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}`}>
                      {gender}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fit</label>
                <div className="flex flex-wrap gap-2">
                  {FITS.map(fit => (
                    <button key={fit} type="button" onClick={() => selectFit(fit)} className={`px-4 py-2 rounded-lg font-medium transition border ${selectedFit === fit.toLowerCase() ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}`}>
                      {fit}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 accent-black" />
                  <span className="text-sm font-medium text-gray-700">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 accent-black" />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Variants ({variants.length})</h2>
                <p className="text-sm text-gray-500">Manage color, size, and image combinations</p>
              </div>
              <button type="button" onClick={() => setShowAddVariant(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium">
                <Plus className="w-4 h-4" />
                Add Variant
              </button>
            </div>

            {variants.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 mb-1">No variants</p>
                <p className="text-sm text-gray-400">Add variants for colors and sizes</p>
              </div>
            ) : (
              <div className="space-y-2">
                {variants.map((variant, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                    <span className="w-8 h-8 rounded-full border-2 border-white shadow flex-shrink-0" style={{ backgroundColor: variant.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900">{variant.colorName} — {variant.size}</p>
                      <p className="text-xs text-gray-500">Stock: {variant.stock}</p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {variant.frontImage && (
                        <img src={variant.frontImage} alt="Front" className="w-10 h-10 object-cover rounded border" />
                      )}
                      {variant.backImage && variant.backImage !== variant.frontImage && (
                        <img src={variant.backImage} alt="Back" className="w-10 h-10 object-cover rounded border" />
                      )}
                    </div>
                    <button type="button" onClick={() => removeVariant(index)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Remove">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save buttons */}
          <div className="flex gap-4">
            <button type="button" onClick={() => router.push('/admin/products')} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={saving} className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Add Variant Modal */}
        {showAddVariant && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowAddVariant(false)}>
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Add Variant</h3>
                  <button type="button" onClick={() => setShowAddVariant(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                      <input type="color" value={newVariant.color} onChange={(e) => setNewVariant(prev => ({ ...prev, color: e.target.value }))} className="w-full h-10 rounded border cursor-pointer" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Color Name *</label>
                      <input type="text" value={newVariant.colorName} onChange={(e) => setNewVariant(prev => ({ ...prev, colorName: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g., Navy Blue" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                      <select value={newVariant.size} onChange={(e) => setNewVariant(prev => ({ ...prev, size: e.target.value }))} className="w-full px-3 py-2 border rounded-lg">
                        {SIZES.map(size => (<option key={size} value={size}>{size}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                      <input type="number" value={newVariant.stock} onChange={(e) => setNewVariant(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 border rounded-lg" min="0" />
                    </div>
                  </div>

                  {/* Front Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Front Image *</label>
                    <CldUploadWidget
                      uploadPreset="for-products"
                      onSuccess={(result: any) => {
                        if (result?.info?.secure_url) {
                          setNewVariant(prev => ({ ...prev, frontImage: result.info.secure_url }));
                        }
                      }}
                    >
                      {({ open }) => (
                        <div onClick={() => open && open()} className="border-2 border-dashed border-gray-300 rounded-lg hover:border-black transition cursor-pointer p-4">
                          {newVariant.frontImage ? (
                            <img src={newVariant.frontImage} alt="Front" className="w-full h-32 object-contain rounded bg-gray-50" />
                          ) : (
                            <div className="flex flex-col items-center gap-1 py-4 text-gray-400">
                              <Upload className="w-6 h-6" />
                              <span className="text-xs">Click to upload</span>
                            </div>
                          )}
                        </div>
                      )}
                    </CldUploadWidget>
                  </div>

                  {/* Back Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Back Image</label>
                    <CldUploadWidget
                      uploadPreset="for-products"
                      onSuccess={(result: any) => {
                        if (result?.info?.secure_url) {
                          setNewVariant(prev => ({ ...prev, backImage: result.info.secure_url }));
                        }
                      }}
                    >
                      {({ open }) => (
                        <div onClick={() => open && open()} className="border-2 border-dashed border-gray-300 rounded-lg hover:border-black transition cursor-pointer p-4">
                          {newVariant.backImage ? (
                            <img src={newVariant.backImage} alt="Back" className="w-full h-32 object-contain rounded bg-gray-50" />
                          ) : (
                            <div className="flex flex-col items-center gap-1 py-4 text-gray-400">
                              <Upload className="w-6 h-6" />
                              <span className="text-xs">Click to upload</span>
                            </div>
                          )}
                        </div>
                      )}
                    </CldUploadWidget>
                  </div>

                  <button type="button" onClick={addVariant} disabled={!newVariant.colorName || !newVariant.frontImage} className="w-full px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    Add Variant
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}