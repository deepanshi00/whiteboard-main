import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { updateElement, deleteElement, setIsEditingText, setEditingTextId } from "../store/whiteboardSlice";
import { useSocket } from "../hooks/useSocket";

interface TextEditorProps {
  elementId: string;
  onComplete: () => void;
}

const RichTextBox: React.FC<TextEditorProps> = ({ elementId, onComplete }) => {
  const dispatch = useDispatch();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  const element = useSelector((state: RootState) =>
    state.whiteboard.elements.find((el) => el.id === elementId)
  );

  const {
    zoom,
    pan,
    fontSize,
    fontFamily,
    fontWeight,
    fontStyle,
    textAlign,
    selectedColor,
  } = useSelector((state: RootState) => state.whiteboard.canvas);

  const roomId = useSelector((state: RootState) => state.whiteboard.roomId);
  const { emitElementUpdated, emitElementDeleted } = useSocket(roomId);

  // Calculate proper text metrics for positioning
  const getTextMetrics = useCallback((text: string, fontSize: number, fontFamily: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return { width: 0, height: fontSize };
    
    ctx.font = `${fontSize}px ${fontFamily}`;
    const metrics = ctx.measureText(text);
    return {
      width: metrics.width,
      height: fontSize * 1.2, // Approximate line height
    };
  }, []);

  // Auto-resize textarea based on content
  const resizeTextarea = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      const scrollHeight = inputRef.current.scrollHeight;
      const minHeight = fontSize * zoom * 1.4;
      inputRef.current.style.height = Math.max(scrollHeight, minHeight) + "px";
      
      // Update width based on content if needed
      const lines = text.split('\n');
      const longestLine = lines.reduce((a, b) => a.length > b.length ? a : b, '');
      const metrics = getTextMetrics(longestLine, fontSize * zoom, fontFamily);
      const minWidth = Math.max(100, metrics.width + 20);
      inputRef.current.style.width = Math.min(minWidth, 400) + "px";
    }
  }, [text, fontSize, zoom, fontFamily, getTextMetrics]);

  // Initialize text editor
  useEffect(() => {
    if (element && !isInitialized) {
      setText(element.text || "");
      setIsInitialized(true);
      
      // Focus and select text after a short delay
      setTimeout(() => {
    if (inputRef.current) {
      inputRef.current.focus();
          if (element.text) {
      inputRef.current.select();
    }
        }
      }, 50);
    }
  }, [element, isInitialized]);

  // Resize textarea when text changes
  useEffect(() => {
    if (isInitialized) {
      resizeTextarea();
    }
  }, [text, fontSize, zoom, resizeTextarea, isInitialized]);

  // Save text and cleanup
  const handleComplete = useCallback(() => {
    if (!element) return;

    const trimmedText = text.trim();
    
    if (trimmedText === "") {
      // Delete empty text element
      console.log('Deleting empty text element:', element.id);
      dispatch(deleteElement(element.id));
      emitElementDeleted(element.id);
    } else {
      // Update text element with proper positioning
      const updatedElement = {
        ...element,
        text: trimmedText,
        updated: Date.now(),
        // Ensure text has proper font properties
        fontSize: fontSize,
        fontFamily: fontFamily,
        fontWeight: fontWeight,
        fontStyle: fontStyle,
        textAlign: textAlign,
        color: selectedColor,
      };
      console.log('Saving text element:', updatedElement);
      dispatch(updateElement(updatedElement));
      emitElementUpdated(updatedElement);
    }
    
    // Clean up editing state
    dispatch(setIsEditingText(false));
    dispatch(setEditingTextId(null));
    onComplete();
  }, [element, text, fontSize, fontFamily, fontWeight, fontStyle, textAlign, selectedColor, dispatch, emitElementUpdated, emitElementDeleted, onComplete]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleComplete();
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleComplete();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleComplete]);

  // Handle click outside to save
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleComplete();
      }
    };

    // Add delay to prevent immediate closure on creation
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 200); // Increased delay

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleComplete]);

  if (!element || !element.points.length || !isInitialized) {
    return null;
  }

  const point = element.points[0];
  // Position the editor exactly where the text will appear
  const screenX = (point.x + pan.x) * zoom;
  const screenY = (point.y + pan.y) * zoom;

  return (
    <div
      ref={containerRef}
      className="absolute z-50 pointer-events-none"
      style={{
        left: screenX,
        top: screenY,
        transform: "translate(0, 0)", // No transform - position directly at click point
      }}
    >
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type text..."
        className="pointer-events-auto bg-white border-2 border-blue-400 border-dashed rounded-md px-3 py-2 resize-none overflow-hidden shadow-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
        style={{
          fontSize: `${fontSize * zoom}px`,
          fontFamily,
          fontWeight,
          fontStyle,
          textAlign,
          color: selectedColor,
          minWidth: "120px",
          minHeight: `${fontSize * zoom * 1.4}px`,
          maxWidth: "400px",
          background: "rgba(255,255,255,0.98)",
          lineHeight: "1.4",
          border: "2px dashed #60a5fa",
          borderRadius: "6px",
        }}
        rows={1}
        autoFocus
        spellCheck={false}
      />
    </div>
  );
};

export default RichTextBox;
