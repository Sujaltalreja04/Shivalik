import React, { useState, useEffect, useRef } from 'react';
import { Compass, RotateCw, ZoomIn, ZoomOut, Eye, Move } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// PURE CSS 3D TOWNSHIP & INTERIOR VIEWER
// No WebGL / Three.js — 100% CSS 3D transforms, works in every browser
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
  const containerRef = useRef(null);

  // Animate window lights blinking
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
    setRotX(r => Math.min(5, Math.max(-50, r - dy * 0.3)));
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
    setRotX(r => Math.min(5, Math.max(-50, r - dy * 0.3)));
  };
  const handleTouchEnd = () => { lastTouch.current = null; };

  const sceneStyle = {
    width: '100%',
    height: '100%',
    minHeight: '460px',
    position: 'relative',
    background: isNight
      ? 'linear-gradient(180deg, #020510 0%, #0a0f2a 60%, #0d1525 100%)'
      : `linear-gradient(180deg, #0f2248 0%, #1a3a6e ${Math.max(0, (timeOfDay - 6) * 8)}%, #0b1a35 100%)`,
    overflow: 'hidden',
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none',
  };

  const perspectiveStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    perspective: '900px',
    perspectiveOrigin: '50% 40%',
  };

  const sceneRotStyle = {
    transformStyle: 'preserve-3d',
    transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${zoom})`,
    transition: isDragging ? 'none' : 'transform 0.15s ease',
    position: 'relative',
    width: mode === 'township' ? '480px' : '360px',
    height: mode === 'township' ? '480px' : '360px',
  };

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
      {/* Stars (night only) */}
      {isNight && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {[...Array(40)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: i % 3 === 0 ? '2px' : '1px',
              height: i % 3 === 0 ? '2px' : '1px',
              borderRadius: '50%',
              background: 'white',
              opacity: 0.4 + (i % 5) * 0.12,
              top: `${(i * 37 + 11) % 70}%`,
              left: `${(i * 53 + 7) % 100}%`,
              animation: `twinkle ${1.5 + (i % 4) * 0.5}s ease-in-out infinite alternate`,
            }} />
          ))}
        </div>
      )}

      {/* Sun / Moon */}
      {!isNight && (
        <div style={{
          position: 'absolute',
          top: `${Math.max(8, 40 - timeOfDay * 2)}%`,
          left: `${20 + timeOfDay * 4}%`,
          width: '48px', height: '48px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #FFF8E1, #FFD54F)',
          boxShadow: '0 0 40px 15px rgba(255,213,79,0.35)',
          pointerEvents: 'none',
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

      {/* HUD Controls */}
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
          <HudBtn onClick={() => { setRotY(-30); setRotX(-25); setZoom(1); }} title="Reset">
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

      {/* Drag hint */}
      <div style={{
        position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(10,15,29,0.7)', border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: '20px', padding: '4px 14px',
        color: '#94A3B8', fontSize: '11px', pointerEvents: 'none',
        backdropFilter: 'blur(8px)',
      }}>
        <Move size={11} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
        Drag to orbit · Scroll to zoom
      </div>

      <style>{`
        @keyframes twinkle { from { opacity: 0.2; } to { opacity: 0.9; } }
        @keyframes windowPulse { 0%,100% { opacity: 0.7; } 50% { opacity: 1; } }
        @keyframes poolRipple { 0%,100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.02); } }
      `}</style>
    </div>
  );
}

// ─── HUD Button ───────────────────────────────────────────────────────────────
function HudBtn({ onClick, title, children }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: '32px', height: '32px', borderRadius: '8px',
      background: 'rgba(10,15,29,0.75)', border: '1px solid rgba(212,175,55,0.25)',
      color: '#D4AF37', cursor: 'pointer', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(8px)', transition: 'all 0.15s',
    }}>{children}</button>
  );
}

// ─── TOWNSHIP SCENE ───────────────────────────────────────────────────────────
function TownshipScene({ selectedTower, onSelectTower, onSelectAmenity, hoveredTower, setHoveredTower, isNight, tick, highlightFloor }) {
  const gold = '#D4AF37';

  const buildingDef = (id, label, h, x, z, w = 60, d = 60, floors = 12) => ({
    id, label, h, x, z, w, d, floors,
    isSelected: selectedTower === id,
    isHovered: hoveredTower === id,
  });

  const towers = [
    buildingDef('A', 'Tower A', 200, -130, -80, 55, 55, 12),
    buildingDef('B', 'Tower B', 150, 30, -100, 50, 50, 9),
    buildingDef('C', 'Tower C', 240, 120, 40, 60, 60, 14),
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d' }}>

      {/* Ground plane */}
      <Box
        w={500} h={8} d={500}
        x={0} y={0} z={0}
        color="linear-gradient(135deg, #0d2010, #0a1a0c)"
        shadowColor="#0a1a0c"
      />

      {/* Roads */}
      <Box w={500} h={2} d={22} x={0} y={4} z={0} color="#1a1a1a" shadowColor="#111" />
      <Box w={22} h={2} d={500} x={0} y={4} z={0} color="#1a1a1a" shadowColor="#111" />

      {/* Central garden */}
      <Box w={120} h={4} d={120} x={0} y={4} z={0} color="linear-gradient(135deg,#15532d,#166534)" shadowColor="#0f3d1f" style={{ borderRadius: '50%' }} />
      {/* Fountain */}
      <Box w={20} h={12} d={20} x={0} y={8} z={0} color="#1e3a5f" shadowColor="#122640" />

      {/* Swimming Pool */}
      <Box w={90} h={4} d={60} x={-170} y={4} z={-100} color="#1e3a5f" shadowColor="#122640" />
      <div
        onClick={() => onSelectAmenity?.('Clubhouse Pool')}
        style={{
          position: 'absolute',
          width: '84px', height: '54px',
          background: 'linear-gradient(135deg, #0284c7, #0369a1)',
          borderRadius: '4px',
          boxShadow: '0 0 20px rgba(2,132,199,0.5)',
          transform: `translate3d(${-170 - 42}px, -10px, ${-100 - 27}px) rotateX(90deg)`,
          cursor: 'pointer',
          animation: 'poolRipple 3s ease-in-out infinite',
          transformStyle: 'preserve-3d',
        }}
      />

      {/* Clubhouse Gym */}
      <Box w={80} h={40} d={70} x={-165} y={24} z={40} color="#1E293B" shadowColor="#0f172a"
        label="GYM" labelColor="#D4AF37"
        onClick={() => onSelectAmenity?.('Clubhouse Gym')} hoverable
      />

      {/* Trees */}
      {[[-60,-150],[-90,-120],[60,-140],[150,-60],[180,100],[-50,140],[-160,80],[100,-160]].map(([tx,tz],i) => (
        <Tree key={i} x={tx} z={tz} h={30 + (i%3)*15} isNight={isNight} />
      ))}

      {/* Towers */}
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
        />
      ))}

      {/* Labels floating above selected towers */}
      {towers.filter(t => t.isSelected).map(t => (
        <div key={t.id + '-label'} style={{
          position: 'absolute',
          transform: `translate3d(${t.x - 50}px, ${-(t.h + 60)}px, ${t.z}px)`,
          background: 'rgba(212,175,55,0.9)',
          color: '#0F172A',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}>
          📍 {t.label} — Selected
        </div>
      ))}
    </div>
  );
}

// ─── INTERIOR SCENE ───────────────────────────────────────────────────────────
function InteriorScene({ style, isNight, tick }) {
  const palettes = {
    Modern:       { floor: '#3D1F0D', wall: '#0F172A', accent: '#D4AF37', sofa: '#1E293B', ceiling: '#0A0F1D' },
    Luxury:       { floor: '#F8FAFC', wall: '#1E1B4B', accent: '#D4AF37', sofa: '#312E81', ceiling: '#1a1839' },
    Scandinavian: { floor: '#D6B38C', wall: '#F1F5F9', accent: '#94A3B8', sofa: '#CBD5E1', ceiling: '#E2E8F0' },
    Minimalist:   { floor: '#94A3B8', wall: '#475569', accent: '#CBD5E1', sofa: '#334155', ceiling: '#1E293B' },
  };
  const p = palettes[style] || palettes.Modern;
  const gold = '#D4AF37';

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

      {/* Big window on back wall */}
      <Box w={130} h={100} d={4} x={0} y={100} z={-138} color={gold} shadowColor="#000" />
      <Box w={124} h={94} d={5} x={0} y={100} z={-136}
        color={isNight ? 'rgba(20,30,80,0.9)' : 'rgba(100,180,255,0.4)'}
        shadowColor="rgba(0,0,0,0.5)"
        style={{ opacity: 0.85 }}
      />

      {/* Ceiling light */}
      <Box w={40} h={6} d={40} x={0} y={175} z={-20}
        color={gold}
        shadowColor="#000"
        style={{ boxShadow: isNight ? `0 0 60px 30px rgba(255,230,100,0.3)` : `0 0 30px 10px rgba(255,230,100,0.1)` }}
      />

      {/* Sofa */}
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
        color={isNight ? '#1a3a6e' : '#0F172A'}
        shadowColor="#000"
        style={{
          boxShadow: isNight ? '0 0 30px rgba(56,189,248,0.3)' : 'none',
        }}
      />

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

// ─── TOWER COMPONENT ──────────────────────────────────────────────────────────
function Tower({ id, label, h, x, z, w, d, floors, gold, isSelected, isHovered, isNight, tick, onClick, onHover, onLeave }) {
  const glowColor = isSelected ? gold : isHovered ? '#94A3B8' : '#334155';
  const bodyColor = isSelected
    ? 'linear-gradient(180deg, #2a1f00, #1a1500)'
    : 'linear-gradient(180deg, #1E293B, #0F172A)';
  const glowIntensity = isSelected ? '0 0 40px rgba(212,175,55,0.6)' : isHovered ? '0 0 20px rgba(148,163,184,0.3)' : 'none';

  // Window rows
  const winRows = [];
  for (let f = 0; f < Math.min(floors, 12); f++) {
    const yOff = (f / floors) * h + 10;
    const lit = isNight && ((f + tick) % 3 !== 2);
    const winColor = lit ? '#FFE082' : '#1E293B';
    const winGlow = lit ? '0 0 6px rgba(255,224,130,0.8)' : 'none';
    for (let side = 0; side < 2; side++) {
      winRows.push({ f, side, yOff, winColor, winGlow });
    }
  }

  return (
    <g3 style={{ position: 'absolute', transformStyle: 'preserve-3d' }}>
      {/* Base */}
      <Box w={w + 10} h={8} d={d + 10} x={x} y={4} z={z} color="#0F172A" shadowColor="#000" />

      {/* Main body */}
      <div
        onClick={onClick}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        style={{
          position: 'absolute',
          width: `${w}px`, height: `${h}px`, depth: `${d}px`,
          transform: `translate3d(${x - w / 2}px, ${-(h)}px, ${z - d / 2}px)`,
          transformStyle: 'preserve-3d',
          cursor: 'pointer',
        }}
      >
        {/* Front face */}
        <div style={{
          position: 'absolute', width: `${w}px`, height: `${h}px`,
          background: bodyColor,
          border: `1px solid ${glowColor}`,
          boxShadow: glowIntensity,
          transform: `translateZ(${d / 2}px)`,
          transition: 'all 0.3s',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'flex-end', paddingBottom: '8px',
        }}>
          {/* Window grid on front */}
          <div style={{ position: 'absolute', inset: '10px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px', padding: '8px' }}>
            {[...Array(Math.min(floors * 3, 30))].map((_, i) => (
              <div key={i} style={{
                background: isNight && (i + tick) % 4 !== 3 ? '#FFE082' : 'rgba(255,255,255,0.05)',
                borderRadius: '2px',
                boxShadow: isNight && (i + tick) % 4 !== 3 ? '0 0 4px rgba(255,224,130,0.6)' : 'none',
                transition: 'all 1s',
              }} />
            ))}
          </div>
          {/* Label */}
          <div style={{
            position: 'absolute', bottom: '8px',
            background: isSelected ? gold : 'rgba(0,0,0,0.6)',
            color: isSelected ? '#0F172A' : '#94A3B8',
            padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
          }}>Tower {label}</div>
        </div>
        {/* Right face */}
        <div style={{
          position: 'absolute', width: `${d}px`, height: `${h}px`,
          background: isSelected ? 'linear-gradient(180deg, #1a1500,#0f0e00)' : 'linear-gradient(180deg,#0F172A,#080d16)',
          border: `1px solid ${glowColor}`,
          transform: `rotateY(-90deg) translateZ(${-d / 2}px) translateX(${-d}px)`,
          transition: 'all 0.3s',
        }} />
        {/* Top face */}
        <div style={{
          position: 'absolute', width: `${w}px`, height: `${d}px`,
          background: isSelected ? gold : '#1E293B',
          transform: `rotateX(90deg) translateZ(${-h}px) translateY(${d / 2}px)`,
          transition: 'all 0.3s',
        }} />
      </div>
    </g3>
  );
}

// ─── TREE ─────────────────────────────────────────────────────────────────────
function Tree({ x, z, h, isNight }) {
  return (
    <>
      <Box w={8} h={h * 0.4} d={8} x={x} y={h * 0.2} z={z} color="#5c4033" shadowColor="#000" />
      <Box w={h * 0.7} h={h * 0.6} d={h * 0.7} x={x} y={h * 0.7} z={z}
        color={isNight ? '#0d3b1e' : '#15803d'}
        shadowColor="#000"
        style={{ borderRadius: '50% 50% 40% 40%' }}
      />
    </>
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
  };

  const faceStyle = (face) => {
    const baseColor = typeof color === 'string' && color.startsWith('linear') ? color : color;
    const dimFactor = face === 'right' ? '0.7' : face === 'top' ? '1.1' : '0.9';
    const styles = {
      position: 'absolute',
      transition: 'all 0.2s',
    };
    if (face === 'front') return { ...styles, width: `${w}px`, height: `${h}px`, background: baseColor, transform: `translateZ(${d / 2}px)`, boxShadow: hov && hoverable ? '0 0 20px rgba(212,175,55,0.4)' : 'none', ...extraStyle };
    if (face === 'back')  return { ...styles, width: `${w}px`, height: `${h}px`, background: baseColor, transform: `rotateY(180deg) translateZ(${d / 2}px)` };
    if (face === 'right') return { ...styles, width: `${d}px`, height: `${h}px`, background: typeof color === 'string' && color.startsWith('linear') ? '#1a2535' : shadeColor(color, -30), transform: `rotateY(-90deg) translateZ(${-d / 2}px) translateX(${-d}px)` };
    if (face === 'left')  return { ...styles, width: `${d}px`, height: `${h}px`, background: typeof color === 'string' && color.startsWith('linear') ? '#0f1a28' : shadeColor(color, -50), transform: `rotateY(90deg) translateZ(${-w + d / 2}px)` };
    if (face === 'top')   return { ...styles, width: `${w}px`, height: `${d}px`, background: typeof color === 'string' && color.startsWith('linear') ? '#334155' : shadeColor(color, 20), transform: `rotateX(90deg) translateZ(${-h}px) translateY(${d / 2}px)` };
    if (face === 'bottom') return { ...styles, width: `${w}px`, height: `${d}px`, background: shadowColor || '#000', transform: `rotateX(-90deg) translateY(${d / 2}px)` };
    return styles;
  };

  return (
    <div style={baseStyle} onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={faceStyle('front')}>{label && <span style={{ position:'absolute',bottom:'6px',left:'50%',transform:'translateX(-50%)',color:labelColor||'#fff',fontSize:'10px',fontWeight:700,whiteSpace:'nowrap' }}>{label}</span>}</div>
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
