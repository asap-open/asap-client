import React, { useRef, useState, useEffect, useLayoutEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  minHeight?: number;
  maxHeight?: number;
  initialHeight?: number;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  minHeight = 100,
  maxHeight: maxHeightProp,
  initialHeight = 500,
  className = "",
}: ModalProps) {
  const [height, setHeight] = useState(initialHeight);
  const [maxHeight, setMaxHeight] = useState(
    maxHeightProp ||
      (typeof window !== "undefined" ? window.innerHeight - 24 : 600),
  );
  const dragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(initialHeight);

  useLayoutEffect(() => {
    function updateMaxHeight() {
      setMaxHeight(maxHeightProp || window.innerHeight - 24);
    }
    updateMaxHeight();
    window.addEventListener("resize", updateMaxHeight);
    return () => window.removeEventListener("resize", updateMaxHeight);
  }, [maxHeightProp]);

  useEffect(() => {
    if (isOpen) setHeight(initialHeight);
  }, [isOpen, initialHeight]);

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    dragging.current = true;
    startY.current = e.touches[0].clientY;
    startHeight.current = height;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return;
    const deltaY = startY.current - e.touches[0].clientY;
    let newHeight = startHeight.current + deltaY;
    newHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));
    setHeight(newHeight);
  };

  const handleTouchEnd = () => {
    dragging.current = false;
    if (height < minHeight + 40) {
      onClose();
    }
  };

  // Mouse events (for desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    startY.current = e.clientY;
    startHeight.current = height;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging.current) return;
    const deltaY = startY.current - e.clientY;
    let newHeight = startHeight.current + deltaY;
    newHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));
    setHeight(newHeight);
  };

  const handleMouseUp = () => {
    dragging.current = false;
    if (height < minHeight + 40) {
      onClose();
    }
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-end"
      onClick={onClose}
    >
      <div
        className={`fixed left-0 right-0 mx-auto bg-surface rounded-t-xl shadow-lg transition-all ${className}`}
        style={{
          bottom: 0,
          height: height,
          maxHeight: maxHeight,
          minHeight: minHeight,
          touchAction: "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div
          className="w-full flex justify-center items-center py-2 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          <div className="w-10 h-1.5 rounded-full bg-border" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-center px-4 py-4 border-b border-border">
          <h2 className="text-text-main text-lg font-bold leading-tight text-center">
            {title}
          </h2>
        </div>
        {/* Body */}
        <div className="overflow-y-auto h-[calc(100%-90px)] px-2">
          {children}
        </div>
      </div>
    </div>
  );
}
