'use client';

import { useState, useEffect, useRef } from 'react';
import { Canvas as FabricCanvas, FabricImage, IText, FabricObject } from 'fabric';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import {
  Upload, Type, Trash2, Download, Save, ShoppingCart, Eye, Palette,
  Undo, Redo, RotateCcw, Plus, Minus, Zap, Check, Ruler
} from 'lucide-react';
import { useSession } from 'next-auth/react';

// ── Product types with per-type mockup, print area, and pricing ───────────────
interface ProductType {
  id: string;
  label: string;
  icon: string;
  gender: 'women' | 'men' | 'unisex';
  fit: string;
  mockupPrefix: string;  // e.g. 'tshirt-regular-women' → looks for /mockups/tshirt-regular-women-front.png
  basePrice: number;
  printArea: { top: number; left: number; width: number; height: number };
}

const PRODUCT_TYPES: ProductType[] = [
  {
    id: 'tshirt-women',
    label: "Women's Tee",
    icon: '👚',
    gender: 'women',
    fit: 'regular',
    mockupPrefix: 'tshirt-regular-women',
    basePrice: 399,
    printArea: { top: 0.20, left: 0.20, width: 0.60, height: 0.50 },
  },
  {
    id: 'tshirt-men',
    label: "Men's Tee",
    icon: '👕',
    gender: 'men',
    fit: 'regular',
    mockupPrefix: 'tshirt-regular-men',
    basePrice: 399,
    printArea: { top: 0.22, left: 0.19, width: 0.62, height: 0.55 },
  },
  {
    id: 'oversized',
    label: 'Oversized',
    icon: '🧥',
    gender: 'unisex',
    fit: 'oversized',
    mockupPrefix: 'tshirt-oversized-men',
    basePrice: 499,
    printArea: { top: 0.20, left: 0.17, width: 0.66, height: 0.58 },
  },
  {
    id: 'hoodie',
    label: 'Hoodie',
    icon: '🧢',
    gender: 'unisex',
    fit: 'hoodie',
    mockupPrefix: 'hoodie-unisex',
    basePrice: 799,
    printArea: { top: 0.28, left: 0.20, width: 0.60, height: 0.48 },
  },
];

// ── Print area pricing tiers ──────────────────────────────────────────────────
interface PrintTier {
  name: string;
  maxWidth: number;  // cm
  maxHeight: number; // cm
  price: number;     // INR
}

const PRINT_TIERS: PrintTier[] = [
  { name: 'Small',      maxWidth: 10, maxHeight: 10, price: 50  },
  { name: 'Medium',     maxWidth: 20, maxHeight: 20, price: 100 },
  { name: 'Large',      maxWidth: 30, maxHeight: 30, price: 150 },
  { name: 'Full Chest', maxWidth: 40, maxHeight: 40, price: 200 },
];

const BACK_PRINT_SURCHARGE = 100;

// Canvas pixels → cm conversion (based on 280px canvas ≈ 35cm real print area)
const PIXELS_TO_CM = 35 / 280;

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
  const { data: session } = useSession();

  const [tshirtColor, setTshirtColor] = useState('#FFFFFF');
  const [selectedProductType, setSelectedProductType] = useState<ProductType>(PRODUCT_TYPES[0]);
  const [tshirtSize, setTshirtSize] = useState('M');
  const [designSide, setDesignSide] = useState<'front' | 'back'>('front');
  const [mockupExists, setMockupExists] = useState<Record<string, boolean>>({});

  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);
  const [canUpdate, setCanUpdate] = useState(true);

  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState('Arial Black');

  const [isSaving, setIsSaving] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [savedDesignId, setSavedDesignId] = useState<string | null>(null);

  // Dynamic print size state
  const [printSize, setPrintSize] = useState<{
    widthCm: number;
    heightCm: number;
    tier: PrintTier;
  } | null>(null);

  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // ── Dual-side design state ────────────────────────────────────────────────
  const frontDataRef = useRef<{ json: Record<string, unknown> | null; designImage: string | null }>({
    json: null, designImage: null,
  });
  const backDataRef = useRef<{ json: Record<string, unknown> | null; designImage: string | null }>({
    json: null, designImage: null,
  });
  const [hasFrontDesign, setHasFrontDesign] = useState(false);
  const [hasBackDesign, setHasBackDesign] = useState(false);

  // Per-side undo/redo history
  const frontHistoryRef = useRef<CanvasHistory[]>([]);
  const frontHistoryStepRef = useRef<number>(-1);
  const backHistoryRef = useRef<CanvasHistory[]>([]);
  const backHistoryStepRef = useRef<number>(-1);
  const isSwitchingRef = useRef(false);

  // All colors use the clean white mockup + CSS mask/blend coloring
  // This ensures flat, ironed appearance and proper front/back switching
  const colors: { name: string; hex: string }[] = [
    { name: 'White',      hex: '#FFFFFF' },
    { name: 'Black',      hex: '#000000' },
    { name: 'Navy',       hex: '#1e3a8a' },
    { name: 'Charcoal',   hex: '#374151' },
    { name: 'Maroon',     hex: '#7f1d1d' },
    { name: 'Olive',      hex: '#4d7c0f' },
    { name: 'Sky Blue',   hex: '#38bdf8' },
    { name: 'Blush Pink', hex: '#fda4af' },
    { name: 'Lavender',   hex: '#c4b5fd' },
    { name: 'Mustard',    hex: '#eab308' },
    { name: 'Coral',      hex: '#fb7185' },
  ];

  // Get the mockup path for current product type + side (with fallback)
  const getMockupSrc = () => {
    const productKey = `${selectedProductType.mockupPrefix}-${designSide}`;
    if (mockupExists[productKey]) {
      return `/mockups/${selectedProductType.mockupPrefix}-${designSide}.png`;
    }
    // Fallback to generic white t-shirt mockup
    return `/mockups/tshirt-white-${designSide}.png`;
  };

  // Check if product-specific mockup assets exist
  useEffect(() => {
    const checkMockups = async () => {
      const results: Record<string, boolean> = {};
      for (const pt of PRODUCT_TYPES) {
        for (const side of ['front', 'back'] as const) {
          const key = `${pt.mockupPrefix}-${side}`;
          try {
            const res = await fetch(`/mockups/${pt.mockupPrefix}-${side}.png`, { method: 'HEAD' });
            results[key] = res.ok;
          } catch {
            results[key] = false;
          }
        }
      }
      setMockupExists(results);
    };
    checkMockups();
  }, []);

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

  // Show toast notification
  const showNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const saveToHistory = () => {
    if (!fabricCanvasRef.current || isSwitchingRef.current) return;

    const json = fabricCanvasRef.current.toJSON();
    historyStepRef.current += 1;
    historyRef.current = historyRef.current.slice(0, historyStepRef.current);
    historyRef.current.push({ state: json });
    setCanUpdate(!canUpdate);
  };

  // ── Switch between front/back sides ─────────────────────────────────────
  const switchSide = (newSide: 'front' | 'back') => {
    if (newSide === designSide || !fabricCanvasRef.current) return;
    isSwitchingRef.current = true;

    const canvas = fabricCanvasRef.current;
    const currentJSON = canvas.toJSON();
    const hasObjects = canvas.getObjects().length > 0;
    const currentDesignImage = hasObjects
      ? canvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 })
      : null;

    // Save current side
    if (designSide === 'front') {
      frontDataRef.current = { json: currentJSON, designImage: currentDesignImage };
      setHasFrontDesign(hasObjects);
      frontHistoryRef.current = [...historyRef.current];
      frontHistoryStepRef.current = historyStepRef.current;
    } else {
      backDataRef.current = { json: currentJSON, designImage: currentDesignImage };
      setHasBackDesign(hasObjects);
      backHistoryRef.current = [...historyRef.current];
      backHistoryStepRef.current = historyStepRef.current;
    }

    // Clear selection
    canvas.discardActiveObject();

    // Load target side
    const targetData = newSide === 'front' ? frontDataRef.current : backDataRef.current;

    if (targetData.json) {
      canvas.loadFromJSON(targetData.json, () => {
        canvas.requestRenderAll();
        canvas.calcOffset();
        isSwitchingRef.current = false;
        // Fallback re-render to handle async font loading
        setTimeout(() => {
          canvas.requestRenderAll();
        }, 100);
      });
    } else {
      canvas.clear();
      canvas.backgroundColor = 'transparent';
      canvas.requestRenderAll();
      isSwitchingRef.current = false;
    }

    // Restore history for target side
    if (newSide === 'front') {
      historyRef.current = [...frontHistoryRef.current];
      historyStepRef.current = frontHistoryStepRef.current;
    } else {
      historyRef.current = [...backHistoryRef.current];
      historyStepRef.current = backHistoryStepRef.current;
    }

    setDesignSide(newSide);
    setSelectedObject(null);
    setCanUpdate(prev => !prev);
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

    // Object containment — keep designs within canvas bounds
    canvas.on('object:moving', (e) => {
      const obj = e.target;
      if (!obj) return;
      const bound = obj.getBoundingRect();
      if (bound.left < 0) obj.set('left', (obj.left ?? 0) - bound.left);
      if (bound.top < 0) obj.set('top', (obj.top ?? 0) - bound.top);
      if (bound.left + bound.width > 280)
        obj.set('left', (obj.left ?? 0) - (bound.left + bound.width - 280));
      if (bound.top + bound.height > 350)
        obj.set('top', (obj.top ?? 0) - (bound.top + bound.height - 350));
    });

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
    // Update design flag for current side
    if (designSide === 'front') {
      setHasFrontDesign(false);
      frontDataRef.current = { json: null, designImage: null };
    } else {
      setHasBackDesign(false);
      backDataRef.current = { json: null, designImage: null };
    }
  };

  const downloadDesign = () => {
    if (!fabricCanvasRef.current) return;
    const link = document.createElement('a');
    link.download = `for-design-${designSide}.png`;
    link.href = fabricCanvasRef.current.toDataURL({
      format: 'png', quality: 1,
      multiplier: 2
    });
    link.click();
    showNotification('Design downloaded successfully!');
  };

  // ── Calculate print size from canvas objects ──────────────────────────────
  const recalcPrintSize = () => {
    if (!fabricCanvasRef.current) {
      setPrintSize(null);
      return;
    }

    const objects = fabricCanvasRef.current.getObjects();
    if (objects.length === 0) {
      setPrintSize(null);
      return;
    }

    // Get bounding box of ALL design objects
    let minLeft = Infinity, minTop = Infinity, maxRight = -Infinity, maxBottom = -Infinity;
    for (const obj of objects) {
      const bound = obj.getBoundingRect();
      minLeft = Math.min(minLeft, bound.left);
      minTop = Math.min(minTop, bound.top);
      maxRight = Math.max(maxRight, bound.left + bound.width);
      maxBottom = Math.max(maxBottom, bound.top + bound.height);
    }

    const widthCm = (maxRight - minLeft) * PIXELS_TO_CM;
    const heightCm = (maxBottom - minTop) * PIXELS_TO_CM;

    // Find matching tier (smallest tier that fits the design)
    const tier = PRINT_TIERS.find(
      (t) => widthCm <= t.maxWidth && heightCm <= t.maxHeight
    ) || PRINT_TIERS[PRINT_TIERS.length - 1]; // Default to largest

    setPrintSize({ widthCm, heightCm, tier });
  };

  // Recalculate on every canvas change
  useEffect(() => {
    recalcPrintSize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canUpdate]);

  // ── SAVE DESIGN — Persists to database ────────────────────────────────────
  const saveDesign = async () => {
    if (!fabricCanvasRef.current) return;

    if (!session?.user) {
      showNotification('Please sign in to save designs');
      return;
    }

    setIsSaving(true);
    try {
      const designData = fabricCanvasRef.current.toJSON();
      const imageData = fabricCanvasRef.current.toDataURL({
        format: 'png', quality: 1,
        multiplier: 2
      });

      const payload = {
        name: `Custom ${selectedProductType.label}`,
        designData,
        tshirtColor,
        tshirtGender: selectedProductType.gender,
        tshirtFit: selectedProductType.fit,
        tshirtSize,
        frontImage: designSide === 'front' ? imageData : undefined,
        backImage: designSide === 'back' ? imageData : undefined,
        hasFront: designSide === 'front',
        hasBack: designSide === 'back',
        isPublic: false,
      };

      let res;
      if (savedDesignId) {
        // Update existing design
        res = await fetch(`/api/designs/${savedDesignId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new design
        res = await fetch('/api/designs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Save failed');
      }

      const data = await res.json();
      if (data.id) setSavedDesignId(data.id);

      showNotification(savedDesignId ? 'Design updated! ✓' : 'Design saved! ✓');
    } catch (error) {
      console.error('Save error:', error);
      // Fallback to localStorage
      const fallback = {
        designData: fabricCanvasRef.current.toJSON(),
        tshirtColor, tshirtSize, tshirtGender: selectedProductType.gender, tshirtFit: selectedProductType.fit, designSide,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem('for-saved-design', JSON.stringify(fallback));
      showNotification('Saved locally (sign in to sync)');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Price calculation (both sides) ──────────────────────────────────────
  const getBasePrice = () => selectedProductType.basePrice;
  const getPrintPrice = () => printSize?.tier.price ?? 0;

  // Check if current side has design (live canvas)
  const currentSideHasDesign = () => {
    if (!fabricCanvasRef.current) return false;
    return fabricCanvasRef.current.getObjects().length > 0;
  };

  const calculatePrice = () => {
    const base = getBasePrice();
    const currentPrint = getPrintPrice(); // from live canvas
    const otherSideHasDesign = designSide === 'front' ? hasBackDesign : hasFrontDesign;
    // Surcharge for printing on both sides
    const bothSides = currentSideHasDesign() && otherSideHasDesign ? BACK_PRINT_SURCHARGE : 0;
    return base + currentPrint + bothSides;
  };

  // ── Generate composite preview (t-shirt + design) for cart/checkout ───────
  const generateCompositePreview = async (
    side: 'front' | 'back',
    savedDesignImageSrc?: string | null
  ): Promise<string | null> => {
    const mockupPath = `/mockups/tshirt-white-${side}.png`;

    // Get the design image for this side
    let designDataUrl: string | null = null;
    if (side === designSide && fabricCanvasRef.current) {
      // Current side — use live canvas
      const objects = fabricCanvasRef.current.getObjects();
      if (objects.length > 0) {
        designDataUrl = fabricCanvasRef.current.toDataURL({
          format: 'png', quality: 1, multiplier: 2
        });
      }
    } else if (savedDesignImageSrc) {
      // Other side — use saved design image
      designDataUrl = savedDesignImageSrc;
    }

    if (!designDataUrl) return null; // No design on this side

    const previewCanvas = document.createElement('canvas');
    const ctx = previewCanvas.getContext('2d')!;
    const W = 400, H = 500;
    previewCanvas.width = W;
    previewCanvas.height = H;

    // Light background
    ctx.fillStyle = '#F0EDE8';
    ctx.fillRect(0, 0, W, H);

    // Load the white mockup image
    const mockupImg = new Image();
    mockupImg.crossOrigin = 'anonymous';
    mockupImg.src = mockupPath;
    await new Promise<void>((resolve) => {
      mockupImg.onload = () => resolve();
      mockupImg.onerror = () => resolve();
    });

    if (mockupImg.complete && mockupImg.naturalWidth > 0) {
      // Create colored shirt silhouette
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCanvas.width = W;
      tempCanvas.height = H;
      tempCtx.fillStyle = tshirtColor;
      tempCtx.fillRect(0, 0, W, H);
      tempCtx.globalCompositeOperation = 'destination-in';
      tempCtx.drawImage(mockupImg, 0, 0, W, H);
      ctx.drawImage(tempCanvas, 0, 0);

      // Add mockup texture with multiply
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.92;
      ctx.drawImage(mockupImg, 0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }

    // Overlay the design
    const designImg = new Image();
    designImg.src = designDataUrl;
    await new Promise<void>((resolve) => {
      designImg.onload = () => resolve();
      designImg.onerror = () => resolve();
    });

    if (designImg.complete && designImg.naturalWidth > 0) {
      const printLeft = W * selectedProductType.printArea.left;
      const printTop = H * selectedProductType.printArea.top;
      const printWidth = W * selectedProductType.printArea.width;
      const printHeight = H * selectedProductType.printArea.height;
      ctx.drawImage(designImg, printLeft, printTop, printWidth, printHeight);
    }

    return previewCanvas.toDataURL('image/jpeg', 0.85);
  };

  // ── Helper: sync current side state before cart operations ────────────────
  const syncCurrentSideState = () => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;
    const hasObjects = canvas.getObjects().length > 0;
    const currentJSON = canvas.toJSON();
    const currentDesignImage = hasObjects
      ? canvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 })
      : null;

    if (designSide === 'front') {
      frontDataRef.current = { json: currentJSON, designImage: currentDesignImage };
      setHasFrontDesign(hasObjects);
    } else {
      backDataRef.current = { json: currentJSON, designImage: currentDesignImage };
      setHasBackDesign(hasObjects);
    }
  };

  // ADD TO CART - Shows toast notification, stays on page
  const handleAddToCart = async () => {
    if (!fabricCanvasRef.current) {
      showNotification('Please create a design first!');
      return;
    }

    // Sync current side state
    syncCurrentSideState();

    const frontHas = designSide === 'front'
      ? fabricCanvasRef.current.getObjects().length > 0
      : hasFrontDesign;
    const backHas = designSide === 'back'
      ? fabricCanvasRef.current.getObjects().length > 0
      : hasBackDesign;

    if (!frontHas && !backHas) {
      showNotification('Please add a design to at least one side!');
      return;
    }

    setIsAddingToCart(true);

    try {
      // Generate composite previews for designed sides
      const frontPreview = await generateCompositePreview('front', frontDataRef.current.designImage);
      const backPreview = await generateCompositePreview('back', backDataRef.current.designImage);

      const basePrice = getBasePrice();
      const printPrice = getPrintPrice();
      const bothSides = frontHas && backHas ? BACK_PRINT_SURCHARGE : 0;

      addItem({
        id: `custom-${Date.now()}`,
        productId: `custom-design`,
        name: `Custom ${selectedProductType.label}`,
        image: frontPreview || backPreview || '',
        basePrice,
        printPrice: printPrice + bothSides,
        designId: savedDesignId || `design-${Date.now()}`,
        designName: `Custom ${selectedProductType.label}`,
        designImage: frontPreview || backPreview || '',
        size: tshirtSize,
        color: tshirtColor,
        gender: selectedProductType.gender,
        fit: selectedProductType.fit,
        hasFront: frontHas,
        hasBack: backHas,
        customDesign: {
          frontImage: frontPreview || undefined,
          backImage: backPreview || undefined,
        },
        quantity: 1,
        price: basePrice + printPrice + bothSides,
      });

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

    syncCurrentSideState();

    const frontHas = designSide === 'front'
      ? fabricCanvasRef.current.getObjects().length > 0
      : hasFrontDesign;
    const backHas = designSide === 'back'
      ? fabricCanvasRef.current.getObjects().length > 0
      : hasBackDesign;

    if (!frontHas && !backHas) {
      showNotification('Please add a design to at least one side!');
      return;
    }

    setIsAddingToCart(true);

    try {
      const frontPreview = await generateCompositePreview('front', frontDataRef.current.designImage);
      const backPreview = await generateCompositePreview('back', backDataRef.current.designImage);

      const basePrice = getBasePrice();
      const printPrice = getPrintPrice();
      const bothSides = frontHas && backHas ? BACK_PRINT_SURCHARGE : 0;

      addItem({
        id: `custom-${Date.now()}`,
        productId: `custom-design`,
        name: `Custom ${selectedProductType.label}`,
        image: frontPreview || backPreview || '',
        basePrice,
        printPrice: printPrice + bothSides,
        designId: savedDesignId || `design-${Date.now()}`,
        designName: `Custom ${selectedProductType.label}`,
        designImage: frontPreview || backPreview || '',
        size: tshirtSize,
        color: tshirtColor,
        gender: selectedProductType.gender,
        fit: selectedProductType.fit,
        hasFront: frontHas,
        hasBack: backHas,
        customDesign: {
          frontImage: frontPreview || undefined,
          backImage: backPreview || undefined,
        },
        quantity: 1,
        price: basePrice + printPrice + bothSides,
      });

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
              Designing {designSide} side • {selectedProductType.label} • {tshirtSize}
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
            <h3 className="font-semibold mb-4">Product Type</h3>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {PRODUCT_TYPES.map((pt) => (
                <button
                  key={pt.id}
                  onClick={() => setSelectedProductType(pt)}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg text-xs font-medium transition border-2 ${
                    selectedProductType.id === pt.id
                      ? 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-300 text-rose-900 shadow-sm'
                      : 'bg-gray-50 border-transparent hover:bg-gray-100 hover:border-gray-200'
                  }`}
                >
                  <span className="text-lg">{pt.icon}</span>
                  <span className="leading-tight text-center">{pt.label}</span>
                  <span className={`text-[10px] ${selectedProductType.id === pt.id ? 'text-rose-500' : 'text-gray-400'}`}>₹{pt.basePrice}</span>
                </button>
              ))}
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
                onClick={() => switchSide('front')}
                className={`py-3 rounded-lg font-medium transition relative ${designSide === 'front'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 hover:bg-gray-200'
                  }`}
              >
                Front
                {hasFrontDesign && (
                  <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${designSide === 'front' ? 'bg-white' : 'bg-green-500'}`} />
                )}
              </button>
              <button
                onClick={() => switchSide('back')}
                className={`py-3 rounded-lg font-medium transition relative ${designSide === 'back'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-gray-100 hover:bg-gray-200'
                  }`}
              >
                Back
                {hasBackDesign && (
                  <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${designSide === 'back' ? 'bg-white' : 'bg-green-500'}`} />
                )}
              </button>
            </div>
            {(hasFrontDesign || hasBackDesign || currentSideHasDesign()) && (
              <p className="text-[10px] text-gray-500 mt-2 text-center">
                {[
                  hasFrontDesign || (designSide === 'front' && currentSideHasDesign()) ? '✓ Front' : null,
                  hasBackDesign || (designSide === 'back' && currentSideHasDesign()) ? '✓ Back' : null,
                ].filter(Boolean).join(' • ')}
              </p>
            )}
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
            {/* Custom color picker */}
            <div className="mt-3 flex items-center gap-3">
              <label className="relative flex-1 group cursor-pointer">
                <input
                  type="color"
                  value={tshirtColor}
                  onChange={(e) => setTshirtColor(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 hover:border-gray-400 transition">
                  <div
                    className="w-5 h-5 rounded-full border border-gray-300"
                    style={{ backgroundColor: tshirtColor }}
                  />
                  <span className="text-xs text-gray-500 group-hover:text-gray-700">Custom Color</span>
                </div>
              </label>
              <span className="text-[10px] text-gray-400 font-mono uppercase">{tshirtColor}</span>
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
              className="relative rounded-xl p-8 flex justify-center items-center bg-gradient-to-br from-gray-100 to-gray-200"
              style={{ minHeight: '650px' }}
            >
              <div className="relative" style={{ width: '450px', height: '550px' }}>

                {/* ── Clean flat mockup: white base + CSS color mask ── */}
                <div
                  className="absolute inset-0 transition-colors duration-300"
                  style={{
                    backgroundColor: tshirtColor,
                    WebkitMaskImage: `url(${getMockupSrc()})`,
                    WebkitMaskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskImage: `url(${getMockupSrc()})`,
                    maskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    maskPosition: 'center',
                  }}
                />
                <img
                  src={getMockupSrc()}
                  alt={`T-Shirt ${designSide}`}
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{ mixBlendMode: 'multiply', opacity: 0.92 }}
                />

                {/* Fabric.js canvas (the user's design) */}
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
            {/* Print size indicator */}
            {printSize && (
              <div className="mb-4 p-3 bg-white/10 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Ruler className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-medium text-blue-300">Print Area</span>
                </div>
                <p className="text-sm">
                  {printSize.widthCm.toFixed(1)}cm × {printSize.heightCm.toFixed(1)}cm
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Tier: <span className="text-white font-medium">{printSize.tier.name}</span> (+₹{printSize.tier.price})
                </p>
              </div>
            )}

            <h3 className="font-semibold mb-4">Price Summary</h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span>{selectedProductType.label} ({tshirtSize})</span>
                <span>₹{getBasePrice()}</span>
              </div>
              {printSize && (
                <div className="flex justify-between">
                  <span>{designSide === 'front' ? 'Front' : 'Back'} Print ({printSize.tier.name})</span>
                  <span>₹{getPrintPrice()}</span>
                </div>
              )}
              {/* Show other side's design indicator */}
              {designSide === 'front' && hasBackDesign && (
                <div className="flex justify-between text-green-400">
                  <span>✓ Back Print (saved)</span>
                  <span>included</span>
                </div>
              )}
              {designSide === 'back' && hasFrontDesign && (
                <div className="flex justify-between text-green-400">
                  <span>✓ Front Print (saved)</span>
                  <span>included</span>
                </div>
              )}
              {/* Both sides surcharge */}
              {currentSideHasDesign() && (designSide === 'front' ? hasBackDesign : hasFrontDesign) && (
                <div className="flex justify-between text-yellow-300">
                  <span>Both Sides Surcharge</span>
                  <span>₹{BACK_PRINT_SURCHARGE}</span>
                </div>
              )}
              {!printSize && (
                <div className="flex justify-between text-gray-400">
                  <span>No design yet</span>
                  <span>₹0</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-gray-400">
                <span>{selectedProductType.gender} • {selectedProductType.fit} fit</span>
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