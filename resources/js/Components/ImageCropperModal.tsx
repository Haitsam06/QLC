import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ZoomIn, ZoomOut, Move, Check, Loader2 } from 'lucide-react';

interface ImageCropperModalProps {
    file: File | null;
    onClose: () => void;
    onCrop: (croppedFile: File) => void;
}

export default function ImageCropperModal({ file, onClose, onCrop }: ImageCropperModalProps) {
    if (!file) return null;

    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [saving, setSaving] = useState(false);

    const dragStart = useRef({ x: 0, y: 0 });
    const imageRef = useRef<HTMLImageElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);

    // Base dimensions of the image when fit to viewport
    const [baseDimensions, setBaseDimensions] = useState({ width: 0, height: 0 });

    const VIEWPORT_SIZE = 300; // 300x300 viewport

    // Load image file into DataURL
    useEffect(() => {
        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result as string);
            setLoading(true);
        };
        reader.readAsDataURL(file);
    }, [file]);

    // Handle image loaded event
    const handleImageLoaded = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        if (!w || !h) return;

        let bw = 0;
        let bh = 0;
        let ox = 0;
        let oy = 0;

        // If landscape
        if (w > h) {
            bh = VIEWPORT_SIZE;
            bw = VIEWPORT_SIZE * (w / h);
            ox = (VIEWPORT_SIZE - bw) / 2;
            oy = 0;
        } else {
            bw = VIEWPORT_SIZE;
            bh = VIEWPORT_SIZE * (h / w);
            ox = 0;
            oy = (VIEWPORT_SIZE - bh) / 2;
        }

        setBaseDimensions({ width: bw, height: bh });
        setOffset({ x: ox, y: oy });
        setZoom(1);
        setLoading(false);
    };

    // Calculate drag bounds
    const getBounds = (currentZoom: number) => {
        const w = baseDimensions.width * currentZoom;
        const h = baseDimensions.height * currentZoom;
        return {
            minX: VIEWPORT_SIZE - w,
            maxX: 0,
            minY: VIEWPORT_SIZE - h,
            maxY: 0,
        };
    };

    // Clamp value helper
    const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

    // Mouse and Touch handlers for dragging
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const bounds = getBounds(zoom);
        const newX = clamp(e.clientX - dragStart.current.x, bounds.minX, bounds.maxX);
        const newY = clamp(e.clientY - dragStart.current.y, bounds.minY, bounds.maxY);
        setOffset({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length !== 1) return;
        setIsDragging(true);
        const touch = e.touches[0];
        dragStart.current = { x: touch.clientX - offset.x, y: touch.clientY - offset.y };
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || e.touches.length !== 1) return;
        const touch = e.touches[0];
        const bounds = getBounds(zoom);
        const newX = clamp(touch.clientX - dragStart.current.x, bounds.minX, bounds.maxX);
        const newY = clamp(touch.clientY - dragStart.current.y, bounds.minY, bounds.maxY);
        setOffset({ x: newX, y: newY });
    };

    // Handle zoom changes
    const handleZoomChange = (newZoom: number) => {
        const prevZoom = zoom;
        setZoom(newZoom);

        // Adjust offsets to keep the zooming centered
        const bounds = getBounds(newZoom);
        
        // Find current center of viewport relative to image
        const viewCenterX = VIEWPORT_SIZE / 2;
        const viewCenterY = VIEWPORT_SIZE / 2;

        const imgCenterX = (viewCenterX - offset.x) / prevZoom;
        const imgCenterY = (viewCenterY - offset.y) / prevZoom;

        const newOffsetX = viewCenterX - imgCenterX * newZoom;
        const newOffsetY = viewCenterY - imgCenterY * newZoom;

        setOffset({
            x: clamp(newOffsetX, bounds.minX, bounds.maxX),
            y: clamp(newOffsetY, bounds.minY, bounds.maxY),
        });
    };

    // Perform crop drawing on canvas
    const handleSave = () => {
        if (!imageRef.current) return;
        setSaving(true);

        const canvas = document.createElement('canvas');
        const CROP_RESOLUTION = 400; // Output size 400x400
        canvas.width = CROP_RESOLUTION;
        canvas.height = CROP_RESOLUTION;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            setSaving(false);
            return;
        }

        const ratio = CROP_RESOLUTION / VIEWPORT_SIZE;

        const destWidth = baseDimensions.width * zoom * ratio;
        const destHeight = baseDimensions.height * zoom * ratio;
        const destX = offset.x * ratio;
        const destY = offset.y * ratio;

        // Draw background white just in case
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, CROP_RESOLUTION, CROP_RESOLUTION);

        // Draw image
        ctx.drawImage(imageRef.current, destX, destY, destWidth, destHeight);

        // Convert to blob and send back
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    const croppedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });
                    onCrop(croppedFile);
                } else {
                    setSaving(false);
                }
            },
            'image/jpeg',
            0.9
        );
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="w-full max-w-[420px] bg-slate-900 border border-slate-800 rounded-[28px] shadow-2xl flex flex-col overflow-hidden animate-[slideUp_0.3s_ease-out] text-white">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                    <span className="text-[16px] font-bold text-slate-100">Sesuaikan Foto Profil</span>
                    <button 
                        onClick={onClose} 
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        disabled={saving}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Viewport container */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-950">
                    <div 
                        ref={viewportRef}
                        className="relative w-[300px] h-[300px] bg-slate-900 overflow-hidden rounded-2xl select-none"
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleMouseUp}
                    >
                        {imageSrc && (
                            <img
                                ref={imageRef}
                                src={imageSrc}
                                alt="To crop"
                                className="absolute cursor-move select-none max-w-none origin-top-left"
                                style={{
                                    width: `${baseDimensions.width * zoom}px`,
                                    height: `${baseDimensions.height * zoom}px`,
                                    left: `${offset.x}px`,
                                    top: `${offset.y}px`,
                                    opacity: loading ? 0 : 1,
                                    transition: loading ? 'none' : 'opacity 0.2s',
                                }}
                                onLoad={handleImageLoaded}
                                onMouseDown={handleMouseDown}
                                onTouchStart={handleTouchStart}
                                draggable={false}
                            />
                        )}

                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-400">
                                <Loader2 className="animate-spin mr-2" size={20} />
                                Memuat gambar...
                            </div>
                        )}

                        {/* WhatsApp-style circular mask overlay */}
                        <div className="absolute inset-0 pointer-events-none border-2 border-white/30 shadow-[0_0_0_9999px_rgba(15,23,42,0.7)] rounded-full"></div>
                    </div>

                    <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5">
                        <Move size={12} />
                        Geser foto untuk menyesuaikan posisi
                    </div>
                </div>

                {/* Controls (Zoom slider) */}
                <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => handleZoomChange(Math.max(1, zoom - 0.1))} 
                            className="text-slate-400 hover:text-white transition-colors"
                            disabled={loading || saving}
                        >
                            <ZoomOut size={16} />
                        </button>
                        <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.01"
                            value={zoom}
                            onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                            className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            disabled={loading || saving}
                        />
                        <button 
                            onClick={() => handleZoomChange(Math.min(3, zoom + 0.1))} 
                            className="text-slate-400 hover:text-white transition-colors"
                            disabled={loading || saving}
                        >
                            <ZoomIn size={16} />
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-1">
                        <button
                            onClick={onClose}
                            className="flex-1 h-11 rounded-xl text-[13px] font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all focus:outline-none"
                            disabled={saving}
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-[2] h-11 rounded-xl text-[13px] font-black text-white bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 focus:outline-none disabled:opacity-50"
                            disabled={loading || saving}
                        >
                            {saving ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <Check size={16} />
                                    Potong & Simpan
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
