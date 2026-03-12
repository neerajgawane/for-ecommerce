'use client';

import { useState, useEffect, useRef } from 'react';
import { Canvas as FabricCanvas, FabricImage, IText, FabricObject } from 'fabric';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import {
  Upload, Type, Trash2, Download, Save, ShoppingCart, Eye, Palette,
  Undo, Redo, RotateCcw, Plus, Minus, Zap, Check
} from 'lucide-react';

interface CanvasHistory {
  state: Record<string, unknown>;
}

export default function DesignStudio() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<CanvasHistory[]>([]);
  const historyStepRef = useRef<number>(-1);

  const addItem = useCartStore((state) => state.addItem);

  const [tshirtColor, setTshirtColor] = useState('#FFFFFF');
  const [tshirtGender, setTshirtGender] = useState('men');
  const [tshirtFit, setTshirtFit] = useState('regular');
  const [tshirtSize, setTshirtSize] = useState('M');
  const [designSide, setDesignSide] = useState<'front' | 'back'>('front');

  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);
  const [canUpdate, setCanUpdate] = useState(true);

  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState('Arial Black');

  const [isSaving, setIsSaving] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const colors = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Navy', hex: '#1e3a8a' },
    { name: 'Gray', hex: '#6b7280' },
    { name: 'Pink', hex: '#ec4899' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Green', hex: '#10b981' },
    { name: 'Purple', hex: '#a855f7' },
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

  const fonts = [
    'Arial Black',
    'Impact',
    'Helvetica',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Comic Sans MS',
    'Verdana'
  ];

  const getColorFilter = () => {
    const filters: Record<string, string> = {
      '#000000': 'brightness(0) saturate(100%)',
      '#FFFFFF': 'brightness(100%) saturate(0%)',
      '#1e3a8a': 'brightness(0.35) saturate(200%) hue-rotate(220deg)',
      '#6b7280': 'brightness(0.5) saturate(0%)',
      '#ec4899': 'brightness(1.1) saturate(200%) hue-rotate(330deg)',
      '#3b82f6': 'brightness(0.85) saturate(250%) hue-rotate(210deg)',
      '#10b981': 'brightness(0.9) saturate(200%) hue-rotate(145deg)',
      '#a855f7': 'brightness(1) saturate(200%) hue-rotate(270deg)',
    };
    return filters[tshirtColor] || 'none';
  };

  // Show toast notification
  const showNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const saveToHistory = () => {
    if (!fabricCanvasRef.current) return;

    const json = fabricCanvasRef.current.toJSON();
    historyStepRef.current += 1;
    historyRef.current = historyRef.current.slice(0, historyStepRef.current);
    historyRef.current.push({ state: json });
    setCanUpdate(!canUpdate);
  };

  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 280,
      height: 350,
      backgroundColor: 'transparent',
    });

    fabricCanvasRef.current = canvas;
    setIsCanvasReady(true);
    saveToHistory();

    canvas.on('selection:created', (e) => {
      const obj = e.selected?.[0];
      setSelectedObject(obj || null);
      if (obj && obj.type === 'i-text') {
        setTextColor(obj.get('fill') as string || '#000000');
        setFontSize(obj.get('fontSize') as number || 32);
        setFontFamily(obj.get('fontFamily') as string || 'Arial Black');
      }
    });

    canvas.on('selection:updated', (e) => {
      const obj = e.selected?.[0];
      setSelectedObject(obj || null);
      if (obj && obj.type === 'i-text') {
        setTextColor(obj.get('fill') as string || '#000000');
        setFontSize(obj.get('fontSize') as number || 32);
        setFontFamily(obj.get('fontFamily') as string || 'Arial Black');
      }
    });

    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    canvas.on('object:added', saveToHistory);
    canvas.on('object:modified', saveToHistory);
    canvas.on('object:removed', saveToHistory);

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  const undo = () => {
    if (historyStepRef.current <= 0 || !fabricCanvasRef.current) return;

    historyStepRef.current -= 1;
    const previousState = historyRef.current[historyStepRef.current].state;

    fabricCanvasRef.current.loadFromJSON(previousState, () => {
      fabricCanvasRef.current?.renderAll();
      setCanUpdate(!canUpdate);
    });
  };

  const redo = () => {
    if (historyStepRef.current >= historyRef.current.length - 1 || !fabricCanvasRef.current) return;

    historyStepRef.current += 1;
    const nextState = historyRef.current[historyStepRef.current].state;

    fabricCanvasRef.current.loadFromJSON(nextState, () => {
      fabricCanvasRef.current?.renderAll();
      setCanUpdate(!canUpdate);
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricCanvasRef.current) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 180;
        const scale = maxWidth / img.width;
        const fabricImg = new FabricImage(img, {
          left: 50,
          top: 80,
          scaleX: scale,
          scaleY: scale,
        });
        fabricCanvasRef.current?.add(fabricImg);
        fabricCanvasRef.current?.setActiveObject(fabricImg);
        fabricCanvasRef.current?.renderAll();
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const addText = () => {
    if (!fabricCanvasRef.current) return;

    const text = new IText('YOUR TEXT', {
      left: 60,
      top: 150,
      fontSize,
      fontWeight: 'bold',
      fill: textColor,
      fontFamily,
    });

    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
  };

  const updateTextColor = (color: string) => {
    setTextColor(color);
    if (selectedObject && selectedObject.type === 'i-text') {
      selectedObject.set('fill', color);
      fabricCanvasRef.current?.renderAll();
    }
  };

  const updateFontSize = (size: number) => {
    setFontSize(size);
    if (selectedObject && selectedObject.type === 'i-text') {
      selectedObject.set('fontSize', size);
      fabricCanvasRef.current?.renderAll();
    }
  };

  const updateFontFamily = (font: string) => {
    setFontFamily(font);
    if (selectedObject && selectedObject.type === 'i-text') {
      selectedObject.set('fontFamily', font);
      fabricCanvasRef.current?.renderAll();
    }
  };

  const deleteSelected = () => {
    if (!fabricCanvasRef.current || !selectedObject) return;
    fabricCanvasRef.current.remove(selectedObject);
    setSelectedObject(null);
    fabricCanvasRef.current.renderAll();
  };

  const clearCanvas = () => {
    if (!fabricCanvasRef.current) return;
    fabricCanvasRef.current.clear();
    fabricCanvasRef.current.backgroundColor = 'transparent';
    fabricCanvasRef.current.renderAll();
  };

  const downloadDesign = () => {
    if (!fabricCanvasRef.current) return;
    const link = document.createElement('a');
    link.download = `for-design-${designSide}.png`;
    link.href = fabricCanvasRef.current.toDataURL({
      format: 'png', quality: 1,
      multiplier: 0
    });
    link.click();
    showNotification('Design downloaded successfully!');
  };

  // SAVE DESIGN - Saves to database for later editing
  const saveDesign = async () => {
    if (!fabricCanvasRef.current) return;

    setIsSaving(true);
    try {
      const designData = fabricCanvasRef.current.toJSON();
      const imageData = fabricCanvasRef.current.toDataURL({
        format: 'png', quality: 1,
        multiplier: 0
      });

      // TODO: Actually save to database via API
      // const response = await fetch('/api/designs', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     designData,
      //     imageData,
      //     tshirtColor,
      //     tshirtSize,
      //     tshirtGender,
      //     tshirtFit,
      //     designSide
      //   })
      // });

      console.log('Saving design to database:', { designData, imageData });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      showNotification('Design saved to your account!');
    } catch (error) {
      console.error('Save error:', error);
      showNotification('Failed to save design');
    } finally {
      setIsSaving(false);
    }
  };

  const calculatePrice = () => {
    let price = 399;
    if (designSide === 'front' || designSide === 'back') price += 100;
    return price;
  };

  // ADD TO CART - Shows toast notification, stays on page
  const handleAddToCart = async () => {
    if (!fabricCanvasRef.current) {
      showNotification('Please create a design first!');
      return;
    }

    setIsAddingToCart(true);

    try {
      const designImage = fabricCanvasRef.current.toDataURL({
        format: 'png', quality: 1,
        multiplier: 0
      });
      const price = calculatePrice();

      addItem({
        designId: `design-${Date.now()}`,
        designName: `Custom ${tshirtGender} T-Shirt`,
        designImage,
        size: tshirtSize,
        color: tshirtColor,
        gender: tshirtGender,
        fit: tshirtFit,
        hasFront: designSide === 'front',
        hasBack: designSide === 'back',
        quantity: 1,
        price,
      });

      // Show success notification - DON'T redirect
      showNotification('Added to cart! 🎉');
      setIsAddingToCart(false);
    } catch (error) {
      console.error('Add to cart error:', error);
      showNotification('Failed to add to cart');
      setIsAddingToCart(false);
    }
  };

  // BUY NOW - Adds to cart AND redirects to checkout
  const handleBuyNow = async () => {
    if (!fabricCanvasRef.current) {
      showNotification('Please create a design first!');
      return;
    }

    setIsAddingToCart(true);

    try {
      const designImage = fabricCanvasRef.current.toDataURL({
        format: 'png', quality: 1,
        multiplier: 0
      });
      const price = calculatePrice();

      addItem({
        designId: `design-${Date.now()}`,
        designName: `Custom ${tshirtGender} T-Shirt`,
        designImage,
        size: tshirtSize,
        color: tshirtColor,
        gender: tshirtGender,
        fit: tshirtFit,
        hasFront: designSide === 'front',
        hasBack: designSide === 'back',
        quantity: 1,
        price,
      });

      // Redirect to cart for checkout
      router.push('/cart');
    } catch (error) {
      console.error('Buy now error:', error);
      showNotification('Failed to process');
      setIsAddingToCart(false);
    }
  };

  const canUndo = historyStepRef.current > 0;
  const canRedo = historyStepRef.current < historyRef.current.length - 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 right-6 z-50 animate-slide-in-right">
          <div className="bg-black text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3">
            <Check className="w-5 h-5 text-green-400" />
            <p className="font-medium">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Design Studio</h1>
            <p className="text-sm text-gray-600">
              Designing {designSide} side • {tshirtSize} • {tshirtGender}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>
            <button
              onClick={saveDesign}
              disabled={isSaving}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
              title="Save design to your account for later"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-12 gap-6">

        {/* Left Sidebar */}
        <div className="col-span-3 space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold mb-4">T-Shirt Options</h3>

            <div className="mb-4">
              <label className="text-sm font-medium block mb-2">Gender</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTshirtGender('men')}
                  className={`py-2 rounded-lg text-sm font-medium transition ${tshirtGender === 'men' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                >
                  Men
                </button>
                <button
                  onClick={() => setTshirtGender('women')}
                  className={`py-2 rounded-lg text-sm font-medium transition ${tshirtGender === 'women' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                >
                  Women
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium block mb-2">Fit</label>
              <div className="grid grid-cols-3 gap-2">
                {['regular', 'oversized',].map((fit) => (
                  <button
                    key={fit}
                    onClick={() => setTshirtFit(fit)}
                    className={`py-2 rounded-lg text-xs font-medium capitalize transition ${tshirtFit === fit ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                  >
                    {fit}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Size</label>
              <div className="grid grid-cols-4 gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setTshirtSize(size)}
                    className={`py-2 rounded-lg text-sm font-medium transition ${tshirtSize === size ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold mb-4">Design Side</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDesignSide('front')}
                className={`py-3 rounded-lg font-medium transition ${designSide === 'front'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 hover:bg-gray-200'
                  }`}
              >
                Front
              </button>
              <button
                onClick={() => setDesignSide('back')}
                className={`py-3 rounded-lg font-medium transition ${designSide === 'back'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-gray-100 hover:bg-gray-200'
                  }`}
              >
                Back
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5" />
              <h3 className="font-semibold">T-Shirt Color</h3>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setTshirtColor(color.hex)}
                  className={`aspect-square rounded-lg border-2 transition hover:scale-110 ${tshirtColor === color.hex
                    ? 'border-black ring-2 ring-black ring-offset-2'
                    : 'border-gray-200'
                    }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold mb-4">Add Elements</h3>
            <div className="space-y-3">
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={!isCanvasReady}
                />
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition ${isCanvasReady
                  ? 'bg-blue-50 hover:bg-blue-100 border-blue-200'
                  : 'bg-gray-50 opacity-50 cursor-not-allowed'
                  }`}>
                  <Upload className="w-5 h-5 text-blue-600" />
                  <div className="text-left">
                    <p className="font-medium text-sm">Upload Image</p>
                    <p className="text-xs text-gray-500">PNG, JPG</p>
                  </div>
                </div>
              </label>

              <button
                onClick={addText}
                disabled={!isCanvasReady}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition ${isCanvasReady
                  ? 'bg-purple-50 hover:bg-purple-100 border-purple-200'
                  : 'bg-gray-50 opacity-50 cursor-not-allowed'
                  }`}
              >
                <Type className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <p className="font-medium text-sm">Add Text</p>
                  <p className="text-xs text-gray-500">Editable text</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Center Canvas */}
        <div className="col-span-6">
          <div className="bg-white rounded-xl border p-8">

            <div className="flex justify-between mb-6 pb-4 border-b">
              <div className="font-semibold">Canvas</div>
              <div className="flex gap-2">
                <button
                  onClick={clearCanvas}
                  className="px-3 py-2 text-sm border rounded hover:bg-gray-50 flex items-center gap-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear All
                </button>
                <button
                  onClick={downloadDesign}
                  className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800 flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            <div
              ref={mockupRef}
              className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-8 flex justify-center items-center"
              style={{ minHeight: '650px' }}
            >
              <div className="relative" style={{ width: '450px', height: '550px' }}>

                <img
                  src={`/mockups/tshirt-white-${designSide}.png`}
                  alt={`T-Shirt ${designSide}`}
                  className="absolute inset-0 w-full h-full object-contain transition-all duration-300"
                  style={{
                    filter: getColorFilter(),
                  }}
                  onError={(e) => {
                    console.warn('Mockup image not found');
                    e.currentTarget.style.display = 'none';
                  }}
                />

                <div
                  className="absolute pointer-events-auto"
                  style={{
                    top: '22%',
                    left: '19%',
                    width: '62%',
                    height: '55%',
                    zIndex: 10,
                  }}
                >
                  <canvas ref={canvasRef} />
                </div>

                <div className="absolute top-4 right-4 bg-black text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase shadow-lg z-20">
                  {designSide}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-3 space-y-6">

          {selectedObject && selectedObject.type === 'i-text' && (
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold mb-4">Text Controls</h3>

              <div className="mb-4">
                <label className="text-sm font-medium block mb-2">Font</label>
                <select
                  value={fontFamily}
                  onChange={(e) => updateFontFamily(e.target.value)}
                  className="w-full p-2 border rounded-lg text-sm"
                >
                  {fonts.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium block mb-2">Size: {fontSize}px</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateFontSize(Math.max(12, fontSize - 4))}
                    className="p-2 border rounded hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="12"
                    max="72"
                    value={fontSize}
                    onChange={(e) => updateFontSize(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <button
                    onClick={() => updateFontSize(Math.min(72, fontSize + 4))}
                    className="p-2 border rounded hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium block mb-2">Text Color</label>
                <div className="grid grid-cols-4 gap-2">
                  {['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'].map((color) => (
                    <button
                      key={color}
                      onClick={() => updateTextColor(color)}
                      className={`aspect-square rounded-lg border-2 ${textColor === color ? 'border-black ring-2 ring-black ring-offset-2' : 'border-gray-200'
                        }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={deleteSelected}
                className="w-full px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Text
              </button>
            </div>
          )}

          {selectedObject && selectedObject.type !== 'i-text' && (
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold mb-4">Image Controls</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-2">Opacity</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    defaultValue="1"
                    onChange={(e) => {
                      if (selectedObject) {
                        selectedObject.set('opacity', parseFloat(e.target.value));
                        fabricCanvasRef.current?.renderAll();
                      }
                    }}
                    className="w-full"
                  />
                </div>
                <button
                  onClick={deleteSelected}
                  className="w-full px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Image
                </button>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white">
            <h3 className="font-semibold mb-4">Price Summary</h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span>Base T-Shirt ({tshirtSize})</span>
                <span>₹399</span>
              </div>
              <div className="flex justify-between">
                <span>{designSide === 'front' ? 'Front' : 'Back'} Print</span>
                <span>₹100</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>{tshirtGender} • {tshirtFit} fit</span>
              </div>
            </div>
            <div className="border-t border-gray-700 pt-3 flex justify-between font-bold text-lg mb-4">
              <span>Total</span>
              <span>₹{calculatePrice()}</span>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="w-full bg-white text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAddingToCart ? (
                  'Adding...'
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isAddingToCart}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-500 hover:to-pink-500 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAddingToCart ? (
                  'Processing...'
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Buy Now
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white">
            <Eye className="w-6 h-6 mb-2" />
            <h3 className="font-semibold mb-2">AI Try-On</h3>
            <p className="text-sm text-purple-100 mb-4">Preview on virtual model</p>
            <button className="w-full bg-white text-purple-600 py-3 rounded-lg font-semibold opacity-50 cursor-not-allowed">
              Coming Soon
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}