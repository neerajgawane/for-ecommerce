'use client';

import { useState, useEffect, useRef } from 'react';
import { Canvas as FabricCanvas, FabricImage, IText, FabricObject } from 'fabric';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import {
  Upload, Type, Trash2, Download, Save, ShoppingCart, Eye, Palette,
  Undo, Redo, RotateCcw, Plus, Minus, Zap, Check, Ruler, AlignLeft,
  AlignCenter, AlignRight, Bold, Italic, Underline, Move, Sliders, Layers,
  ChevronRight, Grid, Minimize2, CheckSquare
} from 'lucide-react';
import { useSession } from 'next-auth/react';

// ── Product types with per-type mockup, print area, and pricing ───────────────
interface ProductType {
  id: string;
  label: string;
  icon: string;
  gender: 'women' | 'men' | 'unisex';
  fit: 'regular' | 'oversized';
  mockupPrefix: string;
  basePrice: number;
  printArea: { top: number; left: number; width: number; height: number };
}

const PRODUCT_TYPES: ProductType[] = [
  {
    id: 'tshirt-regular-men',
    label: "Regular Men's Tee",
    icon: '👕',
    gender: 'men',
    fit: 'regular',
    mockupPrefix: 'tshirt-regular-men',
    basePrice: 399,
    printArea: { top: 0.22, left: 0.24, width: 0.52, height: 0.53 },
  },
  {
    id: 'tshirt-regular-women',
    label: "Regular Women's Tee",
    icon: '👚',
    gender: 'women',
    fit: 'regular',
    mockupPrefix: 'tshirt-regular-women',
    basePrice: 399,
    printArea: { top: 0.23, left: 0.26, width: 0.48, height: 0.49 },
  },
  {
    id: 'tshirt-oversized-men',
    label: "Oversized Men's Tee",
    icon: '🧥',
    gender: 'men',
    fit: 'oversized',
    mockupPrefix: 'tshirt-white', // uses existing unwrinkled white front/back pngs
    basePrice: 499,
    printArea: { top: 0.22, left: 0.21, width: 0.58, height: 0.59 },
  },
  {
    id: 'tshirt-oversized-women',
    label: "Oversized Women's Tee",
    icon: '🧥',
    gender: 'women',
    fit: 'oversized',
    mockupPrefix: 'tshirt-white', // uses existing unwrinkled white front/back pngs
    basePrice: 499,
    printArea: { top: 0.22, left: 0.21, width: 0.58, height: 0.59 },
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
const PIXELS_TO_CM = 35 / 280;

interface CanvasHistory {
  state: Record<string, unknown>;
}

const GOOGLE_FONTS = [
  { name: 'Inter', family: 'Inter' },
  { name: 'Outfit', family: 'Outfit' },
  { name: 'Poppins', family: 'Poppins' },
  { name: 'Montserrat', family: 'Montserrat' },
  { name: 'Bebas Neue', family: 'Bebas Neue' },
  { name: 'Pacifico', family: 'Pacifico' },
  { name: 'Playfair Display', family: 'Playfair Display' },
  { name: 'Cinzel', family: 'Cinzel' },
  { name: 'Architects Daughter', family: 'Architects Daughter' },
];

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

  // Text formatting states
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState('Inter');
  const [textStroke, setTextStroke] = useState('#000000');
  const [textStrokeWidth, setTextStrokeWidth] = useState(0);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [charSpacing, setCharSpacing] = useState(0);

  const [isSaving, setIsSaving] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [savedDesignId, setSavedDesignId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(false);

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

  const colors = [
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

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

  // Inject Google Fonts Link dynamically
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Bebas+Neue&family=Cinzel:wght@700&family=Inter:wght@400;700&family=Montserrat:wght@400;700;900&family=Outfit:wght@400;700;900&family=Pacifico&family=Playfair+Display:ital,wght@0,700;1,700&family=Poppins:wght@400;700;900&display=swap';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Fetch mockup existence map
  const getMockupSrc = () => {
    const productKey = `${selectedProductType.mockupPrefix}-${designSide}`;
    if (mockupExists[productKey]) {
      return `/mockups/${selectedProductType.mockupPrefix}-${designSide}.png`;
    }
    return `/mockups/tshirt-white-${designSide}.png`;
  };

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
    setCanUpdate(prev => !prev);
  };

  // ── Switch between front/back sides ─────────────────────────────────────
  const switchSide = (newSide: 'front' | 'back') => {
    if (newSide === designSide || !fabricCanvasRef.current) return;
    isSwitchingRef.current = true;

    const canvas = fabricCanvasRef.current;
    const currentJSON = canvas.toJSON();
    const hasObjects = canvas.getObjects().length > 0;
    const currentDesignImage = hasObjects ? getCleanDesignDataURL() : null;

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

    canvas.discardActiveObject();

    const targetData = newSide === 'front' ? frontDataRef.current : backDataRef.current;
    if (targetData.json) {
      canvas.loadFromJSON(targetData.json, () => {
        canvas.requestRenderAll();
        canvas.calcOffset();
        isSwitchingRef.current = false;
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

  // ── Initialize Fabric.js Canvas ───────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 280,
      height: 350,
      backgroundColor: 'transparent',
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;
    setIsCanvasReady(true);
    saveToHistory();

    const handleSelection = (obj: FabricObject | null) => {
      setSelectedObject(obj || null);
      if (obj && obj.type === 'i-text') {
        setTextColor(obj.get('fill') as string || '#000000');
        setFontSize(obj.get('fontSize') as number || 32);
        setFontFamily(obj.get('fontFamily') as string || 'Inter');
        setTextStroke(obj.get('stroke') as string || '#000000');
        setTextStrokeWidth(obj.get('strokeWidth') as number || 0);
        setTextAlign(obj.get('textAlign') as 'left' | 'center' | 'right' || 'center');
        setCharSpacing((obj.get('charSpacing') as number || 0) / 10);
      }
    };

    canvas.on('selection:created', (e) => handleSelection(e.selected?.[0] || null));
    canvas.on('selection:updated', (e) => handleSelection(e.selected?.[0] || null));
    canvas.on('selection:cleared', () => setSelectedObject(null));

    canvas.on('object:added', saveToHistory);
    canvas.on('object:modified', saveToHistory);
    canvas.on('object:removed', saveToHistory);

    canvas.on('object:moving', (e) => {
      const obj = e.target;
      if (!obj) return;
      const bound = obj.getBoundingRect();
      const canvasW = canvas.getWidth();
      const canvasH = canvas.getHeight();

      if (bound.left < 0) obj.set('left', (obj.left ?? 0) - bound.left);
      if (bound.top < 0) obj.set('top', (obj.top ?? 0) - bound.top);
      if (bound.left + bound.width > canvasW)
        obj.set('left', (obj.left ?? 0) - (bound.left + bound.width - canvasW));
      if (bound.top + bound.height > canvasH)
        obj.set('top', (obj.top ?? 0) - (bound.top + bound.height - canvasH));
    });

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  // ── Responsive Sizing and Canvas Zooming ─────────────────────────────────
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !canvasRef.current) return;

    const container = canvasRef.current.parentElement;
    if (!container) return;

    const baseWidth = 280;

    const handleResize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;

      canvas.setDimensions({
        width: clientWidth,
        height: clientHeight
      });

      const zoom = clientWidth / baseWidth;
      canvas.setZoom(zoom);
      canvas.requestRenderAll();
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isCanvasReady, selectedProductType, designSide]);

  // Export Design Data URL with fixed size resolution (280x350 * multiplier)
  const getCleanDesignDataURL = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return null;

    const currentZoom = canvas.getZoom();
    const currentWidth = canvas.getWidth();
    const currentHeight = canvas.getHeight();

    canvas.setZoom(1.0);
    canvas.setDimensions({ width: 280, height: 350 });

    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2
    });

    canvas.setDimensions({ width: currentWidth, height: currentHeight });
    canvas.setZoom(currentZoom);
    canvas.requestRenderAll();

    return dataURL;
  };

  const undo = () => {
    if (historyStepRef.current <= 0 || !fabricCanvasRef.current) return;
    historyStepRef.current -= 1;
    const previousState = historyRef.current[historyStepRef.current].state;
    fabricCanvasRef.current.loadFromJSON(previousState, () => {
      fabricCanvasRef.current?.renderAll();
      setCanUpdate(prev => !prev);
    });
  };

  const redo = () => {
    if (historyStepRef.current >= historyRef.current.length - 1 || !fabricCanvasRef.current) return;
    historyStepRef.current += 1;
    const nextState = historyRef.current[historyStepRef.current].state;
    fabricCanvasRef.current.loadFromJSON(nextState, () => {
      fabricCanvasRef.current?.renderAll();
      setCanUpdate(prev => !prev);
    });
  };

  // ── Element Additions ────────────────────────────────────────────────────
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
          scaleX: scale,
          scaleY: scale,
        });
        fabricCanvasRef.current?.add(fabricImg);
        fabricCanvasRef.current?.centerObject(fabricImg);
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
      fontSize,
      fontWeight: 'bold',
      fill: textColor,
      fontFamily,
      textAlign: textAlign,
      stroke: textStroke,
      strokeWidth: textStrokeWidth,
      charSpacing: charSpacing * 10
    });

    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.centerObject(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
  };

  // ── Active Element Controls ──────────────────────────────────────────────
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

  const updateStrokeColor = (color: string) => {
    setTextStroke(color);
    if (selectedObject && selectedObject.type === 'i-text') {
      selectedObject.set('stroke', color);
      fabricCanvasRef.current?.renderAll();
    }
  };

  const updateStrokeWidth = (width: number) => {
    setTextStrokeWidth(width);
    if (selectedObject && selectedObject.type === 'i-text') {
      selectedObject.set('strokeWidth', width);
      fabricCanvasRef.current?.renderAll();
    }
  };

  const updateTextAlign = (align: 'left' | 'center' | 'right') => {
    setTextAlign(align);
    if (selectedObject && selectedObject.type === 'i-text') {
      selectedObject.set('textAlign', align);
      fabricCanvasRef.current?.renderAll();
    }
  };

  const updateCharSpacing = (spacing: number) => {
    setCharSpacing(spacing);
    if (selectedObject && selectedObject.type === 'i-text') {
      selectedObject.set('charSpacing', spacing * 10);
      fabricCanvasRef.current?.renderAll();
    }
  };

  const toggleBold = () => {
    if (selectedObject && selectedObject.type === 'i-text') {
      const current = selectedObject.get('fontWeight');
      selectedObject.set('fontWeight', current === 'bold' ? 'normal' : 'bold');
      fabricCanvasRef.current?.renderAll();
      setCanUpdate(prev => !prev);
    }
  };

  const toggleItalic = () => {
    if (selectedObject && selectedObject.type === 'i-text') {
      const current = selectedObject.get('fontStyle');
      selectedObject.set('fontStyle', current === 'italic' ? 'normal' : 'italic');
      fabricCanvasRef.current?.renderAll();
      setCanUpdate(prev => !prev);
    }
  };

  const toggleUnderline = () => {
    if (selectedObject && selectedObject.type === 'i-text') {
      const current = selectedObject.get('underline');
      selectedObject.set('underline', !current);
      fabricCanvasRef.current?.renderAll();
      setCanUpdate(prev => !prev);
    }
  };

  const centerObject = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !selectedObject) return;
    canvas.centerObject(selectedObject);
    selectedObject.setCoords();
    canvas.renderAll();
    saveToHistory();
  };

  const flipHorizontal = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !selectedObject) return;
    selectedObject.set('flipX', !selectedObject.flipX);
    canvas.renderAll();
    saveToHistory();
  };

  const flipVertical = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !selectedObject) return;
    selectedObject.set('flipY', !selectedObject.flipY);
    canvas.renderAll();
    saveToHistory();
  };

  const bringToFront = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !selectedObject) return;
    canvas.bringObjectToFront(selectedObject);
    canvas.renderAll();
    saveToHistory();
  };

  const sendToBack = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !selectedObject) return;
    canvas.sendObjectToBack(selectedObject);
    canvas.renderAll();
    saveToHistory();
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
    if (designSide === 'front') {
      setHasFrontDesign(false);
      frontDataRef.current = { json: null, designImage: null };
    } else {
      setHasBackDesign(false);
      backDataRef.current = { json: null, designImage: null };
    }
  };

  const downloadDesign = () => {
    const dataURL = getCleanDesignDataURL();
    if (!dataURL) return;
    const link = document.createElement('a');
    link.download = `design-${designSide}.png`;
    link.href = dataURL;
    link.click();
    showNotification('Design exported successfully!');
  };

  // Calculate print size boundaries
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

    let minLeft = Infinity, minTop = Infinity, maxRight = -Infinity, maxBottom = -Infinity;
    for (const obj of objects) {
      const bound = obj.getBoundingRect();
      minLeft = Math.min(minLeft, bound.left);
      minTop = Math.min(minTop, bound.top);
      maxRight = Math.max(maxRight, bound.left + bound.width);
      maxBottom = Math.max(maxBottom, bound.top + bound.height);
    }

    // Normalise based on zoom
    const zoom = fabricCanvasRef.current.getZoom();
    const widthCm = ((maxRight - minLeft) / zoom) * PIXELS_TO_CM;
    const heightCm = ((maxBottom - minTop) / zoom) * PIXELS_TO_CM;

    const tier = PRINT_TIERS.find(
      (t) => widthCm <= t.maxWidth && heightCm <= t.maxHeight
    ) || PRINT_TIERS[PRINT_TIERS.length - 1];

    setPrintSize({ widthCm, heightCm, tier });
  };

  useEffect(() => {
    recalcPrintSize();
  }, [canUpdate]);

  // ── Database Saving ──────────────────────────────────────────────────────
  const saveDesign = async () => {
    if (!fabricCanvasRef.current) return;

    if (!session?.user) {
      showNotification('Please sign in to save designs');
      return;
    }

    setIsSaving(true);
    try {
      const designData = fabricCanvasRef.current.toJSON();
      const imageData = getCleanDesignDataURL();

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
        res = await fetch(`/api/designs/${savedDesignId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
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

  const getBasePrice = () => selectedProductType.basePrice;
  const getPrintPrice = () => printSize?.tier.price ?? 0;

  const currentSideHasDesign = () => {
    if (!fabricCanvasRef.current) return false;
    return fabricCanvasRef.current.getObjects().length > 0;
  };

  const calculatePrice = () => {
    const base = getBasePrice();
    const currentPrint = getPrintPrice();
    const otherSideHasDesign = designSide === 'front' ? hasBackDesign : hasFrontDesign;
    const bothSides = currentSideHasDesign() && otherSideHasDesign ? BACK_PRINT_SURCHARGE : 0;
    return base + currentPrint + bothSides;
  };

  // ── Composite Previews for Checkout ──────────────────────────────────────
  const generateCompositePreview = async (
    side: 'front' | 'back',
    savedDesignImageSrc?: string | null
  ): Promise<string | null> => {
    const mockupPath = `/mockups/${selectedProductType.mockupPrefix}-${side}.png`;

    let designDataUrl: string | null = null;
    if (side === designSide && fabricCanvasRef.current) {
      const objects = fabricCanvasRef.current.getObjects();
      if (objects.length > 0) {
        designDataUrl = getCleanDesignDataURL();
      }
    } else if (savedDesignImageSrc) {
      designDataUrl = savedDesignImageSrc;
    }

    const previewCanvas = document.createElement('canvas');
    const ctx = previewCanvas.getContext('2d')!;
    const W = 400, H = 500;
    previewCanvas.width = W;
    previewCanvas.height = H;

    // Background color
    ctx.fillStyle = '#0F172A'; // Slate-900 background for a premium checkout image
    ctx.fillRect(0, 0, W, H);

    const mockupImg = new Image();
    mockupImg.crossOrigin = 'anonymous';
    mockupImg.src = mockupPath;
    await new Promise<void>((resolve) => {
      mockupImg.onload = () => resolve();
      mockupImg.onerror = () => resolve();
    });

    if (mockupImg.complete && mockupImg.naturalWidth > 0) {
      // Color mask shape
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCanvas.width = W;
      tempCanvas.height = H;
      tempCtx.fillStyle = tshirtColor;
      tempCtx.fillRect(0, 0, W, H);
      tempCtx.globalCompositeOperation = 'destination-in';
      tempCtx.drawImage(mockupImg, 0, 0, W, H);
      ctx.drawImage(tempCanvas, 0, 0);

      // Multiplied shadows
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.92;
      ctx.drawImage(mockupImg, 0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }

    // Overlay design in exact printable printArea coordinates
    if (designDataUrl) {
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
    }

    return previewCanvas.toDataURL('image/jpeg', 0.85);
  };

  const syncCurrentSideState = () => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;
    const hasObjects = canvas.getObjects().length > 0;
    const currentJSON = canvas.toJSON();
    const currentDesignImage = hasObjects ? getCleanDesignDataURL() : null;

    if (designSide === 'front') {
      frontDataRef.current = { json: currentJSON, designImage: currentDesignImage };
      setHasFrontDesign(hasObjects);
    } else {
      backDataRef.current = { json: currentJSON, designImage: currentDesignImage };
      setHasBackDesign(hasObjects);
    }
  };

  const handleAddToCart = async () => {
    if (!fabricCanvasRef.current) return;

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
      const designId = savedDesignId || `design-${Date.now()}`;

      addItem({
        id: `custom-${Date.now()}`,
        productId: `custom-design`,
        name: `Custom ${selectedProductType.label}`,
        image: frontPreview || backPreview || '',
        basePrice,
        printPrice: printPrice + bothSides,
        designId,
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

  const handleBuyNow = async () => {
    if (!fabricCanvasRef.current) return;

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
      const designId = savedDesignId || `design-${Date.now()}`;

      addItem({
        id: `custom-${Date.now()}`,
        productId: `custom-design`,
        name: `Custom ${selectedProductType.label}`,
        image: frontPreview || backPreview || '',
        basePrice,
        printPrice: printPrice + bothSides,
        designId,
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
    <div className="min-h-screen bg-slate-950 text-white font-sans antialiased overflow-x-hidden">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 right-6 z-50 animate-slide-in-right">
          <div className="bg-slate-900 border border-slate-800 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-xl">
            <Check className="w-5 h-5 text-emerald-400" />
            <p className="font-medium text-sm">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="bg-slate-900/80 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Creator Studio
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1">
              <span className="capitalize font-bold text-slate-300">{designSide} view</span>
              <span>•</span>
              <span>{selectedProductType.label}</span>
              <span>•</span>
              <span>Size {tshirtSize}</span>
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-2 bg-slate-800/80 border border-slate-700 rounded-lg hover:bg-slate-700/80 disabled:opacity-20 disabled:cursor-not-allowed transition"
              title="Undo"
            >
              <Undo className="w-4 h-4 text-slate-300" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-2 bg-slate-800/80 border border-slate-700 rounded-lg hover:bg-slate-700/80 disabled:opacity-20 disabled:cursor-not-allowed transition"
              title="Redo"
            >
              <Redo className="w-4 h-4 text-slate-300" />
            </button>
            <button
              onClick={() => setShowGrid(prev => !prev)}
              className={`p-2 border rounded-lg transition ${showGrid ? 'bg-indigo-600/30 border-indigo-500 text-white' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700/80'}`}
              title="Toggle Grid Lines"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={saveDesign}
              disabled={isSaving}
              className="px-4 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-700 rounded-lg text-sm font-semibold flex items-center gap-2 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-slate-300" />
              <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save Design'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start">
        
        {/* Left Control Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Fit & Product Type Selection */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/85 p-5 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Fit & Gender
            </h3>
            
            <div className="space-y-2">
              {PRODUCT_TYPES.map((pt) => {
                const isActive = selectedProductType.id === pt.id;
                return (
                  <button
                    key={pt.id}
                    onClick={() => setSelectedProductType(pt)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-lg border text-left transition duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-950/50 to-purple-950/40 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl bg-slate-800/50 p-1.5 rounded-md">{pt.icon}</span>
                      <div>
                        <p className="font-semibold text-sm leading-snug">{pt.label}</p>
                        <p className="text-[10px] text-slate-400 capitalize">{pt.gender} • {pt.fit} fit</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold ${isActive ? 'text-indigo-400' : 'text-slate-400'}`}>
                        ₹{pt.basePrice}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Sizes Selection */}
            <div className="mt-5 pt-5 border-t border-slate-850">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                Select Size
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setTshirtSize(size)}
                    className={`py-2 rounded-lg text-xs font-bold transition ${
                      tshirtSize === size
                        ? 'bg-white text-slate-950 shadow-md scale-105'
                        : 'bg-slate-850 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Design Side Toggle */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/85 p-5 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" /> Design Side
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => switchSide('front')}
                className={`py-3 rounded-lg font-bold text-xs uppercase tracking-wide transition relative ${
                  designSide === 'front'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-850 hover:bg-slate-800 text-slate-300'
                }`}
              >
                Front
                {hasFrontDesign && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                )}
              </button>
              <button
                onClick={() => switchSide('back')}
                className={`py-3 rounded-lg font-bold text-xs uppercase tracking-wide transition relative ${
                  designSide === 'back'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-slate-850 hover:bg-slate-800 text-slate-300'
                }`}
              >
                Back
                {hasBackDesign && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                )}
              </button>
            </div>
          </div>

          {/* Shirt Color Picker */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/85 p-5 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-pink-400" /> Fabric Color
            </h3>
            <div className="grid grid-cols-6 gap-2">
              {colors.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setTshirtColor(color.hex)}
                  className={`aspect-square rounded-lg border transition hover:scale-110 ${
                    tshirtColor === color.hex
                      ? 'border-white ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950 scale-105'
                      : 'border-slate-800 hover:border-slate-600'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
            
            {/* Custom Picker */}
            <div className="mt-4 pt-4 border-t border-slate-850 flex items-center justify-between">
              <label className="relative flex items-center gap-2 group cursor-pointer">
                <input
                  type="color"
                  value={tshirtColor}
                  onChange={(e) => setTshirtColor(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div
                  className="w-5 h-5 rounded border border-slate-700"
                  style={{ backgroundColor: tshirtColor }}
                />
                <span className="text-xs text-slate-400 group-hover:text-white transition">Custom Hex</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono uppercase bg-slate-950 px-2 py-1 rounded">
                {tshirtColor}
              </span>
            </div>
          </div>

          {/* Add Elements Section */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/85 p-5 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Add Custom Elements</h3>
            <div className="grid grid-cols-2 gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={!isCanvasReady}
                />
                <div className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border text-center transition ${
                  isCanvasReady
                    ? 'bg-slate-850 hover:bg-slate-800 border-slate-750 text-white'
                    : 'bg-slate-900/30 opacity-40 border-slate-800 cursor-not-allowed'
                }`}>
                  <Upload className="w-4.5 h-4.5 text-indigo-400" />
                  <span className="text-[11px] font-medium">Upload Image</span>
                </div>
              </label>
              <button
                onClick={addText}
                disabled={!isCanvasReady}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border text-center transition ${
                  isCanvasReady
                    ? 'bg-slate-850 hover:bg-slate-800 border-slate-750 text-white'
                    : 'bg-slate-900/30 opacity-40 border-slate-800 cursor-not-allowed'
                }`}
              >
                <Type className="w-4.5 h-4.5 text-purple-400" />
                <span className="text-[11px] font-medium">Add Text</span>
              </button>
            </div>
          </div>
        </div>

        {/* Center Canvas Stage */}
        <div className="lg:col-span-6 mt-6 lg:mt-0 flex flex-col items-center">
          <div className="w-full bg-slate-900/30 rounded-xl border border-slate-800/60 p-4 sm:p-6 backdrop-blur-sm relative">
            
            {/* Header controls inside Workspace */}
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800/65">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-slate-500" /> DESIGN AREA BOUNDS
              </span>
              <div className="flex gap-2">
                <button
                  onClick={clearCanvas}
                  className="px-2.5 py-1 text-xs border border-slate-750 rounded bg-slate-850 hover:bg-slate-800 text-slate-300 flex items-center gap-1 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear
                </button>
                <button
                  onClick={downloadDesign}
                  className="px-2.5 py-1 text-xs bg-white text-slate-950 font-bold rounded hover:bg-slate-100 flex items-center gap-1 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export PNG
                </button>
              </div>
            </div>

            {/* The Mockup Workspace Grid */}
            <div
              ref={mockupRef}
              className="relative rounded-xl p-4 sm:p-8 flex justify-center items-center bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 overflow-hidden shadow-inner border border-slate-850/40"
              style={{ minHeight: '430px' }}
            >
              <div className="relative w-full max-w-[400px]" style={{ aspectRatio: '9 / 11' }}>
                
                {/* ── Mockup Coloring Mask Layer ── */}
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

                {/* ── Texture Multiply Crease Overlay ── */}
                <img
                  src={getMockupSrc()}
                  alt={`T-Shirt ${designSide}`}
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                  style={{ mixBlendMode: 'multiply', opacity: 0.90 }}
                />

                {/* ── Dynamic Design Print Bounds Box ── */}
                <div
                  className="absolute pointer-events-auto"
                  style={{
                    top: `${selectedProductType.printArea.top * 100}%`,
                    left: `${selectedProductType.printArea.left * 100}%`,
                    width: `${selectedProductType.printArea.width * 100}%`,
                    height: `${selectedProductType.printArea.height * 100}%`,
                    zIndex: 10,
                  }}
                >
                  {/* Visual align helper grid */}
                  {showGrid && (
                    <div
                      className="absolute inset-0 pointer-events-none z-0 border border-indigo-500/20"
                      style={{
                        backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.2) 1px, transparent 1px)',
                        backgroundSize: '16px 16px',
                      }}
                    />
                  )}
                  {/* Subtle printable boundary box */}
                  <div className="absolute inset-0 border border-dashed border-slate-600/35 pointer-events-none z-0" />
                  
                  {/* Actual Canvas */}
                  <canvas ref={canvasRef} />
                </div>

                {/* Side Tag badge */}
                <div className="absolute top-3 right-3 bg-slate-900/90 text-slate-300 border border-slate-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg pointer-events-none">
                  {designSide} view
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Element Formatting Options */}
        <div className="lg:col-span-3 space-y-6 mt-6 lg:mt-0">
          
          {/* Selected Text Controls */}
          {selectedObject && selectedObject.type === 'i-text' && (
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/85 p-5 shadow-xl animate-fade-in">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-indigo-400" /> Text Formatting
              </h3>

              {/* Font Selection */}
              <div className="mb-4">
                <label className="text-xs text-slate-400 block mb-1.5">Google Fonts</label>
                <select
                  value={fontFamily}
                  onChange={(e) => updateFontFamily(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-lg text-xs font-medium text-white focus:border-indigo-500 focus:outline-none"
                >
                  {GOOGLE_FONTS.map(font => (
                    <option key={font.family} value={font.family}>{font.name}</option>
                  ))}
                </select>
              </div>

              {/* Text Alignments & Styles */}
              <div className="mb-4 flex items-center justify-between gap-1.5">
                <div className="flex gap-1">
                  <button
                    onClick={() => updateTextAlign('left')}
                    className={`p-2 rounded border transition ${textAlign === 'left' ? 'bg-indigo-600/30 border-indigo-500' : 'bg-slate-950 border-slate-850 text-slate-400'}`}
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => updateTextAlign('center')}
                    className={`p-2 rounded border transition ${textAlign === 'center' ? 'bg-indigo-600/30 border-indigo-500' : 'bg-slate-950 border-slate-850 text-slate-400'}`}
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => updateTextAlign('right')}
                    className={`p-2 rounded border transition ${textAlign === 'right' ? 'bg-indigo-600/30 border-indigo-500' : 'bg-slate-950 border-slate-850 text-slate-400'}`}
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={toggleBold}
                    className="p-2 rounded border bg-slate-950 border-slate-850 text-slate-400 hover:text-white"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={toggleItalic}
                    className="p-2 rounded border bg-slate-950 border-slate-850 text-slate-400 hover:text-white"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={toggleUnderline}
                    className="p-2 rounded border bg-slate-950 border-slate-850 text-slate-400 hover:text-white"
                  >
                    <Underline className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Text Size */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Font Size</span>
                  <span className="font-mono">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="80"
                  value={fontSize}
                  onChange={(e) => updateFontSize(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Letter Spacing */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Letter Spacing</span>
                  <span className="font-mono">{charSpacing}</span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="40"
                  value={charSpacing}
                  onChange={(e) => updateCharSpacing(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Text Stroke/Outline Width */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Outline Thickness</span>
                  <span className="font-mono">{textStrokeWidth}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  value={textStrokeWidth}
                  onChange={(e) => updateStrokeWidth(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Outline Color */}
              {textStrokeWidth > 0 && (
                <div className="mb-4">
                  <label className="text-xs text-slate-400 block mb-1.5">Outline Color</label>
                  <div className="grid grid-cols-4 gap-1">
                    {['#000000', '#FFFFFF', '#FF3B30', '#34C759', '#007AFF', '#FFCC00', '#AF52DE', '#FF9500'].map((color) => (
                      <button
                        key={color}
                        onClick={() => updateStrokeColor(color)}
                        className={`aspect-square rounded border transition ${textStroke === color ? 'border-white scale-105' : 'border-slate-800'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Element positioning helpers */}
              <div className="pt-4 border-t border-slate-850 space-y-2">
                <button
                  onClick={centerObject}
                  className="w-full py-2 bg-slate-850 hover:bg-slate-800 border border-slate-750 rounded text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Minimize2 className="w-3.5 h-3.5" /> Center Horizontally
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={flipHorizontal}
                    className="py-2 bg-slate-850 hover:bg-slate-800 border border-slate-750 rounded text-[11px] font-semibold"
                  >
                    Flip X
                  </button>
                  <button
                    onClick={flipVertical}
                    className="py-2 bg-slate-850 hover:bg-slate-800 border border-slate-750 rounded text-[11px] font-semibold"
                  >
                    Flip Y
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={bringToFront}
                    className="py-2 bg-slate-850 hover:bg-slate-800 border border-slate-750 rounded text-[11px] font-semibold"
                  >
                    Bring Front
                  </button>
                  <button
                    onClick={sendToBack}
                    className="py-2 bg-slate-850 hover:bg-slate-800 border border-slate-750 rounded text-[11px] font-semibold"
                  >
                    Send Back
                  </button>
                </div>
                <button
                  onClick={deleteSelected}
                  className="w-full py-2 bg-rose-950/30 hover:bg-rose-950/50 border border-rose-800 text-rose-300 rounded text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Text
                </button>
              </div>
            </div>
          )}

          {/* Selected Image Controls */}
          {selectedObject && selectedObject.type !== 'i-text' && (
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/85 p-5 shadow-xl animate-fade-in">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Image Properties
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Opacity</span>
                    <span className="font-mono">{Math.round((selectedObject.opacity ?? 1) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={selectedObject.opacity ?? 1}
                    onChange={(e) => {
                      selectedObject.set('opacity', parseFloat(e.target.value));
                      fabricCanvasRef.current?.renderAll();
                      setCanUpdate(prev => !prev);
                    }}
                    className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-855 space-y-2">
                  <button
                    onClick={centerObject}
                    className="w-full py-2 bg-slate-850 hover:bg-slate-800 border border-slate-750 rounded text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Minimize2 className="w-3.5 h-3.5" /> Center Horizontally
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={flipHorizontal}
                      className="py-2 bg-slate-850 hover:bg-slate-800 border border-slate-750 rounded text-[11px] font-semibold"
                    >
                      Flip X
                    </button>
                    <button
                      onClick={flipVertical}
                      className="py-2 bg-slate-850 hover:bg-slate-800 border border-slate-750 rounded text-[11px] font-semibold"
                    >
                      Flip Y
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={bringToFront}
                      className="py-2 bg-slate-850 hover:bg-slate-800 border border-slate-750 rounded text-[11px] font-semibold"
                    >
                      Bring Front
                    </button>
                    <button
                      onClick={sendToBack}
                      className="py-2 bg-slate-850 hover:bg-slate-800 border border-slate-750 rounded text-[11px] font-semibold"
                    >
                      Send Back
                    </button>
                  </div>
                  <button
                    onClick={deleteSelected}
                    className="w-full py-2 bg-rose-950/30 hover:bg-rose-950/50 border border-rose-800 text-rose-300 rounded text-xs font-semibold flex items-center justify-center gap-1.5 animate-pulse"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Image
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pricing & Checkout Summary Box */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950/60 rounded-xl border border-indigo-900/35 p-5 shadow-2xl">
            
            {/* Design Boundary Ruler Size Indicator */}
            {printSize && (
              <div className="mb-4 p-3.5 bg-indigo-950/60 rounded-lg border border-indigo-850/40">
                <div className="flex items-center gap-2 mb-1.5">
                  <Ruler className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wide">Real-World Print Dimension</span>
                </div>
                <p className="text-sm font-semibold text-white">
                  {printSize.widthCm.toFixed(1)}cm × {printSize.heightCm.toFixed(1)}cm
                </p>
                <p className="text-[10px] text-indigo-400 mt-1">
                  Matched Tier: <span className="font-bold text-white uppercase">{printSize.tier.name}</span> (+₹{printSize.tier.price})
                </p>
              </div>
            )}

            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3.5">Price Summary</h3>
            <div className="space-y-2 text-xs mb-4">
              <div className="flex justify-between text-slate-300">
                <span>{selectedProductType.label} ({tshirtSize})</span>
                <span className="font-bold">₹{getBasePrice()}</span>
              </div>
              
              {printSize && (
                <div className="flex justify-between text-slate-300">
                  <span>{designSide === 'front' ? 'Front' : 'Back'} Printing ({printSize.tier.name})</span>
                  <span className="font-bold">+₹{getPrintPrice()}</span>
                </div>
              )}

              {/* Secondary Side design checks */}
              {designSide === 'front' && hasBackDesign && (
                <div className="flex justify-between text-emerald-400">
                  <span className="flex items-center gap-1"><CheckSquare className="w-3 h-3" /> Back Side Printing</span>
                  <span className="font-bold">Included</span>
                </div>
              )}

              {designSide === 'back' && hasFrontDesign && (
                <div className="flex justify-between text-emerald-400">
                  <span className="flex items-center gap-1"><CheckSquare className="w-3 h-3" /> Front Side Printing</span>
                  <span className="font-bold">Included</span>
                </div>
              )}

              {/* Surcharge Indicator */}
              {currentSideHasDesign() && (designSide === 'front' ? hasBackDesign : hasFrontDesign) && (
                <div className="flex justify-between text-amber-400 border-t border-indigo-950 pt-2 mt-2">
                  <span>Dual Side Customization Surcharge</span>
                  <span className="font-bold">+₹{BACK_PRINT_SURCHARGE}</span>
                </div>
              )}

              {!printSize && (
                <div className="flex justify-between text-slate-500 py-1.5 bg-slate-950/20 rounded px-2 text-center">
                  <span className="mx-auto italic">Drag or type custom details above to start</span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="border-t border-slate-800/80 pt-3.5 flex justify-between items-center font-black text-white text-base mb-4.5">
              <span>Total Price</span>
              <span className="text-xl text-indigo-400">₹{calculatePrice()}</span>
            </div>

            {/* CTAs */}
            <div className="space-y-2.5">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="w-full bg-white hover:bg-slate-100 text-slate-950 py-3 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isAddingToCart ? (
                  'Adding...'
                ) : (
                  <>
                    <ShoppingCart className="w-4.5 h-4.5" />
                    Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isAddingToCart}
                className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 text-white py-3 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-lg shadow-purple-500/10"
              >
                {isAddingToCart ? (
                  'Processing...'
                ) : (
                  <>
                    <Zap className="w-4.5 h-4.5" />
                    Buy Now
                  </>
                )}
              </button>
            </div>
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
          animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}
      </style>

      {/* Mobile Sticky CTA footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-slate-900 border-t border-slate-800 p-3.5 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 capitalize truncate">
              {selectedProductType.label} • {tshirtSize}
            </p>
            <p className="text-base font-black text-indigo-400">₹{calculatePrice()}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isAddingToCart}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition"
            >
              <Zap className="w-3.5 h-3.5" /> Buy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}