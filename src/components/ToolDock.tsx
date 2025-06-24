import React, { useState, useRef, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  MousePointer,
  Pen,
  Pencil,
  Paintbrush,
  Eraser,
  Square,
  Circle,
  Minus,
  ArrowRight,
  Type,
  Grid,
  Move,
  Zap,
  X,
  Star,
  Triangle,
  Diamond,
  Heart,
  Hexagon,
  Palette,
  Sliders,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { RootState } from "../store";
import {
  setSelectedTool,
  toggleGrid,
  toggleSnapToGrid,
  setPenType,
  setPencilType,
  setBrushType,
  setEraserType,
  setSelectedColor,
  setStrokeWidth,
  setOpacity,
  setEraserSize,
  setFontSize,
  setFontFamily,
  setFontWeight,
  setFontStyle,
  setTextAlign,
} from "../store/whiteboardSlice";
import {
  DrawingTool,
  PenType,
  PencilType,
  BrushType,
  EraserType,
} from "../types";

const Toolbar: React.FC = () => {
  const dispatch = useDispatch();
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [dialogPosition, setDialogPosition] = useState({ left: 0, top: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);
  const toolRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const {
    selectedTool,
    gridVisible,
    snapToGrid,
    penType,
    pencilType,
    brushType,
    eraserType,
    selectedColor,
    strokeWidth,
    opacity,
    recentColors,
    eraserSize,
    fontSize,
    fontFamily,
    fontWeight,
    fontStyle,
    textAlign,
  } = useSelector((state: RootState) => state.whiteboard.canvas);

  const tools = [
    {
      id: "select" as DrawingTool,
      icon: MousePointer,
      label: "Select",
      shortcut: "V",
    },
    {
      id: "pen" as DrawingTool,
      icon: Pen,
      label: "Pen",
      shortcut: "P",
      hasDialog: true,
    },
    {
      id: "pencil" as DrawingTool,
      icon: Pencil,
      label: "Pencil",
      shortcut: "",
      hasDialog: true,
    },
    {
      id: "brush" as DrawingTool,
      icon: Paintbrush,
      label: "Brush",
      shortcut: "B",
      hasDialog: true,
    },
    {
      id: "eraser" as DrawingTool,
      icon: Eraser,
      label: "Eraser",
      shortcut: "E",
      hasDialog: true,
    },
    { 
      id: "text" as DrawingTool, 
      icon: Type, 
      label: "Text", 
      shortcut: "T",
      hasDialog: true,
    },
  ];

  const shapes = [
    { id: "rectangle" as DrawingTool, icon: Square, label: "Rectangle" },
    { id: "circle" as DrawingTool, icon: Circle, label: "Circle" },
    { id: "line" as DrawingTool, icon: Minus, label: "Line" },
    { id: "arrow" as DrawingTool, icon: ArrowRight, label: "Arrow" },
    { id: "triangle" as DrawingTool, icon: Triangle, label: "Triangle" },
    { id: "diamond" as DrawingTool, icon: Diamond, label: "Diamond" },
    { id: "star" as DrawingTool, icon: Star, label: "Star" },
    { id: "heart" as DrawingTool, icon: Heart, label: "Heart" },
    { id: "hexagon" as DrawingTool, icon: Hexagon, label: "Hexagon" },
  ];

  const presetColors = [
    "#000000",
    "#FFFFFF",
    "#FF0000",
    "#0000FF",
    "#00FF00",
    "#FFFF00",
    "#800080",
    "#FFA500",
    "#FF69B4",
    "#00FFFF",
    "#8B4513",
    "#808080",
    "#FFB6C1",
    "#98FB98",
    "#87CEEB",
    "#DDA0DD",
  ];

  // Close dialogs when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(event.target as Node)
      ) {
        setActiveDialog(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Enhanced tool selection with automatic switching and default settings
  const handleToolSelect = (tool: DrawingTool) => {
    dispatch(setSelectedTool(tool));

    // Automatically apply default or previous settings when switching tools
    switch (tool) {
      case "pen":
        // If no pen type is set or switching from another tool, use default
        if (!penType || selectedTool !== "pen") {
          dispatch(setPenType("ballpoint")); // Default pen type
        }
        break;
      case "pencil":
        // If no pencil type is set or switching from another tool, use default
        if (!pencilType || selectedTool !== "pencil") {
          dispatch(setPencilType("HB")); // Default pencil type
        }
        break;
      case "brush":
        // If no brush type is set or switching from another tool, use default
        if (!brushType || selectedTool !== "brush") {
          dispatch(setBrushType("watercolor")); // Default brush type
        }
        break;
      case "eraser":
        // If no eraser type is set or switching from another tool, use default
        if (!eraserType || selectedTool !== "eraser") {
          dispatch(setEraserType("precision")); // Default eraser type
        }
        break;
    }

    // Close dialog if tool doesn't have one
    if (!tools.find((t) => t.id === tool)?.hasDialog) {
      setActiveDialog(null);
    }
  };

  const calculateDialogPosition = (toolId: string) => {
    if (!toolbarRef.current) return { left: 16, top: 50 };

    const toolbarRect = toolbarRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Position dialog to the right of the toolbar
    let left = toolbarRect.right + 16;
    let top = toolbarRect.top;

    // Ensure dialog doesn't go off-screen horizontally
    const dialogWidth = toolId === "shapes" ? 600 : 800;
    if (left + dialogWidth > viewportWidth) {
      left = toolbarRect.left - dialogWidth - 16; // Position to the left instead
    }

    // Ensure dialog doesn't go off-screen vertically
    const maxTop = viewportHeight - 400; // assuming 400px dialog height
    top = Math.min(top, maxTop);
    top = Math.max(top, 16); // minimum top margin

    return { left, top };
  };

  const handleToolClick = (tool: any, event: React.MouseEvent) => {
    // If clicking the Text tool and it's already selected, switch to Select tool
    if (tool.id === 'text' && selectedTool === 'text') {
      handleToolSelect('select');
      setActiveDialog(null);
      return;
    }
    // Always select the tool first for immediate switching
    handleToolSelect(tool.id);

    if (tool.hasDialog) {
      const position = calculateDialogPosition(tool.id);
      setDialogPosition(position);
      setActiveDialog(activeDialog === tool.id ? null : tool.id);
    }
  };

  const handleShapesClick = () => {
    const position = calculateDialogPosition("shapes");
    setDialogPosition(position);
    setActiveDialog(activeDialog === "shapes" ? null : "shapes");
  };

  const handleMouseEnter = (toolId: string) => {
    setHoveredTool(toolId);
  };

  const handleMouseLeave = () => {
    setHoveredTool(null);
  };

  const getToolIcon = (tool: any) => {
    const Icon = tool.icon;
    return <Icon size={20} />;
  };

  const renderColorPicker = () => (
    <>
      {/* Current Color Display */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-lg border-2 border-gray-300 shadow-sm"
          style={{ backgroundColor: selectedColor }}
        />
        <span className="text-sm font-medium text-gray-700">
          {selectedColor.toUpperCase()}
        </span>
      </div>

      {/* Color Input */}
      <div className="mb-3">
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => dispatch(setSelectedColor(e.target.value))}
          className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
          title="Pick a custom color"
        />
      </div>

      {/* Preset Colors */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {presetColors.map((color) => (
          <button
            key={color}
            onClick={() => dispatch(setSelectedColor(color))}
            className={`w-8 h-8 rounded-lg border-2 transition-all ${
              selectedColor === color
                ? "border-blue-500 scale-110 shadow-md"
                : "border-gray-300 hover:border-gray-400 hover:scale-105"
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      {/* Additional Color Palettes for Testing Scroll */}
      <div className="mt-4">
        <h6 className="text-xs font-medium text-gray-600 mb-2">Pastels</h6>
        <div className="grid grid-cols-4 gap-2">
          {['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFBA', '#BAE1FF', '#D4BAFF', '#FFBAF0', '#FFCCCB', '#FFF0E6', '#E6FFE6', '#E6F7FF', '#F0E6FF'].map((color) => (
            <button
              key={color}
              onClick={() => dispatch(setSelectedColor(color))}
              className={`w-8 h-8 rounded-lg border-2 transition-all ${
                selectedColor === color
                  ? "border-blue-500 scale-110 shadow-md"
                  : "border-gray-300 hover:border-gray-400 hover:scale-105"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className="mt-4">
        <h6 className="text-xs font-medium text-gray-600 mb-2">Earth Tones</h6>
        <div className="grid grid-cols-4 gap-2">
          {['#8B4513', '#A0522D', '#CD853F', '#DEB887', '#F4A460', '#D2691E', '#BC8F8F', '#F5DEB3', '#DDD5C7', '#C19A6B', '#E6E6FA', '#D3D3D3'].map((color) => (
            <button
              key={color}
              onClick={() => dispatch(setSelectedColor(color))}
              className={`w-8 h-8 rounded-lg border-2 transition-all ${
                selectedColor === color
                  ? "border-blue-500 scale-110 shadow-md"
                  : "border-gray-300 hover:border-gray-400 hover:scale-105"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className="mt-4">
        <h6 className="text-xs font-medium text-gray-600 mb-2">Neon Colors</h6>
        <div className="grid grid-cols-4 gap-2">
          {['#FF073A', '#FF6600', '#FFFF00', '#00FF00', '#00FFFF', '#0099FF', '#9900FF', '#FF00FF', '#FF3300', '#FF9900', '#CCFF00', '#00FF99'].map((color) => (
            <button
              key={color}
              onClick={() => dispatch(setSelectedColor(color))}
              className={`w-8 h-8 rounded-lg border-2 transition-all ${
                selectedColor === color
                  ? "border-blue-500 scale-110 shadow-md"
                  : "border-gray-300 hover:border-gray-400 hover:scale-105"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Recent Colors */}
      {recentColors.length > 0 && (
        <div className="mt-4">
          <h6 className="text-xs font-medium text-gray-600 mb-2">Recent</h6>
          <div className="grid grid-cols-4 gap-2">
            {recentColors.slice(0, 8).map((color, index) => (
              <button
                key={`${color}-${index}`}
                onClick={() => dispatch(setSelectedColor(color))}
                className={`w-8 h-8 rounded-lg border-2 transition-all ${
                  selectedColor === color
                    ? "border-blue-500 scale-110 shadow-md"
                    : "border-gray-300 hover:border-gray-400 hover:scale-105"
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );

  const renderPropertiesSection = (toolId: string) => (
    <div>
      <h5 className="text-sm font-medium text-gray-700 uppercase tracking-wide flex items-center gap-2 mb-3">
        <Sliders size={14} />
        Properties
      </h5>

      {/* Text-specific properties */}
      {toolId === "text" && (
        <>
          {/* Font Size */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Font Size: {fontSize}px
            </label>
            <input
              type="range"
              min="8"
              max="72"
              step="1"
              value={fontSize}
              onChange={(e) => dispatch(setFontSize(Number(e.target.value)))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Font Family */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Font Family
            </label>
            <select
              value={fontFamily}
              onChange={(e) => dispatch(setFontFamily(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
              <option value="Courier New">Courier New</option>
            </select>
          </div>

          {/* Font Weight */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Font Weight
            </label>
            <select
              value={fontWeight}
              onChange={(e) => dispatch(setFontWeight(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
              <option value="lighter">Light</option>
            </select>
          </div>

          {/* Font Style */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Font Style
            </label>
            <select
              value={fontStyle}
              onChange={(e) => dispatch(setFontStyle(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="normal">Normal</option>
              <option value="italic">Italic</option>
            </select>
          </div>

          {/* Text Alignment */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Text Alignment
            </label>
            <select
              value={textAlign}
              onChange={(e) => dispatch(setTextAlign(e.target.value as 'left' | 'center' | 'right'))}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </>
      )}

      {/* Stroke Width - For all tools except eraser */}
      {toolId !== "eraser" && toolId !== "text" && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-2">
            Stroke Width: {strokeWidth}px
          </label>
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={strokeWidth}
            onChange={(e) => dispatch(setStrokeWidth(Number(e.target.value)))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      )}

      {/* Eraser Size - Only for eraser */}
      {toolId === "eraser" && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-2">
            Eraser Size: {eraserSize}px
          </label>
          <input
            type="range"
            min="5"
            max="50"
            step="1"
            value={eraserSize}
            onChange={(e) => dispatch(setEraserSize(Number(e.target.value)))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      )}

      {/* Opacity - For all tools except eraser */}
      {toolId !== "eraser" && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-2">
            Opacity: {Math.round(opacity * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={opacity}
            onChange={(e) => dispatch(setOpacity(Number(e.target.value)))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      )}
    </div>
  );

  const renderToolDialog = (toolId: string) => {
    const tool = tools.find((t) => t.id === toolId);
    if (!tool || !tool.hasDialog) return null;

    let toolOptions: any[] = [];
    let currentType = "";

    switch (toolId) {
      case "pen":
        currentType = penType;
        toolOptions = [
          {
            id: "ballpoint" as PenType,
            label: "Ballpoint",
            desc: "Precise, consistent",
          },
          {
            id: "felt-tip" as PenType,
            label: "Felt-tip",
            desc: "Bold strokes",
          },
          { id: "gel" as PenType, label: "Gel", desc: "Smooth, vibrant" },
          {
            id: "fountain" as PenType,
            label: "Fountain",
            desc: "Pressure sensitive",
          },
          {
            id: "laser" as PenType,
            label: "Laser Pointer",
            desc: "Temporary marks",
          },
        ];
        break;
      case "pencil":
        currentType = pencilType;
        toolOptions = [
          { id: "HB" as PencilType, label: "HB", desc: "Medium hardness" },
          { id: "2B" as PencilType, label: "2B", desc: "Soft, darker" },
          { id: "4B" as PencilType, label: "4B", desc: "Very soft, rich" },
        ];
        break;
      case "brush":
        currentType = brushType;
        toolOptions = [
          {
            id: "watercolor" as BrushType,
            label: "Watercolor",
            desc: "Transparent, blendable",
          },
          { id: "marker" as BrushType, label: "Marker", desc: "Bold, opaque" },
        ];
        break;
      case "eraser":
        currentType = eraserType;
        toolOptions = [
          {
            id: "precision" as EraserType,
            label: "Precision",
            desc: "Small, accurate",
          },
          { id: "wide" as EraserType, label: "Wide", desc: "Large area" },
        ];
        break;
      case "text":
        // Text tool doesn't need type options, just color and properties
        toolOptions = [];
        break;
    }

    return (
      <div
        className="fixed bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-slideDown"
        style={{
          left: `${dialogPosition.left}px`,
          top: `${dialogPosition.top}px`,
          width: `${Math.min(800, window.innerWidth - 32)}px`,
          height: `${Math.min(
            600,
            window.innerHeight - dialogPosition.top - 16
          )}px`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Connection indicator */}
        <div
          className="absolute bg-blue-500"
          style={{
            left: "50%",
            top: "-4px",
            transform: "translateX(-50%)",
            width: "40px",
            height: "4px",
            borderRadius: "2px",
          }}
        />

        {/* Scrollable content */}
        <div className="dialog-scroll" style={{ 
          overflowY: 'auto', 
          flex: '1',
          minHeight: '0'
        }}>
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h4 className="text-xl font-semibold text-gray-700 flex items-center gap-3">
                {getToolIcon(tool)}
                {tool.label} Settings
              </h4>
              <button
                onClick={() => setActiveDialog(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Horizontal Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tool Type Options - Only show if tool has options */}
              {toolOptions.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-gray-700 uppercase tracking-wide flex items-center gap-2">
                    {getToolIcon(tool)}
                    {tool.label} Types
                  </h5>
                  <div className="grid grid-cols-1 gap-2 max-h-48 dialog-scroll" style={{ overflowY: 'auto' }}>
                    {toolOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          switch (toolId) {
                            case "pen":
                              dispatch(setPenType(option.id as PenType));
                              break;
                            case "pencil":
                              dispatch(setPencilType(option.id as PencilType));
                              break;
                            case "brush":
                              dispatch(setBrushType(option.id as BrushType));
                              break;
                            case "eraser":
                              dispatch(setEraserType(option.id as EraserType));
                              break;
                          }
                          // Tool is already selected from handleToolClick
                        }}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          currentType === option.id
                            ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {option.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Section - Only for non-eraser tools */}
              {toolId !== "eraser" && (
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-gray-700 uppercase tracking-wide flex items-center gap-2">
                    <Palette size={14} />
                    Colors
                  </h5>
                  {renderColorPicker()}
                </div>
              )}

              {/* Properties Section */}
              <div className="space-y-3">{renderPropertiesSection(toolId)}</div>
            </div>

            {/* OK Button */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end sticky bottom-0 bg-white z-10">
              <button
                onClick={() => setActiveDialog(null)}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderShapesDialog = () => (
    <div
      className="fixed bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-slideDown"
      style={{
        left: `${dialogPosition.left}px`,
        top: `${dialogPosition.top}px`,
        width: `${Math.min(800, window.innerWidth - 32)}px`,
        height: `${Math.min(
          600,
          window.innerHeight - dialogPosition.top - 16
        )}px`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Connection indicator */}
      <div
        className="absolute bg-blue-500"
        style={{
          left: "50%",
          top: "-4px",
          transform: "translateX(-50%)",
          width: "40px",
          height: "4px",
          borderRadius: "2px",
        }}
      />

      {/* Scrollable content */}
      <div className="dialog-scroll" style={{ 
        overflowY: 'auto', 
        flex: '1',
        minHeight: '0'
      }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h4 className="text-xl font-semibold text-gray-700 flex items-center gap-3">
              <Square size={20} />
              Shape Tools
            </h4>
            <button
              onClick={() => setActiveDialog(null)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Horizontal Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Shapes Grid */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-700 uppercase tracking-wide flex items-center gap-2">
                <Square size={14} />
                Shapes
              </h5>
              <div className="flex flex-row gap-6 pb-2 dialog-scroll" style={{ overflowX: 'auto' }}>
                {shapes.map((shape) => {
                  const Icon = shape.icon;
                  const isSelected = selectedTool === shape.id;
                  return (
                    <div key={shape.id} className="flex flex-col items-center w-20 min-w-[80px] flex-shrink-0">
                      <button
                        onClick={() => {
                          handleToolSelect(shape.id);
                          setActiveDialog(null);
                        }}
                        onMouseEnter={() => handleMouseEnter(shape.id)}
                        onMouseLeave={handleMouseLeave}
                        className={`w-full aspect-square flex items-center justify-center rounded-xl border-2 transition-all duration-200 shadow-sm
                          ${isSelected ? "bg-blue-100 border-blue-500 scale-105" : "bg-white border-gray-200 hover:bg-gray-50 hover:border-blue-300"}
                        `}
                        title={shape.label}
                        style={{ minHeight: 56 }}
                      >
                        <Icon size={32} className={isSelected ? "text-blue-600" : "text-gray-700"} />
                      </button>
                      <div className="text-xs text-center text-gray-600 mt-2 font-medium whitespace-nowrap w-full" style={{ minHeight: 18 }}>
                        {shape.label}
                      </div>
                      {/* Hover tooltip */}
                      {hoveredTool === shape.id && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-40 animate-fadeIn">
                          {shape.label}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Color Section */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-700 uppercase tracking-wide flex items-center gap-2">
                <Palette size={14} />
                Colors
              </h5>
              {renderColorPicker()}
            </div>

            {/* Properties Section */}
            <div className="space-y-3">
              {renderPropertiesSection("shapes")}
            </div>
          </div>

          {/* OK Button */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end sticky bottom-0 bg-white z-10">
            <button
              onClick={() => setActiveDialog(null)}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Shuffle tools array once per mount
  const shuffledTools = useMemo(() => {
    const arr = [...tools];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  return (
    <div
      ref={toolbarRef}
      className="fixed left-4 top-1/2 transform -translate-y-1/2 z-20"
    >
      <div className="bg-[#FFD6EC] rounded-3xl shadow-2xl border-2 border-[#FF8DCB] p-4">
        {/* Main Tools - Vertical Layout */}
        <div className="flex flex-col gap-2 mb-2">
          {shuffledTools.map((tool) => (
            <div key={tool.id} className="relative">
              <button
                ref={(el) => (toolRefs.current[tool.id] = el)}
                onClick={(e) => handleToolClick(tool, e)}
                onMouseEnter={() => handleMouseEnter(tool.id)}
                onMouseLeave={handleMouseLeave}
                className={`p-3 rounded-2xl transition-all duration-300 relative font-semibold text-base shadow-sm border-2 ${
                  selectedTool === tool.id
                    ? "bg-[#FF8DCB] text-white border-[#FF8DCB] scale-110 shadow-lg"
                    : "text-gray-700 bg-[#FFF9D6] border-transparent hover:bg-[#FFE6F7] hover:border-[#FF8DCB]"
                } ${activeDialog === tool.id ? "ring-2 ring-[#FF8DCB]" : ""}`}
                title={`${tool.label}${
                  tool.shortcut ? ` (${tool.shortcut})` : ""
                }`}
              >
                {getToolIcon(tool)}
                {tool.hasDialog && (
                  <ChevronDown
                    size={10}
                    className={`absolute top-1 right-1 transition-all duration-300 ${
                      activeDialog === tool.id ? "rotate-180" : ""
                    } ${
                      selectedTool === tool.id ? "text-white" : "text-[#FF8DCB]"
                    }`}
                  />
                )}
              </button>

              {/* Hover Label */}
              {hoveredTool === tool.id && !activeDialog && (
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-40 animate-fadeIn shadow-lg">
                  {tool.label}
                  {tool.shortcut && (
                    <span className="ml-2 opacity-75">({tool.shortcut})</span>
                  )}
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Shapes Menu */}
        <div className="relative mb-2">
          <button
            ref={(el) => (toolRefs.current["shapes"] = el)}
            onClick={handleShapesClick}
            onMouseEnter={() => handleMouseEnter("shapes")}
            onMouseLeave={handleMouseLeave}
            className={`p-3 rounded-2xl transition-all duration-300 relative font-semibold text-base shadow-sm border-2 ${
              shapes.some((s) => s.id === selectedTool)
                ? "bg-[#FF8DCB] text-white border-[#FF8DCB] scale-110 shadow-lg"
                : "text-gray-700 bg-[#FFF9D6] border-transparent hover:bg-[#FFE6F7] hover:border-[#FF8DCB]"
            } ${activeDialog === "shapes" ? "ring-2 ring-[#FF8DCB]" : ""}`}
            title="Shapes"
          >
            {shapes.find((s) => s.id === selectedTool) ? (
              React.createElement(
                shapes.find((s) => s.id === selectedTool)!.icon,
                { size: 20 }
              )
            ) : (
              <Square size={20} />
            )}
            <ChevronDown
              size={10}
              className={`absolute top-1 right-1 transition-all duration-300 ${
                activeDialog === "shapes" ? "rotate-180" : ""
              } ${
                shapes.some((s) => s.id === selectedTool)
                  ? "text-white"
                  : "text-[#FF8DCB]"
              }`}
            />
          </button>

          {/* Hover Label */}
          {hoveredTool === "shapes" && activeDialog !== "shapes" && (
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-40 animate-fadeIn shadow-lg">
              Shapes
              <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900" />
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 my-2" />

        {/* Grid Controls */}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => dispatch(toggleGrid())}
            onMouseEnter={() => handleMouseEnter("grid")}
            onMouseLeave={handleMouseLeave}
            className={`p-3 rounded-2xl transition-all duration-300 relative font-semibold text-base shadow-sm border-2 ${
              gridVisible
                ? "bg-[#FF8DCB] text-white border-[#FF8DCB] scale-110 shadow-lg"
                : "text-gray-700 bg-[#FFF9D6] border-transparent hover:bg-[#FFE6F7] hover:border-[#FF8DCB]"
            }`}
            title="Toggle Grid"
          >
            <Grid size={20} />
          </button>

          <button
            onClick={() => dispatch(toggleSnapToGrid())}
            onMouseEnter={() => handleMouseEnter("snap")}
            onMouseLeave={handleMouseLeave}
            className={`p-3 rounded-2xl transition-all duration-300 relative font-semibold text-base shadow-sm border-2 ${
              snapToGrid
                ? "bg-[#FF8DCB] text-white border-[#FF8DCB] scale-110 shadow-lg"
                : "text-gray-700 bg-[#FFF9D6] border-transparent hover:bg-[#FFE6F7] hover:border-[#FF8DCB]"
            }`}
            title="Snap to Grid"
          >
            <Move size={20} />
          </button>

          {/* Hover Labels for Grid Controls */}
          {hoveredTool === "grid" && (
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-40 animate-fadeIn shadow-lg">
              Toggle Grid
              <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900" />
            </div>
          )}
          {hoveredTool === "snap" && (
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-40 animate-fadeIn shadow-lg">
              Snap to Grid
              <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900" />
            </div>
          )}
        </div>
      </div>

      {/* Render dialogs outside toolbar container */}
      {activeDialog &&
        tools.find((t) => t.id === activeDialog) &&
        renderToolDialog(activeDialog)}
      {activeDialog === "shapes" && renderShapesDialog()}
    </div>
  );
};

export default Toolbar;
