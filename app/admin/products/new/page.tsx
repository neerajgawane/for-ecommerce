/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CldUploadWidget } from 'next-cloudinary';
import { Plus, Trash2, Upload, X, ChevronDown, ChevronUp, ImagePlus, Package } from 'lucide-react';

interface ColorGroup {
  id: string;
  color: string;
  colorName: string;
  frontImage: string;
  backImage: string;
  extraImages: string[];
  selectedSizes: string[];
  stockPerSize: Record<string, number>;
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const GENDERS = ['Men', 'Women', 'Unisex'];
const FITS = ['Regular', 'Slim', 'Oversized', 'Relaxed'];
const CATEGORIES = ['T-Shirt', 'Hoodie', 'Sweatshirt', 'Tank Top', 'Polo'];

const PRESET_COLORS = [
  { color: '#000000', name: 'Black' },
  { color: '#FFFFFF', name: 'White' },
  { color: '#1B2A4A', name: 'Navy Blue' },
  { color: '#808080', name: 'Grey' },
  { color: '#8B0000', name: 'Maroon' },
  { color: '#556B2F', name: 'Olive Green' },
  { color: '#F5F5DC', name: 'Beige' },
  { color: '#4169E1', name: 'Royal Blue' },
];

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Colors & Images, 3: Review

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [printPrice, setPrintPrice] = useState('');
  const [category, setCategory] = useState('t-shirt');
  const [selectedGender, setSelectedGender] = useState('men');
  const [selectedFit, setSelectedFit] = useState('regular');
  const [isFeatured, setIsFeatured] = useState(false);

  // Color groups
  const [colorGroups, setColorGroups] = useState<ColorGroup[]>([]);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  // Add a new color group
  const addColorGroup = (presetColor?: { color: string; name: string }) => {
    const newGroup: ColorGroup = {
      id: generateId(),
      color: presetColor?.color || '#000000',
      colorName: presetColor?.name || '',
      frontImage: '',
      backImage: '',
      extraImages: [],
      selectedSizes: ['S', 'M', 'L', 'XL', 'XXL'],
      stockPerSize: { S: 50, M: 50, L: 50, XL: 50, XXL: 50 },
    };
    setColorGroups(prev => [...prev, newGroup]);
    setExpandedGroup(newGroup.id);
  };

  // Update a color group (functional updater to avoid stale closures from CldUploadWidget)
  const updateColorGroup = (id: string, updates: Partial<ColorGroup>) => {
    setColorGroups(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  // Remove a color group
  const removeColorGroup = (id: string) => {
    setColorGroups(prev => prev.filter(g => g.id !== id));
    if (expandedGroup === id) setExpandedGroup(null);
  };

  // Toggle size for a color group
  const toggleSize = (groupId: string, size: string) => {
    const group = colorGroups.find(g => g.id === groupId);
    if (!group) return;

    const newSizes = group.selectedSizes.includes(size)
      ? group.selectedSizes.filter(s => s !== size)
      : [...group.selectedSizes, size];

    const newStock = { ...group.stockPerSize };
    if (!newStock[size]) newStock[size] = 50;

    updateColorGroup(groupId, { selectedSizes: newSizes, stockPerSize: newStock });
  };

  // Select/deselect all sizes
  const toggleAllSizes = (groupId: string) => {
    const group = colorGroups.find(g => g.id === groupId);
    if (!group) return;

    if (group.selectedSizes.length === SIZES.length) {
      updateColorGroup(groupId, { selectedSizes: [], stockPerSize: {} });
    } else {
      const allStock: Record<string, number> = {};
      SIZES.forEach(s => { allStock[s] = group.stockPerSize[s] || 50; });
      updateColorGroup(groupId, { selectedSizes: [...SIZES], stockPerSize: allStock });
    }
  };

  // Update stock for a size
  const updateStock = (groupId: string, size: string, stock: number) => {
    const group = colorGroups.find(g => g.id === groupId);
    if (!group) return;
    updateColorGroup(groupId, {
      stockPerSize: { ...group.stockPerSize, [size]: stock }
    });
  };

  // Set uniform stock for all sizes
  const setUniformStock = (groupId: string, stock: number) => {
    const group = colorGroups.find(g => g.id === groupId);
    if (!group) return;
    const newStock: Record<string, number> = {};
    group.selectedSizes.forEach(s => { newStock[s] = stock; });
    updateColorGroup(groupId, { stockPerSize: newStock });
  };

  // Select gender
  const selectGender = (gender: string) => {
    setSelectedGender(gender.toLowerCase());
  };

  // Select fit
  const selectFit = (fit: string) => {
    setSelectedFit(fit.toLowerCase());
  };

  // Build variants from color groups
  const buildVariants = () => {
    const variants: any[] = [];
    for (const group of colorGroups) {
      if (!group.frontImage) continue;
      for (const size of group.selectedSizes) {
        variants.push({
          color: group.color,
          colorName: group.colorName,
          size,
          frontImage: group.frontImage,
          backImage: group.backImage || group.frontImage,
          stock: group.stockPerSize[size] || 50,
        });
      }
    }
    return variants;
  };

  // Count total variants
  const totalVariants = colorGroups.reduce((sum, g) => sum + g.selectedSizes.length, 0);

  // Validate current step
  const validateStep = (s: number) => {
    if (s === 1) {
      if (!name.trim()) return 'Product name is required';
      if (!basePrice || parseInt(basePrice) <= 0) return 'Base price is required';
      if (!printPrice) return 'Print price is required';
      return null;
    }
    if (s === 2) {
      if (colorGroups.length === 0) return 'Add at least one color variant';
      for (const group of colorGroups) {
        if (!group.colorName.trim()) return `Color name is required for all colors`;
        if (!group.frontImage) return `Front image is required for ${group.colorName || 'a color'}`;
        if (group.selectedSizes.length === 0) return `Select at least one size for ${group.colorName}`;
      }
      return null;
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      const variants = buildVariants();
      const productData = {
        name,
        description: description || null,
        basePrice: parseInt(basePrice),
        printPrice: parseInt(printPrice),
        category: category.toLowerCase(),
        gender: selectedGender,
        fit: selectedFit,
        isFeatured,
        variants,
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`✅ Product "${name}" created with ${variants.length} variants!`);
        router.push('/admin/products');
        router.refresh();
      } else {
        setError(data.error || 'Failed to create product');
      }
    } catch (err) {
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

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[
            { num: 1, label: 'Basic Info' },
            { num: 2, label: 'Colors & Images' },
            { num: 3, label: 'Review' },
          ].map(({ num, label }) => (
            <div key={num} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
                step >= num ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {num}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${step >= num ? 'text-gray-900' : 'text-gray-400'}`}>
                {label}
              </span>
              {num < 3 && <div className={`flex-1 h-px ${step > num ? 'bg-black' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="e.g., Classic Round Neck T-Shirt"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Premium quality t-shirt made with 100% cotton..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹) *</label>
                    <input
                      type="number"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="799"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Print Price (₹) *</label>
                    <input
                      type="number"
                      value={printPrice}
                      onChange={(e) => setPrintPrice(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="200"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Options</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                  <div className="flex flex-wrap gap-2">
                    {GENDERS.map(gender => (
                      <button
                        key={gender}
                        type="button"
                        onClick={() => selectGender(gender)}
                        className={`px-4 py-2 rounded-lg font-medium transition border ${
                          selectedGender === gender.toLowerCase()
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fit *</label>
                  <div className="flex flex-wrap gap-2">
                    {FITS.map(fit => (
                      <button
                        key={fit}
                        type="button"
                        onClick={() => selectFit(fit)}
                        className={`px-4 py-2 rounded-lg font-medium transition border ${
                          selectedFit === fit.toLowerCase()
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
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
                    className="w-4 h-4 rounded focus:ring-black accent-black"
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                    Mark as Featured Product
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
              >
                Next: Colors & Images →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Colors & Images */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Quick add preset colors */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Quick Add Colors</h2>
              <p className="text-sm text-gray-500 mb-4">Click to add a color variant with default sizes</p>
              <div className="flex flex-wrap gap-3">
                {PRESET_COLORS.map((preset) => {
                  const alreadyAdded = colorGroups.some(g => g.color === preset.color);
                  return (
                    <button
                      key={preset.color}
                      type="button"
                      onClick={() => !alreadyAdded && addColorGroup(preset)}
                      disabled={alreadyAdded}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition text-sm ${
                        alreadyAdded
                          ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 hover:border-black text-gray-700'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-gray-200 flex-shrink-0"
                        style={{ backgroundColor: preset.color }}
                      />
                      {preset.name}
                      {alreadyAdded && <span className="text-xs">✓</span>}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => addColorGroup()}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-400 text-gray-600 hover:border-black hover:text-black transition text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Custom Color
                </button>
              </div>
            </div>

            {/* Color groups */}
            {colorGroups.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No colors added yet</p>
                <p className="text-sm text-gray-400 mt-1">Add colors above to start uploading images</p>
              </div>
            ) : (
              <div className="space-y-4">
                {colorGroups.map((group) => {
                  const isExpanded = expandedGroup === group.id;
                  return (
                    <div key={group.id} className="bg-white rounded-lg shadow overflow-hidden">
                      {/* Color group header */}
                      <div
                        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                      >
                        <span
                          className="w-8 h-8 rounded-full border-2 border-gray-200 flex-shrink-0"
                          style={{ backgroundColor: group.color }}
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {group.colorName || 'Unnamed Color'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {group.selectedSizes.length} sizes • {group.frontImage ? '✓ Images uploaded' : '⚠ No images'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeColorGroup(group.id); }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Remove color"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </div>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="border-t p-4 space-y-5">
                          {/* Color picker + name */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                              <input
                                type="color"
                                value={group.color}
                                onChange={(e) => updateColorGroup(group.id, { color: e.target.value })}
                                className="w-full h-10 rounded border cursor-pointer"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Color Name *</label>
                              <input
                                type="text"
                                value={group.colorName}
                                onChange={(e) => updateColorGroup(group.id, { colorName: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                placeholder="e.g., Midnight Black"
                              />
                            </div>
                          </div>

                          {/* Image uploads */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                              {/* Front image */}
                              <CldUploadWidget
                                uploadPreset="for-products"
                                onSuccess={(result: any) => {
                                  if (result?.info?.secure_url) {
                                    updateColorGroup(group.id, { frontImage: result.info.secure_url });
                                  }
                                }}
                              >
                                {({ open }) => (
                                  <div
                                    onClick={() => open && open()}
                                    className="aspect-square border-2 border-dashed border-gray-300 rounded-lg hover:border-black transition cursor-pointer overflow-hidden relative group/img"
                                  >
                                    {group.frontImage ? (
                                      <>
                                        <img src={group.frontImage} alt="Front" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center">
                                          <span className="text-white text-xs font-medium">Change</span>
                                        </div>
                                        <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">Front</span>
                                      </>
                                    ) : (
                                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                        <Upload className="w-6 h-6 mb-1" />
                                        <span className="text-xs font-medium">Front *</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </CldUploadWidget>

                              {/* Back image */}
                              <CldUploadWidget
                                uploadPreset="for-products"
                                onSuccess={(result: any) => {
                                  if (result?.info?.secure_url) {
                                    updateColorGroup(group.id, { backImage: result.info.secure_url });
                                  }
                                }}
                              >
                                {({ open }) => (
                                  <div
                                    onClick={() => open && open()}
                                    className="aspect-square border-2 border-dashed border-gray-300 rounded-lg hover:border-black transition cursor-pointer overflow-hidden relative group/img"
                                  >
                                    {group.backImage ? (
                                      <>
                                        <img src={group.backImage} alt="Back" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center">
                                          <span className="text-white text-xs font-medium">Change</span>
                                        </div>
                                        <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">Back</span>
                                      </>
                                    ) : (
                                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                        <Upload className="w-6 h-6 mb-1" />
                                        <span className="text-xs font-medium">Back</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </CldUploadWidget>

                              {/* Extra images */}
                              {group.extraImages.map((img, idx) => (
                                <div key={idx} className="aspect-square border rounded-lg overflow-hidden relative group/img">
                                  <img src={img} alt={`Extra ${idx + 1}`} className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newImages = group.extraImages.filter((_, i) => i !== idx);
                                      updateColorGroup(group.id, { extraImages: newImages });
                                    }}
                                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                  <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">Extra</span>
                                </div>
                              ))}

                              {/* Add more images */}
                              <CldUploadWidget
                                uploadPreset="for-products"
                                onSuccess={(result: any) => {
                                  if (result?.info?.secure_url) {
                                    updateColorGroup(group.id, {
                                      extraImages: [...group.extraImages, result.info.secure_url]
                                    });
                                  }
                                }}
                              >
                                {({ open }) => (
                                  <div
                                    onClick={() => open && open()}
                                    className="aspect-square border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-400 transition cursor-pointer flex flex-col items-center justify-center text-gray-300 hover:text-gray-500"
                                  >
                                    <ImagePlus className="w-6 h-6 mb-1" />
                                    <span className="text-xs">Add More</span>
                                  </div>
                                )}
                              </CldUploadWidget>
                            </div>
                          </div>

                          {/* Size selection */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm font-medium text-gray-700">Available Sizes *</label>
                              <button
                                type="button"
                                onClick={() => toggleAllSizes(group.id)}
                                className="text-xs text-gray-500 underline hover:text-black transition"
                              >
                                {group.selectedSizes.length === SIZES.length ? 'Deselect All' : 'Select All'}
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {SIZES.map(size => (
                                <button
                                  key={size}
                                  type="button"
                                  onClick={() => toggleSize(group.id, size)}
                                  className={`w-12 h-10 rounded border font-medium text-sm transition ${
                                    group.selectedSizes.includes(size)
                                      ? 'bg-black text-white border-black'
                                      : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
                                  }`}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Stock per size */}
                          {group.selectedSizes.length > 0 && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-gray-700">Stock per Size</label>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-400">Set all to:</span>
                                  <input
                                    type="number"
                                    min="0"
                                    placeholder="50"
                                    className="w-16 px-2 py-1 border rounded text-xs text-center"
                                    onBlur={(e) => {
                                      const val = parseInt(e.target.value);
                                      if (!isNaN(val)) setUniformStock(group.id, val);
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        const val = parseInt((e.target as HTMLInputElement).value);
                                        if (!isNaN(val)) setUniformStock(group.id, val);
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                                {group.selectedSizes.map(size => (
                                  <div key={size} className="text-center">
                                    <span className="block text-[10px] text-gray-400 uppercase mb-1">{size}</span>
                                    <input
                                      type="number"
                                      min="0"
                                      value={group.stockPerSize[size] || 0}
                                      onChange={(e) => updateStock(group.id, size, parseInt(e.target.value) || 0)}
                                      className="w-full px-1 py-1.5 border rounded text-center text-sm"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
              >
                Next: Review →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Product</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs uppercase text-gray-400 tracking-wider">Name</span>
                    <p className="font-semibold text-lg">{name}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-gray-400 tracking-wider">Category</span>
                    <p className="font-medium capitalize">{category}</p>
                  </div>
                </div>

                {description && (
                  <div>
                    <span className="text-xs uppercase text-gray-400 tracking-wider">Description</span>
                    <p className="text-gray-700 text-sm mt-0.5">{description}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs uppercase text-gray-400 tracking-wider">Total Price</span>
                    <p className="font-bold text-lg">₹{(parseInt(basePrice) || 0) + (parseInt(printPrice) || 0)}</p>
                    <p className="text-[10px] text-gray-400">Base ₹{basePrice} + Print ₹{printPrice}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-gray-400 tracking-wider">Gender</span>
                    <p className="font-medium capitalize">{selectedGender}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-gray-400 tracking-wider">Fit</span>
                    <p className="font-medium capitalize">{selectedFit}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <span className="text-xs uppercase text-gray-400 tracking-wider">
                    Color Variants ({colorGroups.length} colors, {totalVariants} total variants)
                  </span>
                  <div className="mt-3 space-y-3">
                    {colorGroups.map((group) => (
                      <div key={group.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <span
                          className="w-10 h-10 rounded-full border-2 border-white shadow flex-shrink-0"
                          style={{ backgroundColor: group.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{group.colorName}</p>
                          <p className="text-xs text-gray-500">
                            Sizes: {group.selectedSizes.join(', ')}
                          </p>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          {group.frontImage && (
                            <img src={group.frontImage} alt="Front" className="w-12 h-12 object-cover rounded border" />
                          )}
                          {group.backImage && (
                            <img src={group.backImage} alt="Back" className="w-12 h-12 object-cover rounded border" />
                          )}
                          {group.extraImages.slice(0, 1).map((img, i) => (
                            <img key={i} src={img} alt="Extra" className="w-12 h-12 object-cover rounded border" />
                          ))}
                          {group.extraImages.length > 1 && (
                            <div className="w-12 h-12 rounded border bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                              +{group.extraImages.length - 1}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                ← Edit
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Product...' : `Create Product (${totalVariants} variants)`}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}