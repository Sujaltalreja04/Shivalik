import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const ROOMS = [
  {
    id: 'living',
    label: 'Living Room',
    url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=4096&auto=format&fit=crop',
    hotspots: [
      { label: 'Master Bedroom', targetId: 'bedroom', phi: Math.PI / 2, theta: Math.PI * 0.4 },
      { label: 'Kitchen', targetId: 'kitchen', phi: Math.PI / 2, theta: Math.PI * 1.2 },
    ],
  },
  {
    id: 'bedroom',
    label: 'Master Bedroom',
    url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=4096&auto=format&fit=crop',
    hotspots: [
      { label: 'Living Room', targetId: 'living', phi: Math.PI / 2, theta: Math.PI * 0.8 },
    ],
  },
  {
    id: 'kitchen',
    label: 'Kitchen',
    url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=4096&auto=format&fit=crop',
    hotspots: [
      { label: 'Living Room', targetId: 'living', phi: Math.PI / 2, theta: 0 },
    ],
  },
];

export default function VirtualTour() {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const frameRef = useRef(null);
  const isDown = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const sphereRef = useRef(null);
  const hotspotMeshesRef = useRef([]);

  const [currentRoom, setCurrentRoom] = useState(ROOMS[0]);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState(null);
  const [fov, setFov] = useState(75);

  const lonRef = useRef(180);
  const latRef = useRef(0);
  const targetLon = useRef(180);
  const targetLat = useRef(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth || 600;
    const h = mount.clientHeight || 400;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(fov, w / h, 0.1, 100);
    camera.position.set(0, 0, 0);
    cameraRef.current = camera;

    // Sphere for equirectangular panorama
    const geo = new THREE.SphereGeometry(50, 60, 40);
    geo.scale(-1, 1, 1); // flip inside
    const texLoader = new THREE.TextureLoader();
    setLoading(true);
    const sphereMat = new THREE.MeshBasicMaterial({ color: '#111' });
    const sphere = new THREE.Mesh(geo, sphereMat);
    scene.add(sphere);
    sphereRef.current = sphere;

    texLoader.load(
      currentRoom.url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        sphere.material.map = tex;
        sphere.material.color.set('#ffffff');
        sphere.material.needsUpdate = true;
        setLoading(false);
      },
      undefined,
      () => setLoading(false)
    );

    // Hotspot sprites
    hotspotMeshesRef.current = [];
    const spriteMat = (label) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256; canvas.height = 80;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(212,175,55,0.92)';
      ctx.roundRect(0, 0, 256, 80, 16);
      ctx.fill();
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 22px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('📍 ' + label, 128, 40);
      const tex = new THREE.CanvasTexture(canvas);
      return new THREE.SpriteMaterial({ map: tex, transparent: true });
    };

    currentRoom.hotspots.forEach((hs) => {
      const sprite = new THREE.Sprite(spriteMat(hs.label));
      sprite.scale.set(8, 2.5, 1);
      // Convert spherical to Cartesian
      const r = 48;
      sprite.position.set(
        r * Math.sin(hs.phi) * Math.cos(hs.theta),
        r * Math.cos(hs.phi),
        r * Math.sin(hs.phi) * Math.sin(hs.theta)
      );
      sprite.userData.targetId = hs.targetId;
      sprite.userData.label = hs.label;
      scene.add(sprite);
      hotspotMeshesRef.current.push(sprite);
    });

    // Resize
    const onResize = () => {
      const nw = mount.clientWidth, nh = mount.clientHeight;
      if (!nw || !nh) return;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    // Animation loop — smooth inertia
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      lonRef.current += (targetLon.current - lonRef.current) * 0.08;
      latRef.current += (targetLat.current - latRef.current) * 0.08;
      latRef.current = Math.max(-85, Math.min(85, latRef.current));

      const phi = THREE.MathUtils.degToRad(90 - latRef.current);
      const theta = THREE.MathUtils.degToRad(lonRef.current);
      camera.lookAt(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
      );
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [currentRoom]);

  // Sync fov to camera
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.fov = fov;
      cameraRef.current.updateProjectionMatrix();
    }
  }, [fov]);

  // Mouse / touch drag
  const onPointerDown = (e) => {
    isDown.current = true;
    const pt = e.touches ? e.touches[0] : e;
    lastPos.current = { x: pt.clientX, y: pt.clientY };
  };
  const onPointerMove = (e) => {
    if (!isDown.current) return;
    const pt = e.touches ? e.touches[0] : e;
    const dx = pt.clientX - lastPos.current.x;
    const dy = pt.clientY - lastPos.current.y;
    lastPos.current = { x: pt.clientX, y: pt.clientY };
    targetLon.current -= dx * 0.18;
    targetLat.current += dy * 0.14;
  };
  const onPointerUp = () => { isDown.current = false; };

  // Scroll to zoom
  const onWheel = (e) => {
    e.preventDefault();
    setFov(f => Math.max(40, Math.min(100, f + e.deltaY * 0.05)));
  };

  // Click hotspots
  const onClick = (e) => {
    if (!rendererRef.current || !cameraRef.current) return;
    const mount = mountRef.current;
    const rect = mount.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    const hits = raycaster.intersectObjects(hotspotMeshesRef.current);
    if (hits.length) {
      const targetId = hits[0].object.userData.targetId;
      const room = ROOMS.find(r => r.id === targetId);
      if (room) setCurrentRoom(room);
    }
  };

  // Hover tooltip
  const onMouseMove = (e) => {
    if (!rendererRef.current || !cameraRef.current) return;
    const mount = mountRef.current;
    const rect = mount.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    const hits = raycaster.intersectObjects(hotspotMeshesRef.current);
    if (hits.length) {
      setTooltip({ label: hits[0].object.userData.label, x: e.clientX - rect.left, y: e.clientY - rect.top });
    } else {
      setTooltip(null);
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '420px', position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
      <div
        ref={mountRef}
        style={{ width: '100%', height: '100%', minHeight: '420px', cursor: 'grab' }}
        onMouseDown={onPointerDown}
        onMouseMove={(e) => { onPointerMove(e); onMouseMove(e); }}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
        onWheel={onWheel}
        onClick={onClick}
      />

      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(10,15,29,0.85)', color: '#D4AF37', fontSize: '14px', gap: '10px',
        }}>
          <div style={{ width: 28, height: 28, border: '3px solid #D4AF37', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          Loading panorama…
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'absolute', top: tooltip.y - 36, left: tooltip.x - 60,
          background: 'rgba(212,175,55,0.92)', color: '#0F172A',
          padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
          pointerEvents: 'none', whiteSpace: 'nowrap',
        }}>
          Go to {tooltip.label}
        </div>
      )}

      {/* Room selector */}
      <div style={{
        position: 'absolute', bottom: '14px', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: '8px',
      }}>
        {ROOMS.map(r => (
          <button
            key={r.id}
            onClick={() => setCurrentRoom(r)}
            style={{
              padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
              background: currentRoom.id === r.id ? '#D4AF37' : 'rgba(10,15,29,0.8)',
              color: currentRoom.id === r.id ? '#0F172A' : '#D4AF37',
              border: '1px solid rgba(212,175,55,0.4)',
              cursor: 'pointer', backdropFilter: 'blur(8px)',
              transition: 'all 0.2s',
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Room label */}
      <div style={{
        position: 'absolute', top: '14px', left: '14px',
        background: 'rgba(10,15,29,0.75)', border: '1px solid rgba(212,175,55,0.3)',
        color: '#D4AF37', padding: '5px 14px', borderRadius: '20px',
        fontSize: '12px', fontWeight: 700, backdropFilter: 'blur(8px)',
      }}>
        360° · {currentRoom.label}
      </div>

      {/* Instructions */}
      <div style={{
        position: 'absolute', top: '14px', right: '14px',
        background: 'rgba(10,15,29,0.7)', color: '#94A3B8',
        padding: '4px 12px', borderRadius: '16px', fontSize: '11px',
        backdropFilter: 'blur(8px)', border: '1px solid rgba(148,163,184,0.15)',
      }}>
        Drag to look · Scroll to zoom · Click markers to navigate
      </div>
    </div>
  );
}
