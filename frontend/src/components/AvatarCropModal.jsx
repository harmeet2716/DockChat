import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut, Check, Sliders } from "lucide-react";

export default function AvatarCropModal({ srcImage, onClose, onSave }) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Reset states when a new image is loaded
  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [srcImage]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleSaveCrop = () => {
    if (!srcImage) return;

    const img = new Image();
    img.src = srcImage;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 300; // Standard output size
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      // 1. Center coordinate system and scale
      ctx.translate(size / 2, size / 2);
      ctx.scale(zoom, zoom);

      // 2. Translate offsets (mapped from 256px UI viewport size to 300px canvas size)
      const ratio = size / 256;
      ctx.translate((offset.x * ratio) / zoom, (offset.y * ratio) / zoom);

      // 3. Shift back to cover canvas
      ctx.translate(-size / 2, -size / 2);

      // Cover drawing math
      const imgRatio = img.width / img.height;
      let dx = 0, dy = 0, dWidth = size, dHeight = size;
      if (imgRatio > 1) {
        dWidth = size * imgRatio;
        dx = (size - dWidth) / 2;
      } else {
        dHeight = size / imgRatio;
        dy = (size - dHeight) / 2;
      }

      ctx.drawImage(img, dx, dy, dWidth, dHeight);

      // Extract to Blob and return
      canvas.toBlob(
        (blob) => {
          if (blob) {
            onSave(blob);
          }
        },
        "image/jpeg",
        0.95
      );
    };
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Premium Backdrop Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0b141a]/85 backdrop-blur-md"
      />

      {/* Elegant Morphing Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="relative bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl z-10 border border-slate-100 flex flex-col items-center"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-400 hover:text-slate-600 rounded-full transition-all"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-6 self-start">
          <div className="p-2 bg-[#25D366]/10 text-[#075E54] rounded-xl">
            <Sliders size={18} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#111b21]">Adjust Picture</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Circle Alignment</p>
          </div>
        </div>

        {/* Viewport for Cropping */}
        <div
          className="relative w-64 h-64 overflow-hidden bg-slate-900 rounded-full cursor-grab active:cursor-grabbing border-4 border-white shadow-xl select-none touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          {srcImage && (
            <img
              src={srcImage}
              alt="Crop Preview"
              draggable="false"
              className="absolute pointer-events-none select-none max-w-none origin-center"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                left: "50%",
                top: "50%",
                transformOrigin: "center center",
                marginLeft: "-128px",
                marginTop: "-128px",
                width: "256px",
                height: "256px",
                objectFit: "cover"
              }}
            />
          )}
          {/* Circular mask with elegant green circular outline indicator */}
          <div className="absolute inset-0 pointer-events-none rounded-full border-2 border-[#25D366] shadow-[0_0_0_9999px_rgba(11,20,26,0.6)]" />
        </div>

        {/* Zoom Controls */}
        <div className="mt-8 w-full flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setZoom(Math.max(1, zoom - 0.1))}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-full transition-colors active:scale-95"
          >
            <ZoomOut size={16} />
          </button>

          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="flex-1 accent-[#25D366] h-1.5 bg-slate-100 rounded-full cursor-pointer transition-all hover:bg-slate-200"
          />

          <button
            type="button"
            onClick={() => setZoom(Math.min(3, zoom + 0.1))}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-full transition-colors active:scale-95"
          >
            <ZoomIn size={16} />
          </button>
        </div>

        {/* Tip Indicator */}
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-4">
          Drag to position • Slide to zoom
        </span>

        {/* Interactive Action Buttons */}
        <div className="mt-8 w-full flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-xs uppercase tracking-widest border border-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveCrop}
            className="flex-1 py-4 rounded-2xl bg-[#25D366] text-white font-bold shadow-lg shadow-[#25D366]/20 hover:bg-[#128C7E] active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <Check size={16} />
            <span>Apply Photo</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
