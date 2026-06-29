import React, { useState, useRef, useEffect } from 'react';
import { 
  Ruler, Eye, EyeOff, Layers, Activity, Maximize2, Trash2, 
  Settings, Info, Compass, HelpCircle, HardDrive
} from 'lucide-react';

const BLUEPRINTS = {
  'skyview-301': {
    name: 'Shivalik Skyview - Premium 3 BHK (Unit 301)',
    scale: '1:50',
    rera: 'PR/GJ/AHMEDABAD/SW/1029',
    totalArea: '1840 sq.ft.',
    carpetArea: '1540 sq.ft.',
    rooms: [
      { id: 'living', name: 'Living & Dining Room', x: 20, y: 20, w: 220, h: 180, area: '396 sq.ft.', sunlight: '9.2/10', noise: '4.2/10', material: 'Italian Marble, Gypsum Board ceiling' },
      { id: 'master-bed', name: 'Master Suite Bedroom', x: 240, y: 20, w: 220, h: 200, area: '440 sq.ft.', sunlight: '8.8/10', noise: '3.5/10', material: 'Wooden Planks, Acoustical Acoustic Panel' },
      { id: 'kitchen', name: 'Premium Modular Kitchen', x: 20, y: 200, w: 140, h: 160, area: '224 sq.ft.', sunlight: '7.5/10', noise: '5.5/10', material: 'Vitrified Tiles, Quartz Countertops' },
      { id: 'bed-2', name: 'Kids Bedroom 2', x: 160, y: 200, w: 160, h: 160, area: '256 sq.ft.', sunlight: '8.0/10', noise: '4.8/10', material: 'Laminated Wood, Thermal Insulated Glass' },
      { id: 'bed-3', name: 'Guest Bedroom 3', x: 320, y: 220, w: 140, h: 140, area: '196 sq.ft.', sunlight: '8.2/10', noise: '4.0/10', material: 'Vitrified Tiles, Double Glazed Windows' },
      { id: 'balcony', name: 'Grand Deck Balcony', x: 460, y: 40, w: 20, h: 140, area: '96 sq.ft.', sunlight: '9.8/10', noise: '6.0/10', material: 'Anti-skid Ceramic Tiles, Glass Balustrade' }
    ],
    columns: [
      { id: 'col-1', x: 20, y: 20, load: 'High (80 tons)', type: 'RC Core Column' },
      { id: 'col-2', x: 230, y: 20, load: 'High (80 tons)', type: 'RC Core Column' },
      { id: 'col-3', x: 450, y: 20, load: 'Medium (60 tons)', type: 'RC Column' },
      { id: 'col-4', x: 20, y: 190, load: 'Medium (60 tons)', type: 'RC Column' },
      { id: 'col-5', x: 230, y: 190, load: 'High (100 tons)', type: 'Seismic Anchor Column' },
      { id: 'col-6', x: 450, y: 210, load: 'Medium (50 tons)', type: 'RC Column' },
      { id: 'col-7', x: 20, y: 350, load: 'Medium (65 tons)', type: 'RC Column' },
      { id: 'col-8', x: 150, y: 350, load: 'Medium (55 tons)', type: 'RC Column' },
      { id: 'col-9', x: 310, y: 350, load: 'Medium (55 tons)', type: 'RC Column' },
      { id: 'col-10', x: 450, y: 350, load: 'Medium (55 tons)', type: 'RC Column' }
    ],
    hvac: [
      { id: 'hvac-source', x: 140, y: 220, type: 'VRV Indoor Unit (5 HP)' },
      { id: 'duct-main', path: 'M 140,220 L 220,220 L 220,110 L 130,110' },
      { id: 'duct-branch1', path: 'M 220,220 L 220,250 L 240,250' },
      { id: 'duct-branch2', path: 'M 220,110 L 300,110' },
      { id: 'duct-branch3', path: 'M 300,110 L 300,180 L 360,180' },
      { id: 'grill-1', x: 110, y: 100, w: 20, h: 8, label: 'Diffuser' },
      { id: 'grill-2', x: 285, y: 105, w: 20, h: 8, label: 'Diffuser' },
      { id: 'grill-3', x: 245, y: 245, w: 10, h: 10, label: 'Exhaust' },
      { id: 'grill-4', x: 355, y: 175, w: 20, h: 8, label: 'Diffuser' }
    ],
    electrical: [
      { id: 'db-box', x: 25, y: 30, type: '3-Phase Distribution Board' },
      { id: 'wire-1', path: 'M 30,35 Q 80,45 130,60' }, // living light
      { id: 'wire-2', path: 'M 130,60 Q 180,50 200,90' }, // living socket
      { id: 'wire-3', path: 'M 30,35 Q 120,120 250,50' }, // to master bed
      { id: 'wire-4', path: 'M 250,50 Q 320,40 350,80' }, // master bed fan
      { id: 'wire-5', path: 'M 30,35 Q 40,150 50,220' }, // to kitchen
      { id: 'wire-6', path: 'M 50,220 Q 90,240 100,280' }, // kitchen appliances
      { id: 'outlet-1', x: 200, y: 90, label: '16A Plug' },
      { id: 'outlet-2', x: 350, y: 80, label: 'Fan Regulator' },
      { id: 'outlet-3', x: 100, y: 280, label: 'Oven Anchor' },
      { id: 'switch-1', x: 40, y: 40, label: 'S1 (Lounge)' },
      { id: 'switch-2', x: 250, y: 30, label: 'S2 (Bed)' }
    ],
    plumbing: [
      { id: 'wet-riser', x: 150, y: 345, type: 'Vertical Utility Shaft' },
      { id: 'pipe-hot', path: 'M 150,345 L 150,300 L 90,300 L 90,260', color: '#ef4444' }, // Kitchen Hot water
      { id: 'pipe-cold', path: 'M 150,345 L 140,345 L 140,290 L 80,290 L 80,260', color: '#3b82f6' }, // Kitchen Cold water
      { id: 'drain-line', path: 'M 150,345 L 170,345 L 170,300 L 220,300', color: '#64748b' } // Bathroom waste
    ]
  },
  'highlife-1204': {
    name: 'Shivalik Highlife - Compact 2 BHK (Unit 1204)',
    scale: '1:50',
    rera: 'PR/GJ/AHMEDABAD/SW/4401',
    totalArea: '1240 sq.ft.',
    carpetArea: '1050 sq.ft.',
    rooms: [
      { id: 'living', name: 'Living & Dining Hall', x: 30, y: 30, w: 180, h: 160, area: '288 sq.ft.', sunlight: '8.5/10', noise: '5.0/10', material: 'Vitrified Tiles, Acrylic Emulsion paint' },
      { id: 'master-bed', name: 'Master Bedroom', x: 210, y: 30, w: 200, h: 160, area: '320 sq.ft.', sunlight: '8.0/10', noise: '4.0/10', material: 'Wooden Laminate Flooring' },
      { id: 'kitchen', name: 'Kitchen & Utility Area', x: 30, y: 190, w: 120, h: 140, area: '168 sq.ft.', sunlight: '7.0/10', noise: '5.8/10', material: 'Granite Countertops, Anti-skid tiles' },
      { id: 'bed-2', name: 'Regular Bedroom 2', x: 150, y: 190, w: 150, h: 140, area: '210 sq.ft.', sunlight: '7.8/10', noise: '4.5/10', material: 'Ceramic Tiling' },
      { id: 'balcony', name: 'Front View Balcony', x: 410, y: 50, w: 30, h: 120, area: '60 sq.ft.', sunlight: '9.0/10', noise: '6.5/10', material: 'S.S. Railing, Toughened Safety Glass' }
    ],
    columns: [
      { id: 'col-1', x: 30, y: 30, load: 'Medium (60 tons)', type: 'RC Beam Column' },
      { id: 'col-2', x: 210, y: 30, load: 'High (70 tons)', type: 'RC Core Column' },
      { id: 'col-3', x: 410, y: 30, load: 'Medium (50 tons)', type: 'RC Column' },
      { id: 'col-4', x: 30, y: 190, load: 'Medium (55 tons)', type: 'RC Column' },
      { id: 'col-5', x: 210, y: 190, load: 'High (80 tons)', type: 'Structural Core Column' },
      { id: 'col-6', x: 410, y: 170, load: 'Medium (40 tons)', type: 'RC Column' },
      { id: 'col-7', x: 30, y: 330, load: 'Medium (50 tons)', type: 'RC Column' },
      { id: 'col-8', x: 150, y: 330, load: 'Medium (50 tons)', type: 'RC Column' },
      { id: 'col-9', x: 300, y: 330, load: 'Medium (45 tons)', type: 'RC Column' }
    ],
    hvac: [
      { id: 'hvac-source', x: 130, y: 200, type: 'Split Unit ODU Connect' },
      { id: 'duct-main', path: 'M 130,200 L 170,200 L 170,120 L 100,120' },
      { id: 'duct-branch1', path: 'M 170,120 L 230,120' },
      { id: 'grill-1', x: 80, y: 115, w: 16, h: 6, label: 'Grill' },
      { id: 'grill-2', x: 235, y: 115, w: 16, h: 6, label: 'Grill' }
    ],
    electrical: [
      { id: 'db-box', x: 35, y: 40, type: 'Single Phase DB' },
      { id: 'wire-1', path: 'M 40,45 Q 90,60 120,80' },
      { id: 'wire-2', path: 'M 40,45 Q 120,100 220,50' },
      { id: 'outlet-1', x: 120, y: 80, label: '6A Socket' },
      { id: 'outlet-2', x: 220, y: 50, label: 'AC Socket' },
      { id: 'switch-1', x: 45, y: 50, label: 'Sw-1' }
    ],
    plumbing: [
      { id: 'wet-riser', x: 135, y: 320, type: 'Shaft 2' },
      { id: 'pipe-cold', path: 'M 135,320 L 135,280 L 80,280 L 80,240', color: '#3b82f6' },
      { id: 'drain-line', path: 'M 135,320 L 155,320 L 155,270', color: '#64748b' }
    ]
  },
  'greenwoods-v1': {
    name: 'Shivalik Greenwoods - Luxury Villa 1 (5 BHK Master Ground Layout)',
    scale: '1:75',
    rera: 'PR/GJ/AHMEDABAD/SW/8821',
    totalArea: '4800 sq.ft.',
    carpetArea: '3650 sq.ft.',
    rooms: [
      { id: 'foyer', name: 'Grand Entrance Foyer', x: 200, y: 320, w: 100, h: 50, area: '120 sq.ft.', sunlight: '8.0/10', noise: '3.0/10', material: 'Custom Terrazzo Flooring' },
      { id: 'living', name: 'Palatial Double-Height Lounge', x: 40, y: 60, w: 260, h: 260, area: '780 sq.ft.', sunlight: '9.5/10', noise: '2.5/10', material: 'Premium White Statuario Marble' },
      { id: 'kitchen', name: 'Open Kitchen & Show Dinette', x: 300, y: 60, w: 160, h: 180, area: '380 sq.ft.', sunlight: '9.0/10', noise: '4.2/10', material: 'German Cabinetry, Quartzite Island' },
      { id: 'guest-suite', name: 'Ground Floor Guest Suite', x: 300, y: 240, w: 160, h: 130, area: '260 sq.ft.', sunlight: '8.5/10', noise: '3.0/10', material: 'Teak Wooden Flooring' },
      { id: 'verandah', name: 'Lawn-Facing Verandah Deck', x: 40, y: 320, w: 160, h: 50, area: '180 sq.ft.', sunlight: '9.9/10', noise: '2.0/10', material: 'Hardwood Ipe Decking, Glass Railings' }
    ],
    columns: [
      { id: 'col-1', x: 40, y: 60, load: 'High (100 tons)', type: 'Reinforced Column' },
      { id: 'col-2', x: 170, y: 60, load: 'High (100 tons)', type: 'Reinforced Column' },
      { id: 'col-3', x: 300, y: 60, load: 'High (120 tons)', type: 'Mega Shear Column' },
      { id: 'col-4', x: 460, y: 60, load: 'High (100 tons)', type: 'Reinforced Column' },
      { id: 'col-5', x: 40, y: 190, load: 'High (80 tons)', type: 'Reinforced Column' },
      { id: 'col-6', x: 300, y: 190, load: 'High (120 tons)', type: 'Mega Shear Column' },
      { id: 'col-7', x: 460, y: 190, load: 'High (80 tons)', type: 'Reinforced Column' },
      { id: 'col-8', x: 40, y: 320, load: 'High (100 tons)', type: 'Reinforced Column' },
      { id: 'col-9', x: 200, y: 320, load: 'High (90 tons)', type: 'Reinforced Column' },
      { id: 'col-10', x: 300, y: 320, load: 'High (110 tons)', type: 'Mega Shear Column' },
      { id: 'col-11', x: 460, y: 370, load: 'High (80 tons)', type: 'Reinforced Column' }
    ],
    hvac: [
      { id: 'hvac-source', x: 380, y: 100, type: 'Daikin VRV Chiller unit (10 HP)' },
      { id: 'duct-main', path: 'M 380,100 L 380,40 L 170,40 L 170,120 L 100,120' },
      { id: 'duct-branch1', path: 'M 170,40 L 170,180 L 110,180' },
      { id: 'duct-branch2', path: 'M 380,100 L 380,260 L 340,260' },
      { id: 'grill-1', x: 80, y: 115, w: 20, h: 8, label: 'Linear' },
      { id: 'grill-2', x: 90, y: 175, w: 20, h: 8, label: 'Linear' },
      { id: 'grill-3', x: 330, y: 255, w: 16, h: 8, label: 'Return' }
    ],
    electrical: [
      { id: 'db-box', x: 310, y: 70, type: 'Smart Automation Panel (KNX)' },
      { id: 'wire-1', path: 'M 315,75 Q 230,120 170,170' },
      { id: 'wire-2', path: 'M 315,75 Q 360,180 340,270' },
      { id: 'outlet-1', x: 170, y: 170, label: 'Smart Keypad' },
      { id: 'outlet-2', x: 340, y: 270, label: 'AC Plug' },
      { id: 'switch-1', x: 220, y: 330, label: 'Main Control Gateway' }
    ],
    plumbing: [
      { id: 'wet-riser', x: 440, y: 80, type: 'Borewell Supply Riser' },
      { id: 'pipe-cold', path: 'M 440,80 L 400,80 L 400,120', color: '#3b82f6' },
      { id: 'drain-line', path: 'M 440,80 L 450,80 L 450,220', color: '#64748b' }
    ]
  }
};

export default function AutoCADWorkspace({ 
  selectedUnit = 'skyview-301',
  layers = { dimensions: true, hvac: false, electrical: false, structural: false, plumbing: false },
  onLayerToggle,
  onUnitChange,
  highlightedRooms = []
}) {
  const blueprint = BLUEPRINTS[selectedUnit] || BLUEPRINTS['skyview-301'];
  
  // States
  const [hoveredRoom, setHoveredRoom] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, clientX: 0, clientY: 0 });
  const [measureActive, setMeasureActive] = useState(false);
  const [measureStart, setMeasureStart] = useState(null);
  const [measureTemp, setMeasureTemp] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  
  const svgRef = useRef(null);

  // Clear measurements on unit change
  useEffect(() => {
    setMeasurements([]);
    setMeasureStart(null);
    setMeasureTemp(null);
  }, [selectedUnit]);

  // Track cursor position inside SVG
  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) * (500 / rect.width));
    const y = Math.round((e.clientY - rect.top) * (400 / rect.height));
    
    setMousePos({ 
      x: Math.max(0, Math.min(500, x)), 
      y: Math.max(0, Math.min(400, y)),
      clientX: e.clientX,
      clientY: e.clientY
    });

    if (measureActive && measureStart) {
      setMeasureTemp({ x: Math.max(0, Math.min(500, x)), y: Math.max(0, Math.min(400, y)) });
    }
  };

  // Handle SVG click for measurement
  const handleSVGClick = () => {
    if (!measureActive) return;

    if (!measureStart) {
      setMeasureStart({ x: mousePos.x, y: mousePos.y });
      setMeasureTemp({ x: mousePos.x, y: mousePos.y });
    } else {
      const dx = mousePos.x - measureStart.x;
      const dy = mousePos.y - measureStart.y;
      const pixelDist = Math.sqrt(dx * dx + dy * dy);
      
      const multiplier = selectedUnit === 'greenwoods-v1' ? 0.12 : 0.08;
      const realDistance = (pixelDist * multiplier).toFixed(1);
      
      const newMeasure = {
        id: `m-${Date.now()}`,
        x1: measureStart.x,
        y1: measureStart.y,
        x2: mousePos.x,
        y2: mousePos.y,
        distance: `${realDistance} ft`
      };

      setMeasurements([...measurements, newMeasure]);
      setMeasureStart(null);
      setMeasureTemp(null);
    }
  };

  const handleCancelMeasure = () => {
    setMeasureStart(null);
    setMeasureTemp(null);
    setMeasureActive(false);
  };

  const clearAllMeasurements = () => {
    setMeasurements([]);
    setMeasureStart(null);
    setMeasureTemp(null);
  };

  return (
    <div className="autocad-workspace">
      {/* Workbench Toolbar */}
      <div className="cad-toolbar">
        <div className="cad-toolbar-left">
          <div className="cad-logo">
            <Compass className="cad-icon text-gold animate-spin-slow" size={14} />
            <span className="cad-logo-text">CAD</span>
          </div>
          <select 
            value={selectedUnit} 
            onChange={(e) => onUnitChange && onUnitChange(e.target.value)}
            className="cad-project-select"
          >
            <option value="skyview-301">Skyview (3 BHK - 1840 sq.ft)</option>
            <option value="highlife-1204">Highlife (2 BHK - 1240 sq.ft)</option>
            <option value="greenwoods-v1">Greenwoods (5 BHK Villa - 4800 sq.ft)</option>
          </select>
        </div>

        <div className="cad-toolbar-right">
          <button 
            className={`btn-cad-tool ${measureActive ? 'active' : ''}`}
            onClick={() => {
              if (measureActive) {
                handleCancelMeasure();
              } else {
                setMeasureActive(true);
              }
            }}
            title="Laser Measure Tool"
          >
            <Ruler size={13} className={measureActive ? 'text-gold' : ''} />
            <span>{measureActive ? 'Cancel' : 'Ruler Measure'}</span>
          </button>
          {measurements.length > 0 && (
            <button 
              className="btn-cad-tool text-hot" 
              onClick={clearAllMeasurements}
              title="Clear measurements"
            >
              <Trash2 size={13} />
              <span>Clear ({measurements.length})</span>
            </button>
          )}
        </div>
      </div>

      <div className="cad-main-layout">
        {/* Top Section: Drawing Canvas */}
        <div className="cad-canvas-container">
          {measureActive && (
            <div className="ruler-banner">
              <span className="bullet-glow-yellow"></span>
              <span>{measureStart ? 'Click target endpoint to measure' : 'Click starting point on drawing to anchor ruler'}</span>
            </div>
          )}
          
          <div className="cad-canvas-grid">
            <svg 
              ref={svgRef}
              viewBox="0 0 500 400" 
              className="cad-svg-canvas"
              onMouseMove={handleMouseMove}
              onClick={handleSVGClick}
              style={{ cursor: measureActive ? 'crosshair' : 'default' }}
            >
              {/* AutoCAD Grid Lines */}
              <defs>
                <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
                  <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="0.5" />
                  <path d="M 125 0 L 0 0 0 125" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Room Hover Zones */}
              {blueprint.rooms.map((room) => {
                const isHighlighted = highlightedRooms.includes(room.id);
                const isHovered = hoveredRoom && hoveredRoom.id === room.id;
                
                return (
                  <g key={room.id}>
                    <rect 
                      x={room.x} 
                      y={room.y} 
                      width={room.w} 
                      height={room.h} 
                      className={`cad-room-zone ${isHighlighted ? 'ai-highlighted' : ''} ${isHovered ? 'hovered' : ''}`}
                      onMouseEnter={() => !measureActive && setHoveredRoom(room)}
                      onMouseLeave={() => setHoveredRoom(null)}
                    />
                    
                    {/* Room boundary walls */}
                    <rect 
                      x={room.x} 
                      y={room.y} 
                      width={room.w} 
                      height={room.h} 
                      fill="none" 
                      stroke="#475569" 
                      strokeWidth="2.5" 
                      strokeDasharray="2 1" 
                    />
                    
                    {/* Room labels */}
                    <text 
                      x={room.x + room.w / 2} 
                      y={room.y + room.h / 2 - 4} 
                      textAnchor="middle" 
                      className="cad-room-label"
                    >
                      {room.name}
                    </text>
                    <text 
                      x={room.x + room.w / 2} 
                      y={room.y + room.h / 2 + 12} 
                      textAnchor="middle" 
                      className="cad-room-sublabel"
                    >
                      {room.area}
                    </text>
                  </g>
                );
              })}

              {/* LAYER: DIMENSIONS */}
              {layers.dimensions && (
                <g className="cad-layer-dimensions fade-in">
                  {blueprint.rooms.map((room) => (
                    <g key={`dim-${room.id}`} opacity="0.85">
                      <line 
                        x1={room.x + 8} 
                        y1={room.y + 12} 
                        x2={room.x + room.w - 8} 
                        y2={room.y + 12} 
                        stroke="#f59e0b" 
                        strokeWidth="0.8" 
                      />
                      <line x1={room.x + 8} y1={8} x2={room.x + 8} y2={16} stroke="#f59e0b" strokeWidth="0.8" />
                      <line x1={room.x + room.w - 8} y1={8} x2={room.x + room.w - 8} y2={16} stroke="#f59e0b" strokeWidth="0.8" />
                      
                      <line 
                        x1={room.x + 12} 
                        y1={room.y + 8} 
                        x2={room.x + 12} 
                        y2={room.y + room.h - 8} 
                        stroke="#f59e0b" 
                        strokeWidth="0.8" 
                      />
                      <line x1={8} y1={room.y + 8} x2={16} y2={room.y + 8} stroke="#f59e0b" strokeWidth="0.8" />
                      <line x1={8} y1={room.y + room.h - 8} x2={16} y2={room.y + room.h - 8} stroke="#f59e0b" strokeWidth="0.8" />

                      <text x={room.x + room.w / 2} y={22} textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="bold">
                        {Math.round(room.w * (selectedUnit === 'greenwoods-v1' ? 0.12 : 0.08))} ft
                      </text>
                      <text x={22} y={room.y + room.h / 2} textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="bold" transform={`rotate(-90 22 ${room.y + room.h/2})`}>
                        {Math.round(room.h * (selectedUnit === 'greenwoods-v1' ? 0.12 : 0.08))} ft
                      </text>
                    </g>
                  ))}
                </g>
              )}

              {/* LAYER: STRUCTURAL COLUMNS */}
              {layers.structural && (
                <g className="cad-layer-structural fade-in">
                  {blueprint.columns.map((col) => (
                    <g key={col.id}>
                      <rect 
                        x={col.x - 5} 
                        y={col.y - 5} 
                        width="10" 
                        height="10" 
                        fill={col.load.includes('High') ? '#ef4444' : '#3b82f6'} 
                        stroke="#ffffff"
                        strokeWidth="0.5"
                        className="cad-pillar-block"
                      />
                      <title>{`${col.type} - Load capacity: ${col.load}`}</title>
                    </g>
                  ))}
                </g>
              )}

              {/* LAYER: HVAC VENTILATION */}
              {layers.hvac && (
                <g className="cad-layer-hvac fade-in">
                  {blueprint.hvac.filter(h => h.path).map((duct) => (
                    <path 
                      key={duct.id} 
                      d={duct.path} 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="3.5" 
                      strokeDasharray="4 3" 
                      className="cad-hvac-duct"
                    />
                  ))}
                  {blueprint.hvac.filter(h => h.type).map((src) => (
                    <g key={src.id}>
                      <rect x={src.x - 8} y={src.y - 8} width="16" height="16" fill="#047857" stroke="#10b981" strokeWidth="1" />
                      <line x1={src.x - 8} y1={src.y - 8} x2={src.x + 8} y2={src.y + 8} stroke="#10b981" strokeWidth="1" />
                      <line x1={src.x + 8} y1={src.y - 8} x2={src.x - 8} y2={src.y + 8} stroke="#10b981" strokeWidth="1" />
                    </g>
                  ))}
                  {blueprint.hvac.filter(h => h.w).map((grill) => (
                    <g key={grill.id}>
                      <rect x={grill.x} y={grill.y} width={grill.w} height={grill.h} fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" strokeWidth="1" />
                      <line x1={grill.x} y1={grill.y} x2={grill.x + grill.w} y2={grill.y + grill.h} stroke="#10b981" strokeWidth="0.5" />
                      <line x1={grill.x + grill.w} y1={grill.y} x2={grill.x} y2={grill.y + grill.h} stroke="#10b981" strokeWidth="0.5" />
                    </g>
                  ))}
                </g>
              )}

              {/* LAYER: ELECTRICAL */}
              {layers.electrical && (
                <g className="cad-layer-electrical fade-in">
                  {blueprint.electrical.filter(e => e.type).map((db) => (
                    <g key={db.id}>
                      <rect x={db.x - 6} y={db.y - 6} width="12" height="12" fill="#0e7490" stroke="#06b6d4" strokeWidth="1" />
                    </g>
                  ))}
                  {blueprint.electrical.filter(e => e.path).map((wire) => (
                    <path 
                      key={wire.id} 
                      d={wire.path} 
                      fill="none" 
                      stroke="#06b6d4" 
                      strokeWidth="1.2" 
                      strokeDasharray="2 2" 
                      opacity="0.8"
                    />
                  ))}
                  {blueprint.electrical.filter(e => e.label).map((node) => (
                    <g key={node.id}>
                      <circle cx={node.x} cy={node.y} r="3.5" fill="#0b0f19" stroke="#06b6d4" strokeWidth="1" />
                    </g>
                  ))}
                </g>
              )}

              {/* LAYER: PLUMBING */}
              {layers.plumbing && (
                <g className="cad-layer-plumbing fade-in">
                  {blueprint.plumbing.filter(p => p.type).map((riser) => (
                    <g key={riser.id}>
                      <circle cx={riser.x} cy={riser.y} r="6" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
                    </g>
                  ))}
                  {blueprint.plumbing.filter(p => p.path).map((pipe, idx) => (
                    <path 
                      key={`pipe-${idx}`}
                      d={pipe.path} 
                      fill="none" 
                      stroke={pipe.color} 
                      strokeWidth="2" 
                    />
                  ))}
                </g>
              )}

              {/* RULER ACTIVE MEASUREMENT */}
              {measureActive && measureStart && measureTemp && (
                <g>
                  <line 
                    x1={measureStart.x} 
                    y1={measureStart.y} 
                    x2={measureTemp.x} 
                    y2={measureTemp.y} 
                    stroke="#fbbf24" 
                    strokeWidth="1.5" 
                    strokeDasharray="4 2" 
                  />
                  <circle cx={measureStart.x} cy={measureStart.y} r="4" fill="#fbbf24" />
                  <circle cx={measureTemp.x} cy={measureTemp.y} r="4" fill="#fbbf24" />
                  <text 
                    x={(measureStart.x + measureTemp.x) / 2} 
                    y={(measureStart.y + measureTemp.y) / 2 - 8} 
                    fill="#fbbf24" 
                    fontSize="9.5" 
                    fontWeight="bold"
                    textAnchor="middle"
                    className="cad-measure-bubble"
                  >
                    {`${(Math.sqrt((measureTemp.x - measureStart.x)**2 + (measureTemp.y - measureStart.y)**2) * (selectedUnit === 'greenwoods-v1' ? 0.12 : 0.08)).toFixed(1)} ft`}
                  </text>
                </g>
              )}

              {/* PERSISTENT MEASUREMENTS */}
              {measurements.map((m) => (
                <g key={m.id}>
                  <line x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2} stroke="#fbbf24" strokeWidth="1.5" />
                  <circle cx={m.x1} cy={m.y1} r="3" fill="#fbbf24" />
                  <circle cx={m.x2} cy={m.y2} r="3" fill="#fbbf24" />
                  <text 
                    x={(m.x1 + m.x2) / 2} 
                    y={(m.y1 + m.y2) / 2 - 8} 
                    fill="#fbbf24" 
                    fontSize="9" 
                    fontWeight="bold"
                    textAnchor="middle"
                    className="cad-measure-bubble locked"
                  >
                    {m.distance}
                  </text>
                </g>
              ))}
            </svg>

            {/* Room Tooltip */}
            {hoveredRoom && (
              <div 
                className="cad-tooltip-floating glass-card"
                style={{ 
                  left: `${mousePos.x > 320 ? mousePos.clientX - 240 : mousePos.clientX + 16}px`, 
                  top: `${mousePos.clientY - 120}px` 
                }}
              >
                <h4>{hoveredRoom.name}</h4>
                <div className="cad-tooltip-grid">
                  <div className="tooltip-row">
                    <span>Configured Area:</span>
                    <strong>{hoveredRoom.area}</strong>
                  </div>
                  <div className="tooltip-row">
                    <span>Sunlight Index:</span>
                    <strong className="text-gold">{hoveredRoom.sunlight}</strong>
                  </div>
                  <div className="tooltip-row">
                    <span>Noise Insulation:</span>
                    <strong>{hoveredRoom.noise}</strong>
                  </div>
                  <div className="tooltip-row flex-col mt-1" style={{ alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '9px', marginBottom: '2px' }}>Material Specification:</span>
                    <span className="spec-val" style={{ textAlign: 'left', fontStyle: 'italic', color: '#cbd5e1' }}>{hoveredRoom.material}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Horizontal Control Panel */}
        <div className="cad-bottom-panel">
          {/* Col 1: Layer Selector */}
          <div className="cad-panel-col layer-col">
            <h4><Layers size={13} className="text-gold" /> Layers Control</h4>
            <div className="cad-layer-grid">
              <label className="cad-switch-inline">
                <input 
                  type="checkbox" 
                  checked={layers.dimensions} 
                  onChange={() => onLayerToggle && onLayerToggle('dimensions')} 
                />
                <span className={`layer-chip ${layers.dimensions ? 'active' : ''}`}>
                  <span className="layer-dot" style={{ background: '#f59e0b' }}></span>
                  Dimensions
                </span>
              </label>
              <label className="cad-switch-inline">
                <input 
                  type="checkbox" 
                  checked={layers.hvac} 
                  onChange={() => onLayerToggle && onLayerToggle('hvac')} 
                />
                <span className={`layer-chip ${layers.hvac ? 'active' : ''}`}>
                  <span className="layer-dot" style={{ background: '#10b981' }}></span>
                  HVAC Duct
                </span>
              </label>
              <label className="cad-switch-inline">
                <input 
                  type="checkbox" 
                  checked={layers.electrical} 
                  onChange={() => onLayerToggle && onLayerToggle('electrical')} 
                />
                <span className={`layer-chip ${layers.electrical ? 'active' : ''}`}>
                  <span className="layer-dot" style={{ background: '#06b6d4' }}></span>
                  Electrical
                </span>
              </label>
              <label className="cad-switch-inline">
                <input 
                  type="checkbox" 
                  checked={layers.structural} 
                  onChange={() => onLayerToggle && onLayerToggle('structural')} 
                />
                <span className={`layer-chip ${layers.structural ? 'active' : ''}`}>
                  <span className="layer-dot" style={{ background: '#ef4444' }}></span>
                  Pillars
                </span>
              </label>
              <label className="cad-switch-inline">
                <input 
                  type="checkbox" 
                  checked={layers.plumbing} 
                  onChange={() => onLayerToggle && onLayerToggle('plumbing')} 
                />
                <span className={`layer-chip ${layers.plumbing ? 'active' : ''}`}>
                  <span className="layer-dot" style={{ background: '#3b82f6' }}></span>
                  Plumbing
                </span>
              </label>
            </div>
          </div>

          {/* Col 2: Metadata Info */}
          <div className="cad-panel-col info-col">
            <h4><Info size={13} className="text-gold" /> Specifications</h4>
            <div className="cad-specs-grid">
              <div className="spec-item">
                <span className="spec-label">RERA:</span>
                <span className="spec-value text-gold text-truncate" title={blueprint.rera}>{blueprint.rera}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Carpet Area:</span>
                <span className="spec-value">{blueprint.carpetArea}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Scale Ratio:</span>
                <span className="spec-value">{blueprint.scale}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AutoCAD terminal bottom status bar */}
      <div className="cad-status-bar font-small">
        <div className="cad-status-left">
          <span className="status-indicator-green"></span>
          <span>SYSTEM READY</span>
          <span className="status-separator">|</span>
          <span>CURSOR X: <strong className="text-gold">{mousePos.x}</strong>, Y: <strong className="text-gold">{mousePos.y}</strong> px</span>
          <span className="status-separator">|</span>
          <span>ACTIVE UNIT: <strong className="text-gold">{selectedUnit.toUpperCase()}</strong></span>
        </div>
        <div className="cad-status-right">
          <span className="text-muted">GRID: 25px</span>
          <span className="status-separator">|</span>
          <span className="text-muted">OSNAP: ON</span>
          <span className="status-separator">|</span>
          <span className="text-gold font-bold">BUFFER OK // 100% SYNC</span>
        </div>
      </div>
    </div>
  );
}
