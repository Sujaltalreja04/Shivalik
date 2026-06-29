import React, { useState, useEffect, useRef } from 'react';
import { Compass, RotateCw, ZoomIn, ZoomOut, Eye, Move } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// PURE CSS 3D TOWNSHIP & INTERIOR VIEWER
// Enhanced with Dynamic Shadows, Floating Clouds, Fountain Spray, Night streetlights,
// Camera Presets, and Theme Styles (Realistic, Blueprint, Cyberpunk).
// ─────────────────────────────────────────────────────────────────────────────

export default function ThreeDViewer({
  mode = 'interior',
  interiorStyle = 'Modern',
  interiorBudget = 1000000,
  timeOfDay = 12,
  selectedTower = null,
  onSelectTower = null,
  onSelectAmenity = null,
  highlightFloor = null,
}) {
  const [rotY, setRotY] = useState(mode === 'township' ? -30 : -20);
  const [rotX, setRotX] = useState(mode === 'township' ? -25 : -18);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredTower, setHoveredTower] = useState(null);
  const [tick, setTick] = useState(0);
  const [visualStyle, setVisualStyle] = useState('realistic'); // 'realistic', 'blueprint', 'cyberpunk'
  const containerRef = useRef(null);

  // Animate window lights blinking & fountain water
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1200);
    return () => clearInterval(id);
  }, []);

  const isNight = timeOfDay > 17 || timeOfDay < 7;

  // ── Mouse drag to orbit ───────────────────────────────────────────────────
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setDragStart({ x: e.clientX, y: e.clientY });
    setRotY(r => r + dx * 0.4);
    setRotX(r => Math.min(5, Math.max(-85, r - dy * 0.3)));
  };
  const handleMouseUp = () => setIsDragging(false);

  // Touch drag support
  const lastTouch = useRef(null);
  const handleTouchStart = (e) => {
    lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchMove = (e) => {
    if (!lastTouch.current) return;
    const dx = e.touches[0].clientX - lastTouch.current.x;
    const dy = e.touches[0].clientY - lastTouch.current.y;
    lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setRotY(r => r + dx * 0.4);
    setRotX(r => Math.min(5, Math.max(-85, r - dy * 0.3)));
  };
  const handleTouchEnd = () => { lastTouch.current = null; };

  // Camera presets
  const applyViewPreset = (preset) => {
    if (preset === 'isometric') {
      setRotX(-25);
      setRotY(-30);
      setZoom(1);
    } else if (preset === 'walkthrough') {
      setRotX(-8);
      setRotY(45);
      setZoom(1.6);
    } else if (preset === 'sitemap') {
      setRotX(-80);
      setRotY(0);
      setZoom(0.95);
    } else if (preset === 'cinematic') {
      setRotX(-15);
      setRotY(135);
      setZoom(1.3);
    }
  };

  // Skybox gradients & lighting ambient colors
  const getSkyStyle = (hour) => {
    if (hour >= 5 && hour < 8) {
      // Sunrise
      return {
        bg: 'linear-gradient(180deg, #1e1b4b 0%, #4c1d95 45%, #db2777 75%, #f59e0b 100%)',
        sunColor: 'radial-gradient(circle, #ffffff 10%, #fb7185 50%, #f59e0b 100%)',
        sunGlow: '0 0 50px 20px rgba(244,63,94,0.4)',
        ambient: '#2e1b4e'
      };
    } else if (hour >= 8 && hour < 16) {
      // Midday
      return {
        bg: 'linear-gradient(180deg, #0284c7 0%, #0ea5e9 50%, #38bdf8 80%, #bae6fd 100%)',
        sunColor: 'radial-gradient(circle, #ffffff 20%, #fffbeb 50%, #facc15 100%)',
        sunGlow: '0 0 60px 25px rgba(250,204,21,0.5)',
        ambient: '#bae6fd'
      };
    } else if (hour >= 16 && hour < 18) {
      // Sunset / Golden hour
      return {
        bg: 'linear-gradient(180deg, #0f172a 0%, #7c2d12 40%, #ea580c 75%, #f59e0b 100%)',
        sunColor: 'radial-gradient(circle, #fffbeb 20%, #ea580c 60%, #b45309 100%)',
        sunGlow: '0 0 50px 22px rgba(234,88,12,0.45)',
        ambient: '#7c2d12'
      };
    } else if (hour >= 18 && hour < 20) {
      // Twilight
      return {
        bg: 'linear-gradient(180deg, #020617 0%, #1e1b4b 50%, #311042 80%, #7c2d12 100%)',
        sunColor: 'radial-gradient(circle, #fbcfe8 20%, #db2777 60%, #4c1d95 100%)',
        sunGlow: '0 0 40px 15px rgba(219,39,119,0.3)',
        ambient: '#1e1b4b'
      };
    } else {
      // Deep Night
      return {
        bg: 'linear-gradient(180deg, #020617 0%, #070f22 60%, #090d16 100%)',
        sunColor: 'radial-gradient(circle, #f8fafc 30%, #e2e8f0 70%, #94a3b8 100%)',
        sunGlow: '0 0 35px 10px rgba(226,232,240,0.25)',
        ambient: '#090d16'
      };
    }
  };

  const sky = getSkyStyle(timeOfDay);
  let backgroundStyle = sky.bg;
  if (visualStyle === 'blueprint') {
    backgroundStyle = 'radial-gradient(circle at center, #08142c 0%, #020716 100%)';
  } else if (visualStyle === 'cyberpunk') {
    backgroundStyle = 'linear-gradient(180deg, #0b031b 0%, #1c092f 60%, #020008 100%)';
  }

  const sceneStyle = {
    width: '100%',
    height: '100%',
    minHeight: '500px',
    position: 'relative',
    background: backgroundStyle,
    overflow: 'hidden',
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none',
    transition: 'background 0.5s ease',
  };

  const perspectiveStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    perspective: '1000px',
    perspectiveOrigin: '50% 35%',
  };

  const sceneRotStyle = {
    transformStyle: 'preserve-3d',
    transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${zoom})`,
    transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
    position: 'relative',
    width: mode === 'township' ? '480px' : '360px',
    height: mode === 'township' ? '480px' : '360px',
  };

  const sunAngleOffset = ((timeOfDay - 12) * 5); // move sun left/right
  const sunTopOffset = Math.max(8, 40 - Math.abs(timeOfDay - 12) * 2.5);

  return (
    <div
      style={sceneStyle}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      ref={containerRef}
    >
      {/* Stars (night only, hidden in blueprint) */}
      {isNight && visualStyle !== 'blueprint' && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {[...Array(50)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: i % 4 === 0 ? '3px' : '1.5px',
              height: i % 4 === 0 ? '3px' : '1.5px',
              borderRadius: '50%',
              background: 'white',
              opacity: 0.35 + (i % 6) * 0.1,
              top: `${(i * 41 + 13) % 65}%`,
              left: `${(i * 59 + 9) % 100}%`,
              animation: `twinkle ${1.2 + (i % 3) * 0.6}s ease-in-out infinite alternate`,
            }} />
          ))}
        </div>
      )}

      {/* Sun / Moon (glow changes dynamically, hidden in blueprint) */}
      {visualStyle !== 'blueprint' && (
        <div style={{
          position: 'absolute',
          top: `${sunTopOffset}%`,
          left: `calc(50% + ${sunAngleOffset}px)`,
          width: isNight ? '36px' : '52px',
          height: isNight ? '36px' : '52px',
          borderRadius: '50%',
          background: isNight ? 'radial-gradient(circle, #f8fafc, #cbd5e1)' : sky.sunColor,
          boxShadow: isNight ? '0 0 30px 10px rgba(226,232,240,0.2)' : sky.sunGlow,
          pointerEvents: 'none',
          transform: 'translateX(-50%)',
          transition: 'all 0.5s ease',
        }} />
      )}

      {/* 3D Scene */}
      <div style={perspectiveStyle}>
        <div style={sceneRotStyle}>
          {mode === 'township' ? (
            <TownshipScene
              selectedTower={selectedTower}
              onSelectTower={onSelectTower}
              onSelectAmenity={onSelectAmenity}
              hoveredTower={hoveredTower}
              setHoveredTower={setHoveredTower}
              isNight={isNight}
              tick={tick}
              highlightFloor={highlightFloor}
              visualStyle={visualStyle}
              timeOfDay={timeOfDay}
            />
          ) : (
            <InteriorScene
              style={interiorStyle}
              isNight={isNight}
              tick={tick}
            />
          )}
        </div>
      </div>

      {/* Top HUD Controls: Theme & Camera Presets */}
      <div style={{
        position: 'absolute', top: '16px', left: '16px', right: '16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        pointerEvents: 'none', zIndex: 10,
      }}>
        {/* Style Selection */}
        <div style={{ display: 'flex', gap: '6px', pointerEvents: 'auto' }}>
          {['realistic', 'blueprint', 'cyberpunk'].map((style) => (
            <button
              key={style}
              onClick={() => setVisualStyle(style)}
              style={{
                padding: '5px 12px',
                borderRadius: '16px',
                background: visualStyle === style 
                  ? (style === 'blueprint' ? '#00f0ff' : style === 'cyberpunk' ? '#f43f5e' : '#D4AF37') 
                  : 'rgba(10,15,29,0.8)',
                border: `1px solid ${visualStyle === style ? 'transparent' : 'rgba(212,175,55,0.25)'}`,
                color: visualStyle === style ? '#020617' : '#D4AF37',
                fontSize: '10px',
                fontWeight: 800,
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                textTransform: 'capitalize',
                transition: 'all 0.2s ease',
                boxShadow: visualStyle === style 
                  ? `0 0 15px ${style === 'blueprint' ? 'rgba(0,240,255,0.4)' : style === 'cyberpunk' ? 'rgba(244,63,94,0.4)' : 'rgba(212,175,55,0.4)'}` 
                  : 'none',
              }}
            >
              {style === 'realistic' ? '🎨 Realistic' : style === 'blueprint' ? '📐 Blueprint' : '👾 Cyberpunk'}
            </button>
          ))}
        </div>

        {/* View Angle Presets (Township only) */}
        {mode === 'township' && (
          <div style={{ display: 'flex', gap: '6px', pointerEvents: 'auto' }}>
            {[
              { id: 'isometric', label: '📐 Isometric' },
              { id: 'walkthrough', label: '🚶 Walk' },
              { id: 'sitemap', label: '🗺️ Map' },
              { id: 'cinematic', label: '🎬 Cinematic' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => applyViewPreset(p.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '16px',
                  background: 'rgba(10,15,29,0.8)',
                  border: '1px solid rgba(212,175,55,0.25)',
                  color: '#D4AF37',
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.2s ease',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom HUD Controls */}
      <div style={{
        position: 'absolute', bottom: '16px', left: '16px', right: '16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        pointerEvents: 'none', zIndex: 10,
      }}>
        <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto' }}>
          <HudBtn onClick={() => setRotY(r => r - 20)} title="Rotate Left">
            <RotateCw size={14} style={{ transform: 'scaleX(-1)' }} />
          </HudBtn>
          <HudBtn onClick={() => setRotY(r => r + 20)} title="Rotate Right">
            <RotateCw size={14} />
          </HudBtn>
          <HudBtn onClick={() => { setRotY(mode === 'township' ? -30 : -20); setRotX(mode === 'township' ? -25 : -18); setZoom(1); }} title="Reset View">
            <Compass size={14} />
          </HudBtn>
        </div>
        <div style={{ display: 'flex', gap: '6px', pointerEvents: 'auto' }}>
          <HudBtn onClick={() => setZoom(z => Math.min(2, z + 0.15))} title="Zoom In">
            <ZoomIn size={14} />
          </HudBtn>
          <HudBtn onClick={() => setZoom(z => Math.max(0.5, z - 0.15))} title="Zoom Out">
            <ZoomOut size={14} />
          </HudBtn>
        </div>
      </div>

      {/* Drag Hint */}
      <div style={{
        position: 'absolute', top: '65px', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(10,15,29,0.75)', border: '1px solid rgba(212,175,55,0.25)',
        borderRadius: '20px', padding: '5px 16px',
        color: '#94A3B8', fontSize: '11px', pointerEvents: 'none',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
      }}>
        <Move size={12} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle', color: '#D4AF37' }} />
        Drag canvas to orbit · Scroll to zoom
      </div>

      <style>{`
        @keyframes twinkle { from { opacity: 0.2; } to { opacity: 0.95; } }
        @keyframes windowPulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
        @keyframes poolRipple { 0%,100% { opacity: 0.55; transform: translate3d(-170px, -11px, -100px) rotateX(90deg) scale(1); } 50% { opacity: 0.85; transform: translate3d(-170px, -11px, -100px) rotateX(90deg) scale(1.03); } }
        @keyframes rotateFan { from { transform: rotateY(0deg); } to { transform: rotateY(360deg); } }
        @keyframes driftCloud1 { 0% { transform: translate3d(-280px, -230px, -120px); } 100% { transform: translate3d(280px, -230px, -120px); } }
        @keyframes driftCloud2 { 0% { transform: translate3d(-300px, -200px, 80px); } 100% { transform: translate3d(300px, -200px, 80px); } }
        @keyframes sprayWater {
          0% { transform: translate3d(0, 0, 0) scale(0.3); opacity: 1; }
          45% { transform: translate3d(var(--spray-x), -38px, var(--spray-z)) scale(1); opacity: 0.9; }
          100% { transform: translate3d(var(--spray-x-end), -6px, var(--spray-z-end)) scale(0.5); opacity: 0; }
        }
        @keyframes pulseBeacon { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        @keyframes pulseLightCone { 0%, 100% { opacity: 0.25; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}

// ─── HUD Button ───────────────────────────────────────────────────────────────
function HudBtn({ onClick, title, children }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: '34px', height: '34px', borderRadius: '10px',
      background: 'rgba(10,15,29,0.8)', border: '1px solid rgba(212,175,55,0.3)',
      color: '#D4AF37', cursor: 'pointer', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(10px)', transition: 'all 0.2s',
      pointerEvents: 'auto',
    }}>{children}</button>
  );
}

// ─── TOWNSHIP SCENE ───────────────────────────────────────────────────────────
function TownshipScene({ selectedTower, onSelectTower, onSelectAmenity, hoveredTower, setHoveredTower, isNight, tick, highlightFloor, visualStyle, timeOfDay }) {
  const gold = '#D4AF37';

  const buildingDef = (id, label, h, x, z, w = 60, d = 60, floors = 12) => ({
    id, label, h, x, z, w, d, floors,
    isSelected: selectedTower === id,
    isHovered: hoveredTower === id,
  });

  const towers = [
    buildingDef('A', 'Tower A', 200, -130, -80, 56, 56, 12),
    buildingDef('B', 'Tower B', 150, 30, -100, 52, 52, 9),
    buildingDef('C', 'Tower C', 240, 120, 40, 60, 60, 14),
  ];

  // Render ground projection shadow for buildings
  const renderShadow = (x, z, w, d, h) => {
    if (visualStyle === 'blueprint') return null;
    const hour = Math.max(6, Math.min(18, timeOfDay));
    const shadowStretchX = (hour - 12) * 1.5; // moves shadow left/right
    const shadowLengthZ = Math.abs(hour - 12) * 0.9; // stretches shadow

    const shadowWidth = w;
    const shadowHeight = d + Math.abs(hour - 12) * (h / 36) * 4;
    const shadowX = x - shadowStretchX * (h / 75);
    const shadowZ = z + shadowLengthZ * (h / 80);

    return (
      <div
        style={{
          position: 'absolute',
          width: `${shadowWidth}px`,
          height: `${shadowHeight}px`,
          background: visualStyle === 'cyberpunk' ? 'rgba(0, 0, 0, 0.65)' : 'rgba(1, 16, 5, 0.42)',
          filter: 'blur(5px)',
          transform: `translate3d(${shadowX - shadowWidth / 2}px, -6px, ${shadowZ - shadowHeight / 2}px) rotateX(90deg)`,
          borderRadius: '4px',
          transformStyle: 'preserve-3d',
          pointerEvents: 'none',
          transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      />
    );
  };

  // Aesthetic theme color selections
  const themeColors = {
    realistic: {
      ground: 'linear-gradient(135deg, #11381b 0%, #0d2b14 100%)',
      groundBorder: '#0b200e',
      road: '#1a1d24',
      garden: 'linear-gradient(135deg, #16522c 0%, #15803d 100%)',
      gardenBorder: '#0d3d1f',
      fountain: '#475569',
      gym: '#1e293b',
      gymBorder: 'rgba(212,175,55,0.2)',
      poolBorder: 'rgba(2,132,199,0.3)',
      laneMarker: 'rgba(255, 255, 255, 0.4)'
    },
    blueprint: {
      ground: 'rgba(2, 8, 28, 0.85)',
      groundBorder: '#00f0ff',
      road: 'rgba(0, 240, 255, 0.1)',
      garden: 'rgba(0, 240, 255, 0.05)',
      gardenBorder: 'rgba(0, 240, 255, 0.3)',
      fountain: 'rgba(0, 240, 255, 0.2)',
      gym: 'rgba(0, 240, 255, 0.08)',
      gymBorder: 'rgba(0,240,255,0.4)',
      poolBorder: 'rgba(0,240,255,0.4)',
      laneMarker: 'rgba(0, 240, 255, 0.3)'
    },
    cyberpunk: {
      ground: '#060312',
      groundBorder: '#f43f5e',
      road: '#110924',
      garden: 'rgba(168, 85, 247, 0.15)',
      gardenBorder: '#a855f7',
      fountain: '#2e0f4f',
      gym: '#1f0d3d',
      gymBorder: '#f43f5e',
      poolBorder: '#06b6d4',
      laneMarker: 'rgba(244, 63, 94, 0.5)'
    }
  };

  const colors = themeColors[visualStyle] || themeColors.realistic;

  return (
    <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d' }}>
      
      {/* 3D Floating Clouds */}
      {visualStyle !== 'blueprint' && (
        <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', width: '90px', height: '35px',
            background: 'rgba(255,255,255,0.35)', borderRadius: '25px', filter: 'blur(8px)',
            animation: 'driftCloud1 45s linear infinite',
            transformStyle: 'preserve-3d', '--cloud-z': '-120px'
          }} />
          <div style={{
            position: 'absolute', width: '120px', height: '40px',
            background: 'rgba(255,255,255,0.3)', borderRadius: '30px', filter: 'blur(10px)',
            animation: 'driftCloud2 60s linear infinite',
            transformStyle: 'preserve-3d', '--cloud-z': '80px'
          }} />
        </div>
      )}

      {/* Dynamic shadows */}
      {towers.map(t => renderShadow(t.x, t.z, t.w, t.d, t.h))}
      {renderShadow(-165, 40, 80, 70, 40)} {/* Gym Shadow */}

      {/* Ground plane */}
      <Box
        w={500} h={8} d={500}
        x={0} y={0} z={0}
        color={colors.ground}
        shadowColor="#030712"
        style={visualStyle !== 'realistic' ? { border: `1.5px solid ${colors.groundBorder}` } : {}}
      />

      {/* Roads */}
      <Box w={500} h={2} d={24} x={0} y={4} z={0} color={colors.road} shadowColor="#0a0a0d" />
      <Box w={24} h={2} d={500} x={0} y={4} z={0} color={colors.road} shadowColor="#0a0a0d" />

      {/* Dashed Road Lanes */}
      <div style={{
        position: 'absolute',
        width: '490px', height: '1px',
        borderTop: `1.5px dashed ${colors.laneMarker}`,
        transform: 'translate3d(-245px, -6px, 0px) rotateX(90deg)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        width: '1px', height: '490px',
        borderLeft: `1.5px dashed ${colors.laneMarker}`,
        transform: 'translate3d(0px, -6px, -245px) rotateX(90deg)',
        pointerEvents: 'none',
      }} />

      {/* Sidewalk curbs next to central garden */}
      <Box w={130} h={3} d={130} x={0} y={4} z={0} color={visualStyle === 'blueprint' ? 'transparent' : '#475569'} shadowColor="#000" />

      {/* Central garden lawn */}
      <Box 
        w={120} h={4} d={120} x={0} y={5} z={0} 
        color={colors.garden} 
        shadowColor={colors.gardenBorder} 
        style={visualStyle !== 'realistic' ? { border: `1px solid ${colors.gardenBorder}` } : {}}
      />

      {/* Circular stone fountain basin & column */}
      <Box w={24} h={6} d={24} x={0} y={7} z={0} color={colors.fountain} shadowColor="#111" />
      <Box w={8} h={14} d={8} x={0} y={11} z={0} color={visualStyle === 'blueprint' ? '#00f0ff' : '#D4AF37'} shadowColor="#222" />

      {/* Fountain animated spray particles */}
      {visualStyle !== 'blueprint' && (
        <div style={{ position: 'absolute', transform: 'translate3d(0px, -25px, 0px)', transformStyle: 'preserve-3d', pointerEvents: 'none' }}>
          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const distance = 16;
            const sx = Math.cos(angle) * distance * 0.55;
            const sz = Math.sin(angle) * distance * 0.55;
            const sxEnd = Math.cos(angle) * distance * 1.1;
            const szEnd = Math.sin(angle) * distance * 1.1;
            return (
              <div key={i} style={{
                position: 'absolute',
                width: '4px', height: '4px',
                borderRadius: '50%',
                background: visualStyle === 'cyberpunk' ? '#f43f5e' : '#38bdf8',
                boxShadow: `0 0 6px ${visualStyle === 'cyberpunk' ? '#f43f5e' : '#0ea5e9'}`,
                transformStyle: 'preserve-3d',
                animation: 'sprayWater 1.5s infinite',
                animationDelay: `${i * 0.12}s`,
                '--spray-x': `${sx}px`,
                '--spray-z': `${sz}px`,
                '--spray-x-end': `${sxEnd}px`,
                '--spray-z-end': `${szEnd}px`,
              }} />
            );
          })}
        </div>
      )}

      {/* Swimming Pool Basin */}
      <Box 
        w={90} h={4} d={60} x={-170} y={4} z={-100} 
        color={colors.road} 
        shadowColor="#122640" 
        style={visualStyle !== 'realistic' ? { border: `1px solid ${colors.poolBorder}` } : {}}
      />
      {/* Pool water layer with dynamic opacity ripple */}
      {visualStyle !== 'blueprint' && (
        <div
          onClick={() => onSelectAmenity?.('Clubhouse Pool')}
          style={{
            position: 'absolute',
            width: '84px', height: '54px',
            background: visualStyle === 'cyberpunk' 
              ? 'linear-gradient(135deg, #06b6d4, #0891b2)' 
              : 'linear-gradient(135deg, #0284c7, #0369a1)',
            borderRadius: '4px',
            boxShadow: `0 0 20px ${visualStyle === 'cyberpunk' ? 'rgba(6,182,212,0.6)' : 'rgba(2,132,199,0.5)'}`,
            transform: 'translate3d(-170px, -11px, -100px) rotateX(90deg)',
            cursor: 'pointer',
            animation: 'poolRipple 3.5s ease-in-out infinite',
            transformStyle: 'preserve-3d',
          }}
        />
      )}

      {/* Pool loungers & parasols for extra realism */}
      {visualStyle === 'realistic' && (
        <>
          <Box w={14} h={3} d={6} x={-195} y={6} z={-65} color="#cbd5e1" shadowColor="#475569" />
          <Box w={14} h={3} d={6} x={-175} y={6} z={-65} color="#cbd5e1" shadowColor="#475569" />
          <Box w={14} h={3} d={6} x={-155} y={6} z={-65} color="#cbd5e1" shadowColor="#475569" />
          {/* Parasols */}
          <Box w={1} h={15} d={1} x={-185} y={6} z={-62} color="#475569" shadowColor="#111" />
          <Box w={10} h={2} d={10} x={-185} y={21} z={-62} color="#D4AF37" shadowColor="#111" style={{ borderRadius: '50%' }} />
        </>
      )}

      {/* Clubhouse Gym */}
      <Box w={80} h={40} d={70} x={-165} y={24} z={40} 
        color={colors.gym} 
        shadowColor="#0b0e14"
        label="SHIVALIK GYM" 
        labelColor={visualStyle === 'cyberpunk' ? '#f43f5e' : '#D4AF37'}
        onClick={() => onSelectAmenity?.('Clubhouse Gym')} 
        hoverable
        style={{
          border: `1.5px solid ${colors.gymBorder}`,
          boxShadow: isNight && visualStyle !== 'blueprint' 
            ? (visualStyle === 'cyberpunk' ? '0 0 25px rgba(244,63,94,0.3)' : '0 0 20px rgba(212,175,55,0.25)') 
            : 'none'
        }}
      />

      {/* Night Streetlamps */}
      <Streetlamp x={-50} z={20} isNight={isNight} visualStyle={visualStyle} />
      <Streetlamp x={50} z={-20} isNight={isNight} visualStyle={visualStyle} />
      <Streetlamp x={20} z={60} isNight={isNight} visualStyle={visualStyle} />
      <Streetlamp x={-20} z={-60} isNight={isNight} visualStyle={visualStyle} />

      {/* Landscape Trees */}
      {[[-60,-150],[-90,-120],[60,-140],[150,-60],[180,100],[-50,140],[-160,80],[100,-160]].map(([tx,tz],i) => (
        <Tree key={i} x={tx} z={tz} h={28 + (i%3)*12} isNight={isNight} visualStyle={visualStyle} />
      ))}

      {/* Skyscraper Towers */}
      {towers.map(t => (
        <Tower
          key={t.id}
          {...t}
          gold={gold}
          isNight={isNight}
          tick={tick}
          onClick={() => onSelectTower?.(t.id)}
          onHover={() => setHoveredTower(t.id)}
          onLeave={() => setHoveredTower(null)}
          visualStyle={visualStyle}
        />
      ))}

      {/* Floating details badge above the selected tower */}
      {towers.filter(t => t.isSelected).map(t => (
        <div key={t.id + '-label'} style={{
          position: 'absolute',
          transform: `translate3d(${t.x - 55}px, ${-(t.h + 60)}px, ${t.z}px)`,
          background: visualStyle === 'cyberpunk' ? '#f43f5e' : visualStyle === 'blueprint' ? '#00f0ff' : 'rgba(212,175,55,0.95)',
          color: '#020617',
          padding: '5px 14px',
          borderRadius: '24px',
          fontSize: '11px',
          fontWeight: 800,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.25)',
          transition: 'all 0.3s ease',
        }}>
          📍 {t.label} (Selected)
        </div>
      ))}
    </div>
  );
}

// ─── TOWER COMPONENT (High-Fidelity) ──────────────────────────────────────────
function Tower({ id, label, h, x, z, w, d, floors, gold, isSelected, isHovered, isNight, tick, onClick, onHover, onLeave, visualStyle }) {
  
  // Dynamic glow borders and body materials based on styles
  let glowColor = isSelected ? gold : isHovered ? '#94a3b8' : '#334155';
  let bodyColor = isSelected
    ? 'linear-gradient(180deg, #251c02 0%, #120e01 100%)'
    : 'linear-gradient(180deg, #101622 0%, #06090e 100%)';
  let glowIntensity = isSelected ? '0 0 35px rgba(212,175,55,0.5)' : isHovered ? '0 0 20px rgba(148,163,184,0.25)' : 'none';

  if (visualStyle === 'blueprint') {
    glowColor = isSelected ? '#00f0ff' : isHovered ? 'rgba(0, 240, 255, 0.7)' : 'rgba(0, 240, 255, 0.3)';
    bodyColor = 'rgba(2, 10, 28, 0.9)';
    glowIntensity = isSelected ? '0 0 30px rgba(0,240,255,0.45)' : isHovered ? '0 0 15px rgba(0,240,255,0.2)' : 'none';
  } else if (visualStyle === 'cyberpunk') {
    glowColor = isSelected ? '#a855f7' : isHovered ? '#f43f5e' : '#3d166d';
    bodyColor = isSelected ? '#0d0418' : '#140726';
    glowIntensity = isSelected ? '0 0 30px rgba(168,85,247,0.5)' : isHovered ? '0 0 20px rgba(244,63,94,0.3)' : 'none';
  }

  // Lobby Podium dimensions
  const podW = w + 12;
  const podD = d + 12;
  const podH = 16;

  // Cantilevered side balconies
  const balconies = [];
  const totalHeightMinusLobby = h - podH - 12;
  const balconyRows = Math.floor(floors / 3);
  for (let b = 0; b < balconyRows; b++) {
    const floorY = podH + 6 + (b / balconyRows) * totalHeightMinusLobby;
    balconies.push(
      <React.Fragment key={b}>
        {/* Left balcony box */}
        <Box w={5} h={3} d={d - 14} x={x - w/2 - 2.5} y={floorY} z={z} 
          color={visualStyle === 'blueprint' ? 'rgba(0,240,255,0.1)' : visualStyle === 'cyberpunk' ? '#f43f5e' : '#475569'} 
          shadowColor="#000"
          style={visualStyle !== 'realistic' ? { border: `1px solid ${glowColor}` } : {}}
        />
        {/* Right balcony box */}
        <Box w={5} h={3} d={d - 14} x={x + w/2 + 2.5} y={floorY} z={z} 
          color={visualStyle === 'blueprint' ? 'rgba(0,240,255,0.1)' : visualStyle === 'cyberpunk' ? '#f43f5e' : '#475569'} 
          shadowColor="#000"
          style={visualStyle !== 'realistic' ? { border: `1px solid ${glowColor}` } : {}}
        />
      </React.Fragment>
    );
  }

  return (
    <g3 style={{ position: 'absolute', transformStyle: 'preserve-3d' }}>
      
      {/* 1. Base Lobby Podium */}
      <Box w={podW} h={podH} d={podD} x={x} y={0} z={z} 
        color={visualStyle === 'blueprint' ? 'rgba(2,10,28,0.95)' : visualStyle === 'cyberpunk' ? '#18072d' : '#2d3748'} 
        shadowColor="#030712"
        style={{ border: `1.5px solid ${glowColor}` }}
        label={isSelected ? "LOBBY ACTIVE" : `TOWER ${label}`}
        labelColor={visualStyle === 'cyberpunk' ? '#f43f5e' : visualStyle === 'blueprint' ? '#00f0ff' : gold}
      />

      {/* 2. Main Tower Building Body */}
      <div
        onClick={onClick}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        style={{
          position: 'absolute',
          width: `${w}px`, height: `${h - podH}px`,
          transform: `translate3d(${x - w / 2}px, ${-(h)}px, ${z - d / 2}px)`,
          transformStyle: 'preserve-3d',
          cursor: 'pointer',
        }}
      >
        {/* Front Face with Window Grid */}
        <div style={{
          position: 'absolute', width: `${w}px`, height: `${h - podH}px`,
          background: bodyColor,
          border: `1.5px solid ${glowColor}`,
          boxShadow: glowIntensity,
          transform: `translateZ(${d / 2}px)`,
          transition: 'all 0.3s ease',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'flex-end', paddingBottom: '8px',
        }}>
          {/* Windows on front face */}
          <div style={{ position: 'absolute', inset: '8px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '5px', padding: '6px' }}>
            {[...Array(Math.min(floors * 3, 27))].map((_, i) => {
              let bg = 'rgba(255,255,255,0.04)';
              let glow = 'none';
              if (visualStyle === 'blueprint') {
                bg = 'rgba(0, 240, 255, 0.16)';
                glow = '0 0 3px rgba(0, 240, 255, 0.4)';
              } else if (visualStyle === 'cyberpunk') {
                const colors = ['#f43f5e', '#06b6d4', '#eab308', '#a855f7'];
                const c = colors[(i + tick) % colors.length];
                const lit = isNight && ((i + tick) % 3 !== 2);
                bg = lit ? c : 'rgba(255,255,255,0.04)';
                glow = lit ? `0 0 7px ${c}` : 'none';
              } else {
                const lit = isNight && ((i + tick) % 4 !== 3);
                bg = lit ? '#FFE082' : 'rgba(255,255,255,0.03)';
                glow = lit ? '0 0 5px rgba(255,224,130,0.65)' : 'none';
              }
              return (
                <div key={i} style={{
                  background: bg,
                  borderRadius: '1px',
                  boxShadow: glow,
                  transition: 'all 0.8s ease',
                }} />
              );
            })}
          </div>
          {/* Base Label */}
          <div style={{
            position: 'absolute', bottom: '6px',
            background: isSelected ? (visualStyle === 'cyberpunk' ? '#f43f5e' : visualStyle === 'blueprint' ? '#00f0ff' : gold) : 'rgba(0,0,0,0.7)',
            color: isSelected ? '#020617' : '#cbd5e1',
            padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 800,
            letterSpacing: '0.5px',
            border: '1px solid rgba(255,255,255,0.1)',
            zIndex: 3
          }}>TOWER {label}</div>
        </div>

        {/* Right Face with Window Grid */}
        <div style={{
          position: 'absolute', width: `${d}px`, height: `${h - podH}px`,
          background: isSelected 
            ? (visualStyle === 'cyberpunk' ? '#120422' : visualStyle === 'blueprint' ? '#020d20' : '#1e1401')
            : (visualStyle === 'blueprint' ? 'rgba(2, 10, 28, 0.95)' : visualStyle === 'cyberpunk' ? '#110522' : '#0a0f18'),
          border: `1.5px solid ${glowColor}`,
          transform: `rotateY(-90deg) translateZ(${-d / 2}px) translateX(${-d}px)`,
          transition: 'all 0.3s ease',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'flex-end', paddingBottom: '8px',
        }}>
          {/* Windows on side face */}
          <div style={{ position: 'absolute', inset: '8px', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '5px', padding: '6px' }}>
            {[...Array(Math.min(floors * 2, 18))].map((_, i) => {
              let bg = 'rgba(255,255,255,0.04)';
              let glow = 'none';
              if (visualStyle === 'blueprint') {
                bg = 'rgba(0, 240, 255, 0.12)';
                glow = '0 0 2px rgba(0, 240, 255, 0.35)';
              } else if (visualStyle === 'cyberpunk') {
                const colors = ['#06b6d4', '#eab308', '#a855f7', '#f43f5e'];
                const c = colors[(i + tick + 1) % colors.length];
                const lit = isNight && ((i + tick + 1) % 4 !== 3);
                bg = lit ? c : 'rgba(255,255,255,0.04)';
                glow = lit ? `0 0 7px ${c}` : 'none';
              } else {
                const lit = isNight && ((i + tick + 2) % 3 !== 2);
                bg = lit ? '#FFE082' : 'rgba(255,255,255,0.03)';
                glow = lit ? '0 0 5px rgba(255,224,130,0.65)' : 'none';
              }
              return (
                <div key={i} style={{
                  background: bg,
                  borderRadius: '1px',
                  boxShadow: glow,
                  transition: 'all 0.8s ease',
                }} />
              );
            })}
          </div>
        </div>

        {/* Top Roof Face */}
        <div style={{
          position: 'absolute', width: `${w}px`, height: `${d}px`,
          background: isSelected ? (visualStyle === 'cyberpunk' ? '#a855f7' : visualStyle === 'blueprint' ? '#00f0ff' : gold) : '#1e293b',
          transform: `rotateX(90deg) translateZ(${-(h - podH)}px) translateY(${d / 2}px)`,
          transition: 'all 0.3s ease',
          border: `1px solid ${glowColor}`,
        }} />
      </div>

      {/* 3. Cantilevered Balconies geometry */}
      {balconies}

      {/* 4. Roof Crown & Helipad structure */}
      <Box w={w - 14} h={4} d={d - 14} x={x} y={h} z={z} 
        color={visualStyle === 'blueprint' ? 'rgba(2,10,28,0.95)' : visualStyle === 'cyberpunk' ? '#27084c' : '#4a5568'} 
        shadowColor="#000"
        style={{ border: `1px solid ${glowColor}` }}
      />
      {visualStyle !== 'blueprint' && (
        <>
          {/* Helipad painted marker */}
          <div style={{
            position: 'absolute',
            width: `${w - 22}px`, height: `${d - 22}px`,
            border: '2px solid rgba(255,255,255,0.7)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.75)', fontWeight: 800, fontSize: '11px',
            transform: `translate3d(${x - (w - 22)/2}px, ${-h - 5}px, ${z - (d - 22)/2}px) rotateX(90deg)`,
            transformStyle: 'preserve-3d', pointerEvents: 'none',
          }}>H</div>
        </>
      )}

      {/* 5. Flashing aircraft red beacon light */}
      {isNight && visualStyle !== 'blueprint' && (
        <div style={{
          position: 'absolute',
          width: '6px', height: '6px',
          borderRadius: '50%',
          background: '#ef4444',
          boxShadow: '0 0 12px 5px #ef4444',
          transform: `translate3d(${x - 3}px, ${-h - 6}px, ${z - 3}px)`,
          animation: 'pulseBeacon 1.2s infinite alternate',
          pointerEvents: 'none',
          zIndex: 5
        }} />
      )}
    </g3>
  );
}

// ─── STREET LAMP COMPONENT ───────────────────────────────────────────────────
function Streetlamp({ x, z, isNight, visualStyle }) {
  const isB = visualStyle === 'blueprint';
  const isC = visualStyle === 'cyberpunk';

  const glowColor = isB ? 'rgba(0, 240, 255, 0.4)' : isC ? '#f43f5e' : '#64748b';
  const bulbColor = isC ? '#00f0ff' : '#fbbf24';
  const coneGradient = isC 
    ? 'linear-gradient(to bottom, rgba(6,182,212,0.4) 0%, rgba(6,182,212,0) 100%)'
    : 'linear-gradient(to bottom, rgba(251,191,36,0.35) 0%, rgba(251,191,36,0) 100%)';

  return (
    <div style={{ position: 'absolute', transformStyle: 'preserve-3d', transform: `translate3d(${x}px, -28px, ${z}px)`, pointerEvents: 'none' }}>
      {/* Lamppost pole */}
      <Box w={2} h={28} d={2} x={0} y={0} z={0} color={isB ? 'rgba(0, 240, 255, 0.3)' : isC ? '#1d0c35' : '#475569'} shadowColor="#000" style={!isB ? {} : { border: `1px solid ${glowColor}` }} />
      {/* Lamp head */}
      <Box w={5} h={1.5} d={3.5} x={0} y={28} z={1} color={isB ? 'rgba(0, 240, 255, 0.4)' : isC ? '#3d0d5b' : '#1e293b'} shadowColor="#000" />
      
      {/* Light bulb glow */}
      {isNight && !isB && (
        <div style={{
          position: 'absolute',
          width: '3.5px', height: '3.5px',
          borderRadius: '50%',
          background: bulbColor,
          boxShadow: `0 0 10px 4px ${bulbColor}`,
          transform: 'translate3d(-1.75px, -28.75px, 1px)',
        }} />
      )}

      {/* Light cone projecting downward */}
      {isNight && !isB && (
        <div style={{
          position: 'absolute',
          width: '36px', height: '36px',
          background: coneGradient,
          clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)',
          transform: 'translate3d(-18px, -28px, 1px) rotateX(15deg)',
          transformOrigin: 'top center',
          animation: 'pulseLightCone 2s ease-in-out infinite',
        }} />
      )}
    </div>
  );
}

// ─── TREE ─────────────────────────────────────────────────────────────────────
function Tree({ x, z, h, isNight, visualStyle }) {
  const isB = visualStyle === 'blueprint';
  const isC = visualStyle === 'cyberpunk';

  let trunkColor = '#5c4033';
  let canopyColor = isNight ? '#0d3b1e' : '#15803d';

  if (isB) {
    trunkColor = 'rgba(0, 240, 255, 0.2)';
    canopyColor = 'rgba(0, 240, 255, 0.08)';
  } else if (isC) {
    trunkColor = '#1d0c35';
    canopyColor = 'rgba(236, 72, 153, 0.5)'; // Hot neon pink canopies
  }

  return (
    <>
      {/* Tree trunk */}
      <Box w={6} h={h * 0.4} d={6} x={x} y={h * 0.2} z={z} color={trunkColor} shadowColor="#000" style={isB ? { border: '1px solid rgba(0, 240, 255, 0.2)' } : {}} />
      {/* Tree canopy */}
      <Box w={h * 0.7} h={h * 0.6} d={h * 0.7} x={x} y={h * 0.7} z={z}
        color={canopyColor}
        shadowColor="#000"
        style={{ 
          borderRadius: '50% 50% 40% 40%',
          border: isB ? '1.5px solid rgba(0, 240, 255, 0.4)' : isC ? '1px solid #f43f5e' : 'none',
          boxShadow: isC ? '0 0 10px rgba(236, 72, 153, 0.3)' : 'none',
        }}
      />
    </>
  );
}

// ─── INTERIOR SCENE (High-Fidelity) ──────────────────────────────────────────
function InteriorScene({ style, isNight, tick }) {
  const palettes = {
    Modern:       { floor: '#3D1F0D', wall: '#0F172A', accent: '#D4AF37', sofa: '#1E293B', ceiling: '#0A0F1D' },
    Luxury:       { floor: '#F8FAFC', wall: '#1E1B4B', accent: '#D4AF37', sofa: '#312E81', ceiling: '#1a1839' },
    Scandinavian: { floor: '#D6B38C', wall: '#F1F5F9', accent: '#94A3B8', sofa: '#CBD5E1', ceiling: '#E2E8F0' },
    Minimalist:   { floor: '#94A3B8', wall: '#475569', accent: '#CBD5E1', sofa: '#334155', ceiling: '#1E293B' },
  };
  const p = palettes[style] || palettes.Modern;
  const gold = '#D4AF37';

  // Window scenic view backdrop
  const getWindowViewStyle = () => {
    if (isNight) {
      return {
        background: 'linear-gradient(to bottom, #020617 0%, #0d152c 60%, #1e1b4b 100%)',
        backgroundImage: 'radial-gradient(circle at 40% 30%, rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(to bottom, #020617 0%, #1e1b4b 100%)',
        backgroundSize: '15px 15px, 100% 100%',
        boxShadow: 'inset 0 0 35px rgba(56,189,248,0.22)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        overflow: 'hidden',
        position: 'relative'
      };
    } else {
      return {
        background: 'linear-gradient(to bottom, #7dd3fc 0%, #bae6fd 60%, #4ade80 100%)',
        boxShadow: 'inset 0 0 30px rgba(255,255,255,0.45)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        overflow: 'hidden',
        position: 'relative'
      };
    }
  };

  return (
    <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d' }}>
      
      {/* Floor */}
      <Box w={320} h={6} d={280} x={0} y={0} z={0} color={p.floor} shadowColor="#000" />
      {/* Ceiling */}
      <Box w={320} h={6} d={280} x={0} y={180} z={0} color={p.ceiling} shadowColor="#000" />
      {/* Back wall */}
      <Box w={320} h={180} d={6} x={0} y={90} z={-140} color={p.wall} shadowColor="#000" />
      {/* Left wall */}
      <Box w={6} h={180} d={280} x={-160} y={90} z={0} color={p.wall} shadowColor="#000" />
      {/* Right wall */}
      <Box w={6} h={180} d={280} x={160} y={90} z={0} color={p.wall} shadowColor="#000" />

      {/* Frame for Window on back wall */}
      <Box w={130} h={100} d={4} x={0} y={100} z={-138} color={gold} shadowColor="#000" />
      {/* Window Scenery View */}
      <div style={{
        position: 'absolute',
        width: '124px',
        height: '94px',
        transform: `translate3d(-62px, -147px, -136px)`,
        transformStyle: 'preserve-3d',
        ...getWindowViewStyle(),
        borderRadius: '2px',
      }}>
        {/* Scenery details */}
        {isNight ? (
          <div style={{ width: '100%', height: '35px', display: 'flex', alignItems: 'flex-end', gap: '3px', padding: '0 4px', background: 'transparent' }}>
            <div style={{ width: '14px', height: '26px', background: '#080c14', borderTop: '1px solid #1e293b' }} />
            <div style={{ width: '18px', height: '36px', background: '#030509', borderTop: '1px solid #1e293b' }} />
            <div style={{ width: '11px', height: '18px', background: '#080c14', borderTop: '1px solid #1e293b' }} />
            <div style={{ width: '24px', height: '32px', background: '#05070c', borderTop: '1px solid #1e293b' }} />
            <div style={{ width: '15px', height: '22px', background: '#040609', borderTop: '1px solid #1e293b' }} />
          </div>
        ) : (
          <div style={{ width: '100%', height: '28px', display: 'flex', alignItems: 'flex-end', gap: '2px', background: 'transparent' }}>
            {/* Soft rolling green hills */}
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to top, #166534, #22c55e)', borderRadius: '50% 50% 0 0', transform: 'scale(1.2) translateY(6px)' }} />
          </div>
        )}
      </div>

      {/* Ceiling light fixture */}
      <Box w={40} h={6} d={40} x={0} y={175} z={-20}
        color={gold}
        shadowColor="#000"
        style={{ boxShadow: isNight ? `0 0 60px 30px rgba(255,230,100,0.3)` : `0 0 30px 10px rgba(255,230,100,0.1)` }}
      />

      {/* Ceiling Fan rotating 3D */}
      <div style={{
        position: 'absolute',
        transform: 'translate3d(0px, -170px, -20px)',
        transformStyle: 'preserve-3d',
        pointerEvents: 'none'
      }}>
        {/* Fan Rod */}
        <Box w={2} h={15} d={2} x={0} y={0} z={0} color="#1e293b" shadowColor="#000" />
        {/* Rotating assembly */}
        <div style={{
          position: 'absolute',
          transform: 'translate3d(0, -15px, 0)',
          transformStyle: 'preserve-3d',
          animation: 'rotateFan 1.6s linear infinite',
        }}>
          {/* Fan body cap */}
          <Box w={12} h={3} d={12} x={0} y={0} z={0} color="#D4AF37" shadowColor="#000" />
          {/* Blades */}
          <Box w={58} h={1.2} d={6} x={29} y={0} z={0} color="#334155" shadowColor="#000" />
          <Box w={58} h={1.2} d={6} x={-29} y={0} z={0} color="#334155" shadowColor="#000" />
          <Box w={6} h={1.2} d={58} x={0} y={0} z={29} color="#334155" shadowColor="#000" />
          <Box w={6} h={1.2} d={58} x={0} y={0} z={-29} color="#334155" shadowColor="#000" />
        </div>
      </div>

      {/* Sofa Suite */}
      <Box w={180} h={30} d={70} x={0} y={30} z={60} color={p.sofa} shadowColor="#000" />
      <Box w={180} h={50} d={18} x={0} y={50} z={94} color={p.sofa} shadowColor="#000" />
      <Box w={22} h={50} d={70} x={-101} y={50} z={60} color={p.sofa} shadowColor="#000" />
      <Box w={22} h={50} d={70} x={101} y={50} z={60} color={p.sofa} shadowColor="#000" />

      {/* Coffee table */}
      <Box w={80} h={8} d={45} x={0} y={14} z={-10}
        color={style === 'Luxury' ? gold : '#334155'} shadowColor="#000"
      />
      {/* Table legs */}
      {[[-35,-18],[35,-18],[-35,12],[35,12]].map(([tx,tz],i) => (
        <Box key={i} w={6} h={14} d={6} x={tx} y={7} z={tz} color="#1E293B" shadowColor="#000" />
      ))}

      {/* TV unit on back wall */}
      <Box w={200} h={20} d={30} x={0} y={14} z={-120} color="#0F172A" shadowColor="#000" />
      {/* TV screen */}
      <Box w={160} h={90} d={6} x={0} y={80} z={-134}
        color={isNight ? '#10223d' : '#0F172A'}
        shadowColor="#000"
        style={{
          boxShadow: isNight ? '0 0 35px rgba(56,189,248,0.25)' : 'none',
        }}
      />

      {/* Decorative Framed Art Canvas on Left Wall */}
      <Box w={2} h={60} d={80} x={-158} y={100} z={0} color="#e2e8f0" shadowColor="#000" />
      <div style={{
        position: 'absolute',
        width: '76px', height: '56px',
        background: 'linear-gradient(45deg, #d4af37, #ec4899, #06b6d4)',
        transform: 'translate3d(-156px, -128px, -38px) rotateY(90deg)',
        border: '2.5px solid #0f172a',
        borderRadius: '2px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '9px',
        fontWeight: 800,
        letterSpacing: '1.5px',
        pointerEvents: 'none',
        transformStyle: 'preserve-3d',
      }}>
        SHIVALIK
      </div>

      {/* Floor lamp */}
      <Box w={6} h={120} d={6} x={130} y={60} z={-90} color="#334155" shadowColor="#000" />
      <Box w={24} h={20} d={24} x={130} y={126} z={-90}
        color={gold}
        shadowColor="#000"
        style={{ boxShadow: isNight ? '0 0 30px 15px rgba(255,220,80,0.25)' : 'none' }}
      />

      {/* Rug */}
      <Box w={200} h={2} d={150} x={0} y={4} z={10}
        color={style === 'Luxury' ? '#3730a3' : style === 'Scandinavian' ? '#DBEAFE' : '#1E293B'}
        shadowColor="#000"
      />

      {/* Plants */}
      <Box w={18} h={18} d={18} x={-130} y={9} z={-110} color="#166534" shadowColor="#000" />
      <Box w={12} h={30} d={12} x={-130} y={33} z={-110} color="#15803d" shadowColor="#000" style={{ borderRadius: '50%' }} />
      <Box w={20} h={20} d={20} x={140} y={10} z={70} color="#166534" shadowColor="#000" />
    </div>
  );
}

// ─── GENERIC 3D BOX ───────────────────────────────────────────────────────────
function Box({ w, h, d, x = 0, y = 0, z = 0, color, shadowColor, label, labelColor, onClick, hoverable, style: extraStyle }) {
  const [hov, setHov] = useState(false);
  const baseStyle = {
    position: 'absolute',
    width: `${w}px`,
    height: `${h}px`,
    transformStyle: 'preserve-3d',
    transform: `translate3d(${x - w / 2}px, ${-y - h}px, ${z - d / 2}px)`,
    cursor: onClick ? 'pointer' : 'inherit',
    pointerEvents: onClick || hoverable ? 'auto' : 'none',
  };

  const faceStyle = (face) => {
    const baseColor = typeof color === 'string' && color.startsWith('linear') ? color : color;
    const styles = {
      position: 'absolute',
      transition: 'all 0.25s ease',
    };
    if (face === 'front') return { ...styles, width: `${w}px`, height: `${h}px`, background: baseColor, transform: `translateZ(${d / 2}px)`, boxShadow: hov && hoverable ? '0 0 20px rgba(212,175,55,0.45)' : 'none', ...extraStyle };
    if (face === 'back')  return { ...styles, width: `${w}px`, height: `${h}px`, background: baseColor, transform: `rotateY(180deg) translateZ(${d / 2}px)` };
    if (face === 'right') return { ...styles, width: `${d}px`, height: `${h}px`, background: typeof color === 'string' && color.startsWith('linear') ? '#192434' : shadeColor(color, -25), transform: `rotateY(-90deg) translateZ(${-d / 2}px) translateX(${-d}px)` };
    if (face === 'left')  return { ...styles, width: `${d}px`, height: `${h}px`, background: typeof color === 'string' && color.startsWith('linear') ? '#0d1624' : shadeColor(color, -40), transform: `rotateY(90deg) translateZ(${-w + d / 2}px)` };
    if (face === 'top')   return { ...styles, width: `${w}px`, height: `${d}px`, background: typeof color === 'string' && color.startsWith('linear') ? '#334155' : shadeColor(color, 18), transform: `rotateX(90deg) translateZ(${-h}px) translateY(${d / 2}px)` };
    if (face === 'bottom') return { ...styles, width: `${w}px`, height: `${d}px`, background: shadowColor || '#020617', transform: `rotateX(-90deg) translateY(${d / 2}px)` };
    return styles;
  };

  return (
    <div style={baseStyle} onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={faceStyle('front')}>
        {label && (
          <span style={{ 
            position:'absolute', bottom:'5px', left:'50%', transform:'translateX(-50%)', 
            color: labelColor || '#fff', fontSize:'8.5px', fontWeight:800, whiteSpace:'nowrap',
            letterSpacing: '0.5px' 
          }}>
            {label}
          </span>
        )}
      </div>
      <div style={faceStyle('back')} />
      <div style={faceStyle('right')} />
      <div style={faceStyle('left')} />
      <div style={faceStyle('top')} />
      <div style={faceStyle('bottom')} />
    </div>
  );
}

function shadeColor(color, pct) {
  if (!color || typeof color !== 'string' || color.startsWith('linear') || color.startsWith('rgba') || color.startsWith('rgb')) return color;
  try {
    let num = parseInt(color.replace('#',''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + pct));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + pct));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + pct));
    return `rgb(${r},${g},${b})`;
  } catch { return color; }
}
