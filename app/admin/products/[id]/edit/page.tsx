/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params); // ✅ Use React.use() to unwrap params
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('🔍 Fetching product:', id);
        const res = await fetch(`/api/admin/products/${id}`);

        console.log('📥 Response status:', res.status);

        if (!res.ok) {
          throw new Error('Product not found');
        }

        const data = await res.json();
        console.log('📦 Product data:', data);
        setProduct(data.product);
      } catch (error) {
        console.error('❌ Error fetching product:', error);
        alert('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-red-600 mb-4">Product not found</p>
            <button
              onClick={() => router.push('/admin/products')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-600 mt-1">Product ID: {product.id}</p>
        </div>

        {/* Product Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              ⚠️ Full edit functionality coming soon! For now, you can view product details here.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <p className="text-gray-900 font-semibold text-lg">{product.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <p className="text-gray-900 capitalize">{product.category}</p>
              </div>
            </div>

            {product.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-900">{product.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Price</label>
                <p className="text-gray-900 font-semibold">₹{product.basePrice}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Print Price</label>
                <p className="text-gray-900 font-semibold">₹{product.printPrice}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                <p className="text-gray-900 font-semibold">{product.stockCount}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Featured</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.isFeatured ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                  {product.isFeatured ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            {product.variants && product.variants.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Product Variants ({product.variants.length})
                </label>
                <div className="space-y-3">
                  {product.variants.map((variant: any) => (
                    <div key={variant.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
                      <div
                        className="w-12 h-12 rounded border-2 border-white shadow"
                        style={{ backgroundColor: variant.color }}
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{variant.colorName} - Size {variant.size}</p>
                        <p className="text-sm text-gray-600">Stock: {variant.stock} units • SKU: {variant.sku}</p>
                      </div>
                      <div className="flex gap-2">
                        {variant.frontImage && (
                          <img
                            src={variant.frontImage}
                            alt="Front"
                            className="w-16 h-16 object-cover rounded border"
                          />
                        )}
                        {variant.backImage && (
                          <img
                            src={variant.backImage}
                            alt="Back"
                            className="w-16 h-16 object-cover rounded border"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => router.push('/admin/products')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Back to Products
            </button>
            <button
              disabled
              className="flex-1 px-6 py-3 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
              title="Edit functionality coming soon"
            >
              Save Changes (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}