/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CldUploadWidget } from 'next-cloudinary';
import { Plus, Trash2, Upload, X } from 'lucide-react';

interface Variant {
  color: string;
  colorName: string;
  size: string;
  frontImage: string;
  backImage: string;
  stock: number;
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const GENDERS = ['Men', 'Women', 'Unisex'];
const FITS = ['Regular', 'Slim', 'Oversized', 'Relaxed'];
const CATEGORIES = ['T-Shirt', 'Hoodie', 'Sweatshirt', 'Tank Top'];

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [printPrice, setPrintPrice] = useState('');
  const [category, setCategory] = useState('t-shirt');
  const [selectedGender, setSelectedGender] = useState('men');
  const [selectedFit, setSelectedFit] = useState('regular');
  const [isFeatured, setIsFeatured] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);

  // Variant form state
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [currentVariant, setCurrentVariant] = useState<Partial<Variant>>({
    color: '#000000',
    colorName: 'Black',
    size: 'M',
    frontImage: '',
    backImage: '',
    stock: 50,
  });

  const handleAddVariant = () => {
    if (!currentVariant.frontImage || !currentVariant.backImage) {
      alert('Please upload both front and back images');
      return;
    }

    setVariants([...variants, currentVariant as Variant]);
    setCurrentVariant({
      color: '#000000',
      colorName: 'Black',
      size: 'M',
      frontImage: '',
      backImage: '',
      stock: 50,
    });
    setShowVariantForm(false);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (variants.length === 0) {
      setError('Please add at least one variant');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const productData = {
        name,
        description: description || null,
        basePrice: parseInt(basePrice),
        printPrice: parseInt(printPrice),
        category: category.toLowerCase(),
        gender: [selectedGender.toLowerCase()],
        fits: [selectedFit.toLowerCase()],
        isFeatured,
        variants,
      };

      console.log('Sending product data:', productData);

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      const data = await res.json();

      if (res.ok) {
        console.log('Product created:', data);
        alert('Product created successfully!');
        router.push('/admin/products');
        router.refresh();
      } else {
        console.error('Error response:', data);
        setError(data.error || 'Failed to create product');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Something went wrong: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600 mt-1">Create a new product for your catalog</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  placeholder="e.g., Classic Round Neck T-Shirt"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe your product..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                    placeholder="399"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Print Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={printPrice}
                    onChange={(e) => setPrintPrice(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                    placeholder="100"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Options</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender * (Select one)
                </label>
                <div className="flex flex-wrap gap-2">
                  {GENDERS.map(gender => (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => setSelectedGender(gender.toLowerCase())}
                      className={`px-4 py-2 rounded-lg font-medium transition ${selectedGender === gender.toLowerCase()
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fit * (Select one)
                </label>
                <div className="flex flex-wrap gap-2">
                  {FITS.map(fit => (
                    <button
                      key={fit}
                      type="button"
                      onClick={() => setSelectedFit(fit.toLowerCase())}
                      className={`px-4 py-2 rounded-lg font-medium transition ${selectedFit === fit.toLowerCase()
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {fit}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                  Mark as Featured Product
                </label>
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Product Variants</h2>
                <p className="text-sm text-gray-600">Add different colors and sizes</p>
              </div>
              <button
                type="button"
                onClick={() => setShowVariantForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                <Plus className="w-4 h-4" />
                Add Variant
              </button>
            </div>

            {variants.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 mb-2">No variants added yet</p>
                <p className="text-sm text-gray-400">Click &quot;Add Variant&quot; to create color/size combinations</p>
              </div>
            ) : (
              <div className="space-y-3">
                {variants.map((variant, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
                    <div
                      className="w-12 h-12 rounded border-2 border-white shadow"
                      style={{ backgroundColor: variant.color }}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{variant.colorName} - Size {variant.size}</p>
                      <p className="text-sm text-gray-600">Stock: {variant.stock} units</p>
                    </div>
                    <div className="flex gap-2">
                      {variant.frontImage && (
                        <img src={variant.frontImage} alt="Front" className="w-16 h-16 object-cover rounded border" />
                      )}
                      {variant.backImage && (
                        <img src={variant.backImage} alt="Back" className="w-16 h-16 object-cover rounded border" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Remove variant"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <p className="text-sm text-gray-600 text-center pt-2">
                  {variants.length} variant{variants.length !== 1 ? 's' : ''} added
                </p>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || variants.length === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-500 hover:to-pink-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Product...' : `Create Product (${variants.length} variants)`}
            </button>
          </div>
        </form>

        {/* Variant Form Modal */}
        {showVariantForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowVariantForm(false)}>
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Add Product Variant</h3>
                  <button
                    type="button"
                    onClick={() => setShowVariantForm(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color
                      </label>
                      <input
                        type="color"
                        value={currentVariant.color}
                        onChange={(e) => setCurrentVariant(prev => ({ ...prev, color: e.target.value }))}
                        className="w-full h-12 rounded border cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color Name *
                      </label>
                      <input
                        type="text"
                        value={currentVariant.colorName}
                        onChange={(e) => setCurrentVariant(prev => ({ ...prev, colorName: e.target.value }))}
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="e.g., Black, Navy Blue"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Size *
                      </label>
                      <select
                        value={currentVariant.size}
                        onChange={(e) => setCurrentVariant(prev => ({ ...prev, size: e.target.value }))}
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        {SIZES.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock Quantity *
                      </label>
                      <input
                        type="number"
                        value={currentVariant.stock}
                        onChange={(e) => setCurrentVariant(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-2 border rounded-lg"
                        min="0"
                        placeholder="50"
                      />
                    </div>
                  </div>

                  {/* Front Image Upload - SIMPLE VERSION */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Front Image *
                    </label>
                    <CldUploadWidget
                      uploadPreset="for-products"
                      onSuccess={(result: any) => {
                        if (result?.info?.secure_url) {
                          setCurrentVariant(prev => ({
                            ...prev,
                            frontImage: result.info.secure_url
                          }));
                        }
                      }}
                    >
                      {({ open }) => (
                        <div
                          onClick={() => open && open()}
                          className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition cursor-pointer"
                        >
                          {currentVariant.frontImage ? (
                            <div>
                              <img
                                src={currentVariant.frontImage}
                                alt="Front"
                                className="w-full h-48 object-contain rounded mb-2 bg-gray-50"
                              />
                              <p className="text-xs text-green-600 font-semibold text-center">✓ Front image uploaded</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2 py-12">
                              <Upload className="w-10 h-10 text-gray-400" />
                              <span className="text-sm text-gray-600 font-medium">Click to Upload Front Image</span>
                            </div>
                          )}
                        </div>
                      )}
                    </CldUploadWidget>
                  </div>

                  {/* Back Image Upload - SIMPLE VERSION */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Back Image *
                    </label>
                    <CldUploadWidget
                      uploadPreset="for-products"
                      onSuccess={(result: any) => {
                        if (result?.info?.secure_url) {
                          setCurrentVariant(prev => ({
                            ...prev,
                            backImage: result.info.secure_url
                          }));
                        }
                      }}
                    >
                      {({ open }) => (
                        <div
                          onClick={() => open && open()}
                          className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition cursor-pointer"
                        >
                          {currentVariant.backImage ? (
                            <div>
                              <img
                                src={currentVariant.backImage}
                                alt="Back"
                                className="w-full h-48 object-contain rounded mb-2 bg-gray-50"
                              />
                              <p className="text-xs text-green-600 font-semibold text-center">✓ Back image uploaded</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2 py-12">
                              <Upload className="w-10 h-10 text-gray-400" />
                              <span className="text-sm text-gray-600 font-medium">Click to Upload Back Image</span>
                            </div>
                          )}
                        </div>
                      )}
                    </CldUploadWidget>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddVariant}
                    disabled={!currentVariant.frontImage || !currentVariant.backImage}
                    className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {!currentVariant.frontImage || !currentVariant.backImage
                      ? 'Upload both images to continue'
                      : 'Add Variant'}
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