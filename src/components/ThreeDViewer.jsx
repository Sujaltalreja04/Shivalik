import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Compass, RotateCw, ZoomIn, ZoomOut, Move } from 'lucide-react';

export default function ThreeDViewer({
  mode = 'interior',
  interiorStyle = 'Modern',
  interiorBudget = 1000000,
  timeOfDay = 12,
  selectedTower = null,
  onSelectTower = null,
  onSelectAmenity = null,
  highlightFloor = null,
  buildingTower = null,
}) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const frameRef = useRef(null);
  const windowMeshesRef = useRef([]);
  const towerBodyMeshesRef = useRef({});
  const clickableRef = useRef([]);
  const sceneRef = useRef(null);
  const [activeFloor, setActiveFloor] = useState(0);

  const isNight = timeOfDay > 18 || timeOfDay < 6;

  // ── Main scene setup ──────────────────────────────────────────────────────
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 600;
    const height = mount.clientHeight || 460;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isNight ? 0.6 : 1.1;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 2000);
    if (mode === 'township') {
      camera.position.set(90, 130, 190);
    } else if (mode === 'building') {
      camera.position.set(28, 22, 38);
    } else {
      camera.position.set(0, 3.5, 11);
    }
    cameraRef.current = camera;

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = mode === 'township' ? 40 : mode === 'building' ? 8 : 3;
    controls.maxDistance = mode === 'township' ? 420 : mode === 'building' ? 120 : 18;
    controls.maxPolarAngle = mode === 'building' ? Math.PI * 0.7 : Math.PI / 2.05;
    controls.target.set(0, mode === 'township' ? 12 : mode === 'building' ? 12 : 1.5, 0);
    controls.update();
    controlsRef.current = controls;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const bgColor = mode === 'building'
      ? (isNight ? '#05080f' : '#f1f5f9')
      : (isNight ? '#020510' : '#e0f2fe');
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.FogExp2(bgColor, mode === 'township' ? 0.0012 : mode === 'building' ? 0.004 : 0.05);

    // Lighting
    const ambient = new THREE.AmbientLight(isNight ? '#0a1030' : '#e0f2fe', isNight ? 0.35 : 1.1);
    scene.add(ambient);

    const sunAngle = ((timeOfDay - 6) / 12) * Math.PI;
    const sun = new THREE.DirectionalLight(isNight ? '#1a2060' : '#fffbeb', isNight ? 0.15 : 2.5);
    sun.position.set(Math.cos(sunAngle) * 200, Math.sin(sunAngle) * 200 + 20, 80);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 700;
    sun.shadow.camera.left = -250;
    sun.shadow.camera.right = 250;
    sun.shadow.camera.top = 250;
    sun.shadow.camera.bottom = -250;
    scene.add(sun);

    // Sky sphere (gradient via hemisphere light)
    const hemi = new THREE.HemisphereLight(
      isNight ? '#0a0f2a' : '#bae6fd',
      isNight ? '#0a0a0a' : '#4ade80',
      isNight ? 0.3 : 1.2
    );
    scene.add(hemi);

    // Sun / Moon visual
    if (!isNight) {
      const sunMesh = new THREE.Mesh(
        new THREE.SphereGeometry(9, 16, 16),
        new THREE.MeshBasicMaterial({ color: '#FFF8E1' })
      );
      sunMesh.position.set(Math.cos(sunAngle) * 280, Math.sin(sunAngle) * 280, -80);
      scene.add(sunMesh);
      // Sun glow
      const glowMesh = new THREE.Mesh(
        new THREE.SphereGeometry(14, 16, 16),
        new THREE.MeshBasicMaterial({ color: '#ffe082', transparent: true, opacity: 0.18 })
      );
      glowMesh.position.copy(sunMesh.position);
      scene.add(glowMesh);
    } else {
      const moonMesh = new THREE.Mesh(
        new THREE.SphereGeometry(7, 16, 16),
        new THREE.MeshBasicMaterial({ color: '#dde8cc' })
      );
      moonMesh.position.set(-160, 190, -130);
      scene.add(moonMesh);
    }

    // Stars
    if (isNight) {
      const starGeo = new THREE.BufferGeometry();
      const count = 1000;
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i += 3) {
        pos[i]     = (Math.random() - 0.5) * 1200;
        pos[i + 1] = 60 + Math.random() * 350;
        pos[i + 2] = (Math.random() - 0.5) * 1200;
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
        color: '#ffffff', size: 0.9, transparent: true, opacity: 0.85,
      })));
    }

    // Reset clickable
    clickableRef.current = [];
    windowMeshesRef.current = [];
    towerBodyMeshesRef.current = {};

    if (mode === 'township') {
      buildTownship(scene, isNight, selectedTower, towerBodyMeshesRef, windowMeshesRef, clickableRef);
    } else if (mode === 'building') {
      buildBuildingInterior(scene, buildingTower, isNight);
    } else {
      buildInterior(scene, interiorStyle, isNight);
    }

    // Raycaster for click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const handleClick = (e) => {
      if (mode !== 'township') return;
      const rect = mount.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(clickableRef.current, true);
      if (!hits.length) return;
      let obj = hits[0].object;
      for (let i = 0; i < 6; i++) {
        if (!obj) break;
        if (obj.userData.towerId) { onSelectTower?.(obj.userData.towerId); return; }
        if (obj.userData.amenityId) { onSelectAmenity?.(obj.userData.amenityId); return; }
        obj = obj.parent;
      }
    };
    mount.addEventListener('click', handleClick);

    // Resize
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    // Animation loop
    let t = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      t += 0.008;
      controls.update();

      // Window flicker at night
      windowMeshesRef.current.forEach((w, i) => {
        if (w.material) {
          w.material.emissiveIntensity = 0.55 + Math.sin(t * 1.8 + i * 1.7) * 0.35;
        }
      });

      // Elevator animation (ping-pong up/down)
      if (scene.userData.elevator) {
        const elev = scene.userData.elevator;
        const maxY = scene.userData.elevatorMaxY || 0;
        elev.position.y = ((Math.sin(t * 0.35) + 1) / 2) * maxY;
      }

      // Ceiling fan rotation
      if (scene.userData.fans) {
        scene.userData.fans.forEach(fan => {
          fan.rotation.y += 0.055;
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      mount.removeEventListener('click', handleClick);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [mode, interiorStyle, timeOfDay, buildingTower]);

  // Reactively highlight selected tower without full rebuild
  useEffect(() => {
    Object.entries(towerBodyMeshesRef.current).forEach(([id, meshes]) => {
      const sel = id === selectedTower;
      meshes.forEach(m => {
        if (!m.material) return;
        m.material.emissive.set(sel ? '#D4AF37' : '#000000');
        m.material.emissiveIntensity = sel ? 0.25 : 0;
      });
    });
  }, [selectedTower]);

  const resetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    if (mode === 'township') {
      cameraRef.current.position.set(90, 130, 190);
      controlsRef.current.target.set(0, 12, 0);
    } else if (mode === 'building') {
      cameraRef.current.position.set(28, 22, 38);
      controlsRef.current.target.set(0, 12, 0);
    } else {
      cameraRef.current.position.set(0, 3.5, 11);
      controlsRef.current.target.set(0, 1.5, 0);
    }
    controlsRef.current.update();
  };

  const rotateScene = (dir) => {
    const c = controlsRef.current;
    if (!c) return;
    c.rotateLeft(dir * 0.35);
    c.update();
  };

  const zoom = (dir) => {
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;
    if (!cam || !ctrl) return;
    const fwd = new THREE.Vector3();
    cam.getWorldDirection(fwd);
    cam.position.addScaledVector(fwd, dir * 12);
    ctrl.update();
  };

  const jumpToFloor = (floorIdx) => {
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;
    if (!cam || !ctrl) return;
    setActiveFloor(floorIdx);
    const FH = 4.5;
    const targetY = floorIdx * FH + FH / 2;
    cam.position.set(28, targetY + 4, 32);
    ctrl.target.set(0, targetY, 0);
    ctrl.update();
  };

  const towerFloors = { A: 10, B: 8, C: 12 };
  const floorCount = buildingTower ? Math.min(towerFloors[buildingTower] || 8, 8) : 0;

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '460px', position: 'relative' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%', minHeight: '460px' }} />

      {/* HUD */}
      <div style={{
        position: 'absolute', bottom: '16px', left: '16px', right: '16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        pointerEvents: 'none', zIndex: 10,
      }}>
        <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto' }}>
          <HudBtn onClick={() => rotateScene(1)} title="Rotate Left">
            <RotateCw size={14} style={{ transform: 'scaleX(-1)' }} />
          </HudBtn>
          <HudBtn onClick={() => rotateScene(-1)} title="Rotate Right">
            <RotateCw size={14} />
          </HudBtn>
          <HudBtn onClick={resetCamera} title="Reset View">
            <Compass size={14} />
          </HudBtn>
        </div>
        <div style={{ display: 'flex', gap: '6px', pointerEvents: 'auto' }}>
          <HudBtn onClick={() => zoom(1)} title="Zoom In"><ZoomIn size={14} /></HudBtn>
          <HudBtn onClick={() => zoom(-1)} title="Zoom Out"><ZoomOut size={14} /></HudBtn>
        </div>
      </div>

      <div style={{
        position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(10,15,29,0.7)', border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: '20px', padding: '4px 14px',
        color: '#94A3B8', fontSize: '11px', pointerEvents: 'none',
        backdropFilter: 'blur(8px)', whiteSpace: 'nowrap',
      }}>
        <Move size={11} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
        Drag to orbit · Scroll to zoom
      </div>

      {/* Floor selector — only in building mode */}
      {mode === 'building' && floorCount > 0 && (
        <div style={{
          position: 'absolute', top: '12px', right: '12px',
          display: 'flex', flexDirection: 'column', gap: '4px',
          zIndex: 15,
        }}>
          <div style={{ color: '#D4AF37', fontSize: '10px', fontWeight: 700, textAlign: 'center', marginBottom: '2px' }}>FLOOR</div>
          {Array.from({ length: floorCount }, (_, i) => floorCount - 1 - i).map(fi => (
            <button
              key={fi}
              onClick={() => jumpToFloor(fi)}
              style={{
                width: '38px', height: '28px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                background: activeFloor === fi ? '#D4AF37' : 'rgba(10,15,29,0.82)',
                color: activeFloor === fi ? '#0F172A' : '#94A3B8',
                border: `1px solid ${activeFloor === fi ? '#D4AF37' : 'rgba(212,175,55,0.2)'}`,
                cursor: 'pointer', backdropFilter: 'blur(8px)',
                transition: 'all 0.15s',
              }}
            >
              {fi + 1}
            </button>
          ))}
        </div>
      )}

      {/* Unit status legend */}
      {mode === 'building' && (
        <div style={{
          position: 'absolute', bottom: '62px', left: '12px',
          background: 'rgba(10,15,29,0.82)', border: '1px solid rgba(212,175,55,0.2)',
          borderRadius: '10px', padding: '8px 12px', backdropFilter: 'blur(8px)',
          display: 'flex', flexDirection: 'column', gap: '4px',
        }}>
          {[['#22c55e','Available'],['#f59e0b','Booked'],['#ef4444','Sold']].map(([c, l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
              <span style={{ color: '#94A3B8', fontSize: '10px' }}>{l}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HudBtn({ onClick, title, children }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: '32px', height: '32px', borderRadius: '8px',
      background: 'rgba(10,15,29,0.8)', border: '1px solid rgba(212,175,55,0.3)',
      color: '#D4AF37', cursor: 'pointer', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(8px)', transition: 'all 0.15s',
    }}>{children}</button>
  );
}

// ── TOWNSHIP ──────────────────────────────────────────────────────────────────
function buildTownship(scene, isNight, selectedTower, towerBodyMeshesRef, windowMeshesRef, clickableRef) {
  const M = {
    ground:   mat(isNight ? '#0d2010' : '#2c5e3b', { roughness: 0.9, metalness: 0 }),
    road:     mat(isNight ? '#141428' : '#475569', { roughness: 0.85 }),
    pavement: mat(isNight ? '#2d3748' : '#94a3b8', { roughness: 0.9 }),
    garden:   mat(isNight ? '#155a2d' : '#387a50', { roughness: 0.9 }),
    water:    mat(isNight ? '#0369a1' : '#38bdf8', { roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.82 }),
    pool:     mat(isNight ? '#075985' : '#0ea5e9', { roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.88 }),
    concrete: mat(isNight ? '#334155' : '#cbd5e1', { roughness: 0.9 }),
    gym:      mat(isNight ? '#1E293B' : '#64748b', { roughness: 0.65 }),
    gold:     mat('#D4AF37', { metalness: 0.85, roughness: 0.15 }),
    leaf:     mat(isNight ? '#0c3318' : '#22c55e', { roughness: 0.92 }),
    trunk:    mat('#5c4033', { roughness: 0.95 }),
    winLit:   () => new THREE.MeshStandardMaterial({ color: '#FFE082', emissive: '#FFE082', emissiveIntensity: 0.7, roughness: 0.4 }),
    winDark:  mat(isNight ? '#0a1628' : '#64748b', { roughness: 0.5 }),
  };

  // Ground
  box(scene, 700, 0.4, 700, 0, -0.2, 0, M.ground, false);

  // Roads (cross)
  box(scene, 700, 0.3, 16, 0, 0.1, 0, M.road, false);
  box(scene, 16, 0.3, 700, 0, 0.1, 0, M.road, false);
  // Pavement edges
  box(scene, 700, 0.2, 3, 0, 0.25,  9.5, M.pavement, false);
  box(scene, 700, 0.2, 3, 0, 0.25, -9.5, M.pavement, false);
  box(scene, 3, 0.2, 700, 9.5,  0.25, 0, M.pavement, false);
  box(scene, 3, 0.2, 700, -9.5, 0.25, 0, M.pavement, false);

  // Central garden (cylinder)
  const gardenGeo = new THREE.CylinderGeometry(32, 32, 0.6, 48);
  const garden = new THREE.Mesh(gardenGeo, M.garden);
  garden.position.set(0, 0.3, 0);
  garden.receiveShadow = true;
  scene.add(garden);

  // Ring path around garden
  const ringGeo = new THREE.RingGeometry(32, 35, 48);
  const ring = new THREE.Mesh(ringGeo, M.pavement);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(0, 0.36, 0);
  scene.add(ring);

  // Fountain
  const fountainBase = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 1, 16), M.concrete);
  fountainBase.position.set(0, 0.5, 0);
  fountainBase.castShadow = true;
  scene.add(fountainBase);
  const fountainWater = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 0.4, 16), M.water);
  fountainWater.position.set(0, 1.2, 0);
  scene.add(fountainWater);
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 3, 8), M.concrete);
  pillar.position.set(0, 2, 0);
  pillar.castShadow = true;
  scene.add(pillar);
  if (isNight) {
    const fl = new THREE.PointLight('#4fc3f7', 2.5, 28);
    fl.position.set(0, 5, 0);
    scene.add(fl);
  }

  // Swimming pool
  box(scene, 32, 1.2, 20, -60, 0.6, -35, M.concrete);
  const poolWater = new THREE.Mesh(new THREE.BoxGeometry(30, 0.5, 18), M.pool);
  poolWater.position.set(-60, 0.95, -35);
  poolWater.userData.amenityId = 'Clubhouse Pool';
  scene.add(poolWater);
  clickableRef.current.push(poolWater);
  if (isNight) {
    const pl = new THREE.PointLight('#0ea5e9', 2.8, 30);
    pl.position.set(-60, 3, -35);
    scene.add(pl);
  }
  // Pool deck
  box(scene, 38, 0.3, 26, -60, 0.15, -35, M.pavement, false);

  // Clubhouse / Gym
  const gymG = new THREE.Group();
  gymG.userData.amenityId = 'Clubhouse Gym';
  const gymBody = new THREE.Mesh(new THREE.BoxGeometry(28, 10, 22), M.gym);
  gymBody.position.y = 5;
  gymBody.castShadow = true;
  gymBody.receiveShadow = true;
  gymG.add(gymBody);
  const gymRoof = new THREE.Mesh(new THREE.BoxGeometry(30, 1.2, 24), M.gold);
  gymRoof.position.y = 10.6;
  gymG.add(gymRoof);
  // Gym windows
  [-6, 0, 6].forEach(wx => {
    const w = new THREE.Mesh(new THREE.BoxGeometry(4, 3.5, 0.2), mat('#7dd3fc', { transparent: true, opacity: 0.45, roughness: 0.05 }));
    w.position.set(wx, 5, 11.1);
    gymG.add(w);
  });
  gymG.position.set(-58, 0, 14);
  clickableRef.current.push(gymG);
  scene.add(gymG);

  // Trees
  const treePos = [
    [-22,-50],[25,-48],[50,-22],[58,28],[50,55],
    [-16,50],[-52,26],[28,-60],[-38,-38],[64,-42],
    [-65,15],[65,10],[-20,25],[20,-20],[-45,55],
  ];
  treePos.forEach(([tx, tz], i) => {
    const h = 6 + (i % 4) * 2.5;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.55, h * 0.38, 7), M.trunk);
    trunk.position.set(tx, h * 0.19, tz);
    trunk.castShadow = true;
    scene.add(trunk);
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(h * 0.32, 8, 7), M.leaf);
    leaf.position.set(tx, h * 0.68, tz);
    leaf.castShadow = true;
    scene.add(leaf);
  });

  // Street lamps
  const lampPos = [[-11,-11],[11,-11],[-11,11],[11,11],[-32,0],[32,0],[0,-32],[0,32],[-20,-32],[20,-32]];
  lampPos.forEach(([lx, lz]) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 7, 6), M.concrete);
    pole.position.set(lx, 3.5, lz);
    pole.castShadow = true;
    scene.add(pole);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 8), M.gold);
    head.position.set(lx, 7.3, lz);
    scene.add(head);
    if (isNight) {
      const ll = new THREE.PointLight('#ffe88a', 1.4, 16);
      ll.position.set(lx, 7.2, lz);
      scene.add(ll);
    }
  });

  // Towers
  const towers = [
    { id: 'A', x: -44, z: -26, w: 16, d: 16, h: 62, floors: 12 },
    { id: 'B', x: 12,  z: -35, w: 13, d: 13, h: 46, floors: 9  },
    { id: 'C', x: 40,  z: 14,  w: 19, d: 19, h: 78, floors: 15 },
  ];

  towers.forEach(({ id, x, z, w, d, h, floors }) => {
    const sel = id === selectedTower;
    const group = new THREE.Group();
    group.userData.towerId = id;

    // Podium
    const podium = new THREE.Mesh(new THREE.BoxGeometry(w + 6, 2.5, d + 6),
      mat(isNight ? '#0F172A' : '#475569', { roughness: 0.6 }));
    podium.position.y = 1.25;
    podium.castShadow = true;
    podium.receiveShadow = true;
    group.add(podium);

    // Body segments (slight taper per floor segment for visual interest)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: isNight ? '#1a2744' : (sel ? '#f8fafc' : '#cbd5e1'),
      roughness: 0.25,
      metalness: 0.45,
      emissive: new THREE.Color(sel ? '#D4AF37' : '#000000'),
      emissiveIntensity: sel ? 0.15 : 0,
    });
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bodyMat);
    body.position.y = h / 2 + 2.5;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Balcony bands every 3 floors
    for (let f = 3; f < floors; f += 3) {
      const band = new THREE.Mesh(
        new THREE.BoxGeometry(w + 1.8, 0.4, d + 1.8),
        mat('#D4AF37', { metalness: 0.7, roughness: 0.2 })
      );
      band.position.y = 2.5 + (f / floors) * h;
      group.add(band);
    }

    // Roof accent
    const roof = new THREE.Mesh(new THREE.BoxGeometry(w, 1.8, d), M.gold);
    roof.position.y = h + 3.4;
    group.add(roof);

    // Spire
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.9, 7, 4), M.gold);
    spire.position.y = h + 7.3;
    group.add(spire);

    // Windows front face
    const cols = 3, winW = 1.4, winH = 1.8;
    for (let f = 0; f < floors; f++) {
      for (let c = 0; c < cols; c++) {
        const isLit = isNight && (Math.random() > 0.25);
        const winMat = isLit ? M.winLit() : M.winDark.clone();
        const wx = (c - (cols - 1) / 2) * (w / (cols + 0.8));
        const wy = 2.5 + (f / floors) * h + winH / 2 + 2;

        // Front
        const wf = new THREE.Mesh(new THREE.BoxGeometry(winW, winH, 0.25), winMat);
        wf.position.set(wx, wy, d / 2 + 0.15);
        group.add(wf);
        if (isLit) windowMeshesRef.current.push(wf);

        // Back
        const wb = new THREE.Mesh(new THREE.BoxGeometry(winW, winH, 0.25), winMat.clone());
        wb.position.set(wx, wy, -d / 2 - 0.15);
        group.add(wb);
        if (isLit) windowMeshesRef.current.push(wb);

        // Left / Right side windows
        const ws = new THREE.Mesh(new THREE.BoxGeometry(0.25, winH, winW), winMat.clone());
        ws.position.set(w / 2 + 0.15, wy, (c - 1) * (d / 3));
        group.add(ws);
        const ws2 = ws.clone();
        ws2.position.x = -w / 2 - 0.15;
        group.add(ws2);
        if (isLit) { windowMeshesRef.current.push(ws, ws2); }
      }
    }

    // Night: tower ambient glow
    if (isNight) {
      const tl = new THREE.PointLight(sel ? '#D4AF37' : '#4466cc', 1.2, 50);
      tl.position.y = h * 0.5;
      group.add(tl);
    }

    group.position.set(x, 0, z);
    towerBodyMeshesRef.current[id] = [body];
    clickableRef.current.push(group);
    scene.add(group);
  });

  // Parking area
  box(scene, 50, 0.2, 30, 30, 0.1, -50, M.road, false);
  // Parking lines
  for (let i = 0; i < 6; i++) {
    box(scene, 0.3, 0.25, 8, 10 + i * 6, 0.15, -50, mat('#ffffff', { roughness: 0.9 }), false);
  }
}

// ── INTERIOR ──────────────────────────────────────────────────────────────────
function buildInterior(scene, style, isNight) {
  const palettes = {
    Modern:       { floor: '#2d1a0a', wall: '#1E293B', accent: '#D4AF37', sofa: '#334155', ceiling: '#0F172A', rug: '#1a2744' },
    Luxury:       { floor: '#f0e8d0', wall: '#1E1B4B', accent: '#D4AF37', sofa: '#3730a3', ceiling: '#0d0b2e', rug: '#312E81' },
    Scandinavian: { floor: '#c8a97a', wall: '#e2e8f0', accent: '#94A3B8', sofa: '#cbd5e1', ceiling: '#f8fafc', rug: '#bfdbfe' },
    Minimalist:   { floor: '#475569', wall: '#1e293b', accent: '#cbd5e1', sofa: '#0f172a', ceiling: '#020617', rug: '#1e293b' },
  };
  const p = palettes[style] || palettes.Modern;

  const RW = 10, RH = 3.8, RD = 8;

  // Floor
  const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), mat(p.floor, { roughness: 0.25, metalness: 0.05 }));
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;
  scene.add(floorMesh);

  // Ceiling
  const ceilMesh = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), mat(p.ceiling, { roughness: 0.9 }));
  ceilMesh.rotation.x = Math.PI / 2;
  ceilMesh.position.y = RH;
  scene.add(ceilMesh);

  // Walls
  const wallMat = mat(p.wall, { roughness: 0.75 });
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(RW, RH), wallMat);
  backWall.position.set(0, RH / 2, -RD / 2);
  backWall.receiveShadow = true;
  scene.add(backWall);

  const lWall = new THREE.Mesh(new THREE.PlaneGeometry(RD, RH), wallMat.clone());
  lWall.rotation.y = Math.PI / 2;
  lWall.position.set(-RW / 2, RH / 2, 0);
  lWall.receiveShadow = true;
  scene.add(lWall);

  const rWall = new THREE.Mesh(new THREE.PlaneGeometry(RD, RH), wallMat.clone());
  rWall.rotation.y = -Math.PI / 2;
  rWall.position.set(RW / 2, RH / 2, 0);
  rWall.receiveShadow = true;
  scene.add(rWall);

  // Window frame + glass (back wall)
  const goldMat = mat(p.accent, { metalness: 0.85, roughness: 0.15 });
  const ibox = (w, h, d, x, y, z, m, cast = true) => box(scene, w, h, d, x, y, z, m, cast);

  ibox(3.8, 2.8, 0.08, 0, 2.3, -RD / 2 + 0.05, goldMat); // outer frame
  const glassMat = mat(isNight ? '#0a1628' : '#7dd3fc', { transparent: true, opacity: 0.45, roughness: 0.04, metalness: 0.1 });
  ibox(3.5, 2.5, 0.06, 0, 2.3, -RD / 2 + 0.09, glassMat, false); // glass pane

  // Window light from outside
  if (!isNight) {
    const wl = new THREE.SpotLight('#fff5e0', 1.5, 12, Math.PI / 5, 0.4);
    wl.position.set(0, 2.3, -RD / 2 - 2);
    wl.target.position.set(0, 0.5, 0);
    scene.add(wl);
    scene.add(wl.target);
  }

  // Ceiling light
  const ceilLit = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.12, 0.9),
    mat(p.accent, { emissive: p.accent, emissiveIntensity: 0.5, roughness: 0.3 })
  );
  ceilLit.position.set(0, RH - 0.06, -0.4);
  scene.add(ceilLit);
  const ceilingPL = new THREE.PointLight(isNight ? '#ffe8a0' : '#fff5e0', isNight ? 2.2 : 1.4, 14);
  ceilingPL.position.set(0, RH - 0.1, -0.4);
  ceilingPL.castShadow = true;
  scene.add(ceilingPL);

  // Sofa
  const sofaMat = mat(p.sofa, { roughness: 0.82 });
  ibox(3.6, 0.55, 1.15, 0, 0.275, 1.7, sofaMat);                // seat
  ibox(3.6, 0.85, 0.32, 0, 0.425, 2.275, sofaMat);              // backrest
  ibox(0.38, 0.85, 1.15, -1.81, 0.425, 1.7, sofaMat);           // left arm
  ibox(0.38, 0.85, 1.15,  1.81, 0.425, 1.7, sofaMat);           // right arm
  // Seat cushions
  const cushMat = mat(p.accent, { roughness: 0.7 });
  ibox(1.1, 0.16, 0.95, -0.9, 0.63, 1.7, cushMat);
  ibox(1.1, 0.16, 0.95,  0.9, 0.63, 1.7, cushMat);
  // Back cushions
  ibox(0.9, 0.65, 0.18, -0.9, 0.7, 2.12, cushMat);
  ibox(0.9, 0.65, 0.18,  0.9, 0.7, 2.12, cushMat);

  // Coffee table
  const tableMat = style === 'Luxury' ? goldMat : mat('#374151', { roughness: 0.3, metalness: 0.35, transparent: true, opacity: 0.33 });
  ibox(1.6, 0.08, 0.85, 0, 0.45, 0.45, tableMat);
  [[-0.7,-0.36],[0.7,-0.36],[-0.7,0.36],[0.7,0.36]].forEach(([lx, lz]) => {
    ibox(0.07, 0.45, 0.07, lx, 0.225, lz + 0.45, mat('#1E293B', { roughness: 0.9 }));
  });
  // Decorative item on table
  ibox(0.22, 0.22, 0.22, -0.4, 0.56, 0.45, goldMat);

  // TV wall unit
  ibox(4.0, 0.42, 0.45, 0, 0.21, -RD / 2 + 0.26, mat('#0F172A', { roughness: 0.6 }));
  const tvMat = mat(isNight ? '#081428' : '#050a12', {
    roughness: 0.08, metalness: 0.6,
    emissive: isNight ? '#0a3060' : '#000000',
    emissiveIntensity: isNight ? 0.35 : 0,
  });
  ibox(3.1, 1.65, 0.06, 0, 1.6, -RD / 2 + 0.1, tvMat);         // screen
  ibox(3.22, 1.77, 0.04, 0, 1.6, -RD / 2 + 0.08, goldMat);     // bezel

  // Floor lamp
  const poleMat = mat('#64748B', { roughness: 0.7 });
  ibox(0.07, 2.3, 0.07, 3.9, 1.15, 2.6, poleMat);
  const shadeMat = mat(p.accent, { emissive: p.accent, emissiveIntensity: isNight ? 0.85 : 0.2 });
  ibox(0.55, 0.42, 0.55, 3.9, 2.41, 2.6, shadeMat);
  if (isNight) {
    const ll = new THREE.PointLight('#ffe090', 1.3, 5.5);
    ll.position.set(3.9, 2.2, 2.6);
    scene.add(ll);
  }

  // Rug
  const rugGeo = new THREE.PlaneGeometry(3.8, 2.8);
  const rug = new THREE.Mesh(rugGeo, mat(p.rug, { roughness: 0.97 }));
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, 0.01, 0.9);
  scene.add(rug);

  // Plants
  const plantPos = [[-4.3, 0.0, -2.8], [4.3, 0.0, 1.8]];
  plantPos.forEach(([px, py, pz]) => {
    ibox(0.38, 0.38, 0.38, px, 0.19, pz, mat('#166534', { roughness: 0.9 }));
    ibox(0.28, 0.75, 0.28, px, 0.75, pz, mat('#16a34a', { roughness: 0.92 }));
  });

  // Bookshelf on right wall
  ibox(0.1, 2.6, 1.6, RW / 2 - 0.08, 1.3, -1.6, mat('#334155', { roughness: 0.8 }));
  for (let i = 0; i < 4; i++) {
    ibox(0.08, 0.07, 1.5, RW / 2 - 0.08, 0.38 + i * 0.62, -1.6, mat('#1E293B'));
  }
  const bookCols = ['#ef4444','#3b82f6','#22c55e','#f59e0b','#8b5cf6','#ec4899'];
  bookCols.forEach((bc, i) => {
    ibox(0.07, 0.42, 0.13, RW / 2 - 0.06, 0.62 + Math.floor(i / 3) * 0.62, -1.1 - (i % 3) * 0.27, mat(bc, { roughness: 0.9 }));
  });

  // Side table
  ibox(0.7, 0.04, 0.7, -3.5, 0.6, 1.9, tableMat);
  ibox(0.06, 0.6, 0.06, -3.5, 0.3, 1.9, poleMat);
  // Table lamp
  ibox(0.3, 0.5, 0.3, -3.5, 0.87, 1.9, shadeMat);
}

// ── BUILDING INTERIOR — multi-floor cutaway ───────────────────────────────
function buildBuildingInterior(scene, towerId, isNight) {
  const towerData = {
    A: { floors: 10, label: 'Tower A', color: '#1a2744', accentColor: '#D4AF37' },
    B: { floors: 8,  label: 'Tower B', color: '#1a2030', accentColor: '#60a5fa' },
    C: { floors: 12, label: 'Tower C', color: '#1a1a2e', accentColor: '#a78bfa' },
  };
  const td = towerData[towerId] || towerData['A'];
  const FLOORS = Math.min(td.floors, 8); // show up to 8 floors in cutaway
  const FH = 4.5;   // floor height
  const BW = 20;    // building width
  const BD = 14;    // building depth (half shown in cutaway)

  // Ground slab
  box(scene, BW + 6, 0.5, BD + 6, 0, -0.25, 0, mat('#0a0f1a'));

  // Outer shell (back + sides, open front for cutaway)
  const shellMat = mat(td.color, { roughness: 0.3, metalness: 0.4, transparent: true, opacity: 0.35 });

  // Back wall
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(BW, FLOORS * FH, 0.5), shellMat);
  backWall.position.set(0, (FLOORS * FH) / 2, -BD / 2);
  scene.add(backWall);

  // Left wall
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, FLOORS * FH, BD), shellMat.clone());
  leftWall.position.set(-BW / 2, (FLOORS * FH) / 2, 0);
  scene.add(leftWall);

  // Right wall
  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, FLOORS * FH, BD), shellMat.clone());
  rightWall.position.set(BW / 2, (FLOORS * FH) / 2, 0);
  scene.add(rightWall);

  // Gold accent trim on corners
  const trimMat = mat(td.accentColor, { metalness: 0.8, roughness: 0.15 });
  [[-BW / 2, BW / 2]].flat().forEach(ex => {
    const trim = new THREE.Mesh(new THREE.BoxGeometry(0.35, FLOORS * FH + 1, 0.35), trimMat);
    trim.position.set(ex, (FLOORS * FH) / 2, -BD / 2);
    scene.add(trim);
    const trim2 = trim.clone();
    trim2.position.z = BD / 2;
    scene.add(trim2);
  });

  // Roof
  const roofMat = mat(td.accentColor, { metalness: 0.7, roughness: 0.2 });
  box(scene, BW + 1, 0.8, BD + 1, 0, FLOORS * FH + 0.4, 0, roofMat);

  // Ambient light
  scene.add(new THREE.AmbientLight('#8090b0', 0.5));

  // Main overhead light
  const overhead = new THREE.DirectionalLight('#ffffff', 0.8);
  overhead.position.set(10, 30, 20);
  overhead.castShadow = true;
  scene.add(overhead);

  // ── Build each floor ────────────────────────────────────────────────────
  const flatColors = ['#ef4444','#f59e0b','#22c55e','#3b82f6','#8b5cf6','#ec4899'];

  for (let f = 0; f < FLOORS; f++) {
    const yBase = f * FH;

    // Floor slab
    const slabMat = mat('#0f172a', { roughness: 0.8 });
    box(scene, BW, 0.22, BD, 0, yBase + 0.11, 0, slabMat, false);

    // Ceiling of this floor (= floor of next)
    const ceilMat = mat('#0c1526', { roughness: 0.9 });
    box(scene, BW, 0.18, BD, 0, yBase + FH - 0.09, 0, ceilMat, false);

    // Central corridor
    const corridorMat = mat('#1e293b', { roughness: 0.75 });
    box(scene, BW, 0.05, 2.0, 0, yBase + 0.25, 0, corridorMat, false);

    // Corridor lighting
    [-6, 0, 6].forEach(cx => {
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.4),
        mat(td.accentColor, { emissive: td.accentColor, emissiveIntensity: 0.7 }));
      lamp.position.set(cx, yBase + FH - 0.35, 0);
      scene.add(lamp);
      if (isNight || f < FLOORS) {
        const pl = new THREE.PointLight(td.accentColor, 0.7, 8);
        pl.position.set(cx, yBase + FH - 0.4, 0);
        scene.add(pl);
      }
    });

    // Floor number label (canvas texture)
    const floorLabel = makeTextSprite(`Floor ${f + 1}`, '#D4AF37', 10);
    floorLabel.position.set(-BW / 2 - 1.5, yBase + FH / 2, BD / 2);
    floorLabel.scale.set(3, 1, 1);
    scene.add(floorLabel);

    // 2 flats per floor — left and right of corridor
    buildFlat(scene, -BW / 4, yBase, FH, BD, flatColors[f % flatColors.length], isNight, f);
    buildFlat(scene, BW / 4, yBase, FH, BD, flatColors[(f + 2) % flatColors.length], isNight, f);

    // Balcony (front face, per flat)
    [-BW / 4, BW / 4].forEach(bx => {
      const balcony = new THREE.Mesh(new THREE.BoxGeometry(8, 0.15, 1.8),
        mat('#1e2a40', { roughness: 0.9 }));
      balcony.position.set(bx, yBase + 0.15, BD / 2 + 0.9);
      scene.add(balcony);
      // Balcony railing
      [-3.8, 3.8].forEach(rx => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 1.8), trimMat.clone());
        rail.position.set(bx + rx, yBase + 0.6, BD / 2 + 0.9);
        scene.add(rail);
      });
      const topRail = new THREE.Mesh(new THREE.BoxGeometry(8, 0.1, 0.08), trimMat.clone());
      topRail.position.set(bx, yBase + 1.1, BD / 2 + 1.8);
      scene.add(topRail);
    });

    // Staircase / lift core between flats
    const liftMat = mat('#334155', { roughness: 0.7 });
    box(scene, 2.5, FH, 2.5, 0, yBase + FH / 2, -BD / 2 + 1.5, liftMat);
    // Lift door — gold sliding panels
    box(scene, 0.55, 2.1, 0.08, -0.32, yBase + 1.1, -BD / 2 + 2.75, mat(td.accentColor, { metalness: 0.85, roughness: 0.1 }));
    box(scene, 0.55, 2.1, 0.08,  0.32, yBase + 1.1, -BD / 2 + 2.75, mat(td.accentColor, { metalness: 0.85, roughness: 0.1 }));

    // Staircase steps on right side of lift core
    for (let s = 0; s < 9; s++) {
      box(scene, 2.0, 0.12, 0.55,
        BW / 2 - 1.5,
        yBase + s * (FH / 9) + 0.06,
        -BD / 2 + 1.0 + s * 0.38,
        mat('#1e2a40', { roughness: 0.9 })
      );
    }
    // Stair railing
    box(scene, 0.06, FH * 0.85, 0.06, BW / 2 - 0.55, yBase + FH * 0.43, -BD / 2 + 4.2, trimMat.clone());
    box(scene, 0.06, FH * 0.85, 0.06, BW / 2 - 2.5,  yBase + FH * 0.43, -BD / 2 + 4.2, trimMat.clone());
    // Handrail diagonal
    const hrGeo = new THREE.BoxGeometry(0.06, 0.06, 3.8);
    const hr = new THREE.Mesh(hrGeo, trimMat.clone());
    hr.rotation.x = Math.atan2(FH, 3.4);
    hr.position.set(BW / 2 - 1.5, yBase + FH * 0.5, -BD / 2 + 2.5);
    scene.add(hr);

    // Fire extinguisher on wall near lift
    const extBody = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.55, 8), mat('#ef4444', { roughness: 0.5 }));
    extBody.position.set(-BW / 2 + 0.6, yBase + 1.0, -BD / 2 + 0.4);
    scene.add(extBody);

    // Floor number on lift door
    const liftLabel = makeTextSprite(`${f + 1}`, td.accentColor, 18);
    liftLabel.position.set(0, yBase + 2.5, -BD / 2 + 2.85);
    liftLabel.scale.set(1.2, 1.2, 1);
    scene.add(liftLabel);

    // Unit status badge on each flat (Available / Booked / Sold)
    const statuses = [['Available','#22c55e'], ['Booked','#f59e0b'], ['Available','#22c55e'], ['Sold','#ef4444']];
    const [leftStatus, leftColor] = statuses[(f * 2) % 4];
    const [rightStatus, rightColor] = statuses[(f * 2 + 1) % 4];
    const leftBadge = makeTextSprite(`${String.fromCharCode(65 + f)}-01 · ${leftStatus}`, leftColor, 11);
    leftBadge.position.set(-BW / 4, yBase + FH - 0.7, BD / 2 + 0.5);
    leftBadge.scale.set(4, 1.1, 1);
    scene.add(leftBadge);
    const rightBadge = makeTextSprite(`${String.fromCharCode(65 + f)}-02 · ${rightStatus}`, rightColor, 11);
    rightBadge.position.set(BW / 4, yBase + FH - 0.7, BD / 2 + 0.5);
    rightBadge.scale.set(4, 1.1, 1);
    scene.add(rightBadge);
  }

  // Animated elevator cabin (moves up and down)
  const elevatorCabin = new THREE.Group();
  const cabinBody = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.6, 2.0),
    mat(td.color, { transparent: true, opacity: 0.55, roughness: 0.3, metalness: 0.5 }));
  cabinBody.position.y = 1.3;
  elevatorCabin.add(cabinBody);
  const cabinDoor = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.2, 0.07),
    mat(td.accentColor, { metalness: 0.85, roughness: 0.1 }));
  cabinDoor.position.set(0, 1.1, 1.04);
  elevatorCabin.add(cabinDoor);
  elevatorCabin.position.set(0, 0, -BD / 2 + 1.5);
  scene.add(elevatorCabin);

  // Store ref for animation
  scene.userData.elevator = elevatorCabin;
  scene.userData.elevatorMaxY = (FLOORS - 1) * FH;
}

function buildFlat(scene, cx, yBase, FH, BD, accentCol, isNight, floorIdx) {
  const FW = 8.5;
  const wallH = FH - 0.4;
  const wallMat = mat('#1E293B', { roughness: 0.75 });
  const floorMat = mat('#2a1a0a', { roughness: 0.3 });
  const accentMat = mat(accentCol, { roughness: 0.7 });

  // Internal dividing walls
  // Back wall of flat
  box(scene, FW, wallH, 0.18, cx, yBase + wallH / 2, -BD / 2 + 0.2, wallMat);
  // Partition between living and bedroom
  box(scene, 0.15, wallH, BD * 0.45, cx + FW * 0.08, yBase + wallH / 2, -BD * 0.12, wallMat);
  // Bathroom wall
  box(scene, 0.15, wallH, BD * 0.25, cx - FW * 0.3, yBase + wallH / 2, -BD * 0.35, wallMat);

  // Floor carpet/tile
  const flatFloor = new THREE.Mesh(new THREE.BoxGeometry(FW - 0.3, 0.06, BD - 0.3),
    mat(floorIdx % 2 === 0 ? '#1a120a' : '#141e2a', { roughness: 0.3 }));
  flatFloor.position.set(cx, yBase + 0.22, 0);
  scene.add(flatFloor);

  // ─ Living room area (front half) ─────────────────────────────────────
  const lx = cx + FW * 0.12, lz = BD * 0.2;

  // Sofa
  box(scene, 2.8, 0.45, 0.9, lx, yBase + 0.45, lz, mat('#334155', { roughness: 0.85 }));
  box(scene, 2.8, 0.7, 0.25, lx, yBase + 0.55, lz + 0.57, mat('#334155', { roughness: 0.85 }));
  // Cushions
  [-0.7, 0.7].forEach(px => {
    const cush = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.14, 0.75), accentMat.clone());
    cush.position.set(lx + px, yBase + 0.67, lz);
    scene.add(cush);
  });

  // Coffee table
  box(scene, 1.1, 0.06, 0.65, lx, yBase + 0.38, lz - 0.65, mat('#D4AF37', { metalness: 0.6, roughness: 0.3 }));

  // TV on wall
  box(scene, 2.2, 1.1, 0.07, lx, yBase + 1.6, -BD / 2 + 0.3, mat('#050a12', { roughness: 0.08, metalness: 0.6 }));
  box(scene, 2.3, 1.2, 0.05, lx, yBase + 1.6, -BD / 2 + 0.28, mat(accentCol, { metalness: 0.8 }));

  // Window on front (open face with gold frame)
  const winMat = mat('#7dd3fc', { transparent: true, opacity: 0.35, roughness: 0.04 });
  box(scene, 2.2, 1.8, 0.1, lx, yBase + 1.9, BD / 2 - 0.06, winMat, false);
  box(scene, 2.35, 1.95, 0.06, lx, yBase + 1.9, BD / 2 - 0.04, mat(accentCol, { metalness: 0.7 }));

  // ─ Bedroom (back half) ───────────────────────────────────────────────
  const bx = cx - FW * 0.2, bz = -BD * 0.28;

  // Bed frame
  box(scene, 2.2, 0.28, 2.8, bx, yBase + 0.14, bz, mat('#1a0a05', { roughness: 0.9 }));
  // Mattress
  box(scene, 2.0, 0.22, 2.5, bx, yBase + 0.39, bz, mat('#e2e8f0', { roughness: 0.95 }));
  // Headboard
  box(scene, 2.2, 0.9, 0.18, bx, yBase + 0.65, bz - 1.3, mat('#0a1628', { roughness: 0.8 }));
  // Pillows
  [-0.55, 0.55].forEach(px => {
    const pill = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.16, 0.5), mat('#cbd5e1', { roughness: 0.95 }));
    pill.position.set(bx + px, yBase + 0.52, bz - 0.9);
    scene.add(pill);
  });
  // Blanket
  const blanket = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 1.4), accentMat.clone());
  blanket.position.set(bx, yBase + 0.52, bz + 0.55);
  scene.add(blanket);

  // Wardrobe
  box(scene, 0.55, wallH * 0.9, 1.8, cx + FW * 0.42, yBase + wallH * 0.45, bz, mat('#0f1728', { roughness: 0.7 }));
  // Wardrobe handles
  box(scene, 0.05, 0.4, 0.05, cx + FW * 0.42 - 0.25, yBase + wallH * 0.45, bz + 0.85, mat(accentCol, { metalness: 0.8 }));
  box(scene, 0.05, 0.4, 0.05, cx + FW * 0.42 - 0.25, yBase + wallH * 0.45, bz - 0.85, mat(accentCol, { metalness: 0.8 }));

  // Bedside lamps
  [-0.85, 0.85].forEach(px => {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.08, 8),
      mat('#64748B', { roughness: 0.7 }));
    base.position.set(bx + px, yBase + 0.6, bz - 1.15);
    scene.add(base);
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.3, 8),
      mat(accentCol, { emissive: accentCol, emissiveIntensity: isNight ? 0.9 : 0.2 }));
    shade.position.set(bx + px, yBase + 0.78, bz - 1.15);
    scene.add(shade);
    if (isNight) {
      const ll = new THREE.PointLight(accentCol, 0.5, 3.5);
      ll.position.set(bx + px, yBase + 0.85, bz - 1.15);
      scene.add(ll);
    }
  });

  // ─ Kitchen (expanded) ────────────────────────────────────────────────
  const kx = cx - FW * 0.1, kz = -BD * 0.43;
  // Counter L-shape
  box(scene, 2.2, 0.88, 0.5, kx, yBase + 0.44, kz, mat('#0f172a', { roughness: 0.55 }));
  box(scene, 0.5, 0.88, 1.4, kx + 0.85, yBase + 0.44, kz - 0.55, mat('#0f172a', { roughness: 0.55 }));
  // Countertop (dark marble)
  box(scene, 2.2, 0.055, 0.5, kx, yBase + 0.91, kz, mat('#1a1a1a', { metalness: 0.55, roughness: 0.15 }));
  box(scene, 0.5, 0.055, 1.4, kx + 0.85, yBase + 0.91, kz - 0.55, mat('#1a1a1a', { metalness: 0.55, roughness: 0.15 }));
  // Sink basin
  box(scene, 0.52, 0.07, 0.36, kx - 0.48, yBase + 0.97, kz, mat('#60a5fa', { transparent: true, opacity: 0.65, roughness: 0.04 }));
  // Faucet
  box(scene, 0.05, 0.22, 0.05, kx - 0.48, yBase + 1.12, kz - 0.12, mat('#94A3B8', { metalness: 0.9, roughness: 0.1 }));
  box(scene, 0.22, 0.05, 0.05, kx - 0.48, yBase + 1.24, kz - 0.06, mat('#94A3B8', { metalness: 0.9, roughness: 0.1 }));
  // Upper cabinets
  box(scene, 2.2, 0.75, 0.3, kx, yBase + 2.1, kz - 0.12, mat('#0a1220', { roughness: 0.7 }));
  // Cabinet handles
  [-0.7, 0.3].forEach(hx => box(scene, 0.35, 0.04, 0.04, kx + hx, yBase + 2.1, kz + 0.02, mat(accentCol, { metalness: 0.8 })));
  // Gas stove
  box(scene, 0.65, 0.04, 0.45, kx + 0.5, yBase + 0.93, kz, mat('#111827', { metalness: 0.6, roughness: 0.3 }));
  // Burner rings
  [-0.12, 0.12].forEach(bx2 => {
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.1, 12), mat('#374151'));
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(kx + 0.5 + bx2, yBase + 0.96, kz);
    scene.add(ring);
  });
  // Exhaust hood
  box(scene, 0.7, 0.3, 0.38, kx + 0.5, yBase + 1.9, kz - 0.05, mat('#1f2937', { metalness: 0.6 }));

  // ─ Dining area ───────────────────────────────────────────────────────
  const dx = cx + FW * 0.05, dz = -BD * 0.12;
  // Dining table
  box(scene, 1.6, 0.07, 0.95, dx, yBase + 0.82, dz, mat('#3d1f0d', { roughness: 0.4 }));
  // Table legs
  [[-0.72,-0.42],[0.72,-0.42],[-0.72,0.42],[0.72,0.42]].forEach(([tlx,tlz]) =>
    box(scene, 0.07, 0.82, 0.07, dx + tlx, yBase + 0.41, dz + tlz, mat('#2d1508', { roughness: 0.8 }))
  );
  // Chairs (4)
  [[-0.72, 0, 0],[ 0.72, 0, 0],[ 0, 0, -0.6],[ 0, 0, 0.6]].forEach(([chx, , chz]) => {
    box(scene, 0.42, 0.05, 0.42, dx + chx, yBase + 0.46, dz + chz, mat('#1e293b', { roughness: 0.8 })); // seat
    box(scene, 0.42, 0.45, 0.06, dx + chx, yBase + 0.7, dz + chz + (chz === 0 ? (chx > 0 ? 0.22 : -0.22) : (chz > 0 ? 0.22 : -0.22)), mat('#1e293b'));
  });
  // Centrepiece bowl
  const bowlGeo = new THREE.SphereGeometry(0.12, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  const bowl = new THREE.Mesh(bowlGeo, mat(accentCol, { metalness: 0.7, roughness: 0.2 }));
  bowl.position.set(dx, yBase + 0.9, dz);
  scene.add(bowl);

  // ─ Bathroom ──────────────────────────────────────────────────────────
  const btx = cx + FW * 0.35, btz = BD * 0.28;
  // Bathroom walls
  box(scene, 0.12, wallH, 2.2, cx + FW * 0.28, yBase + wallH / 2, btz - 0.5, wallMat.clone());
  box(scene, 2.1, wallH, 0.12, btx + 0.22, yBase + wallH / 2, btz + 0.6, wallMat.clone());
  // Toilet
  box(scene, 0.45, 0.38, 0.65, btx + 0.1, yBase + 0.19, btz + 0.1, mat('#e2e8f0', { roughness: 0.5 }));
  box(scene, 0.45, 0.08, 0.6, btx + 0.1, yBase + 0.4, btz + 0.08, mat('#e2e8f0', { roughness: 0.5 })); // seat
  box(scene, 0.45, 0.5, 0.15, btx + 0.1, yBase + 0.56, btz - 0.2, mat('#e2e8f0', { roughness: 0.5 })); // tank
  // Wash basin
  const basinGeo = new THREE.CylinderGeometry(0.22, 0.18, 0.18, 12);
  const basin = new THREE.Mesh(basinGeo, mat('#e2e8f0', { roughness: 0.3 }));
  basin.position.set(btx - 0.35, yBase + 0.85, btz - 0.1);
  scene.add(basin);
  // Basin faucet
  box(scene, 0.04, 0.18, 0.04, btx - 0.35, yBase + 1.0, btz - 0.22, mat('#94A3B8', { metalness: 0.9 }));
  box(scene, 0.18, 0.04, 0.04, btx - 0.35, yBase + 1.18, btz - 0.16, mat('#94A3B8', { metalness: 0.9 }));
  // Shower area
  box(scene, 0.9, 0.06, 0.9, btx + 0.05, yBase + 0.2, btz - 0.55, mat('#94A3B8', { metalness: 0.4, roughness: 0.3 })); // tray
  const showerGlass = new THREE.Mesh(new THREE.BoxGeometry(0.9, wallH * 0.7, 0.05),
    mat('#7dd3fc', { transparent: true, opacity: 0.2, roughness: 0.05 }));
  showerGlass.position.set(btx + 0.05, yBase + wallH * 0.35, btz - 0.97);
  scene.add(showerGlass);
  // Shower head
  box(scene, 0.06, 0.35, 0.06, btx + 0.05, yBase + 2.5, btz - 0.7, mat('#64748B', { metalness: 0.8 }));
  const shHead = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.06, 8), mat('#94A3B8', { metalness: 0.85 }));
  shHead.rotation.x = Math.PI / 2;
  shHead.position.set(btx + 0.05, yBase + 2.5, btz - 0.55);
  scene.add(shHead);
  // Mirror above basin
  box(scene, 0.55, 0.7, 0.04, btx - 0.35, yBase + 1.55, btz - 0.1, mat('#c0d8f0', { metalness: 0.85, roughness: 0.05 }));
  box(scene, 0.6, 0.75, 0.02, btx - 0.35, yBase + 1.55, btz - 0.09, mat(accentCol, { metalness: 0.7 })); // mirror frame
  // Bathroom light
  const bathLamp = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.3),
    mat('#ffffff', { emissive: '#ffffff', emissiveIntensity: 0.9 }));
  bathLamp.position.set(btx - 0.1, yBase + wallH - 0.15, btz - 0.1);
  scene.add(bathLamp);
  if (isNight) {
    const bl = new THREE.PointLight('#ffffff', 0.6, 3.5);
    bl.position.set(btx - 0.1, yBase + wallH - 0.2, btz - 0.1);
    scene.add(bl);
  }

  // ─ Ceiling fan in living room ─────────────────────────────────────────
  const fanX = lx, fanY = yBase + FH - 0.32, fanZ = lz - 0.3;
  // Motor hub
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.18, 10), mat('#334155', { metalness: 0.5 }));
  hub.position.set(fanX, fanY, fanZ);
  scene.add(hub);
  hub.userData.fanHub = true;
  // Blades (stored for animation)
  const bladeGroup = new THREE.Group();
  for (let b = 0; b < 3; b++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 0.28), mat(accentCol, { roughness: 0.4 }));
    blade.position.set(0.7, 0, 0);
    blade.rotation.y = (b / 3) * Math.PI * 2;
    const pivot = new THREE.Group();
    pivot.rotation.y = (b / 3) * Math.PI * 2;
    pivot.add(blade);
    bladeGroup.add(pivot);
  }
  bladeGroup.position.set(fanX, fanY - 0.06, fanZ);
  scene.add(bladeGroup);
  // Tag for animation
  bladeGroup.userData.isFan = true;
  scene.userData.fans = scene.userData.fans || [];
  scene.userData.fans.push(bladeGroup);

  // ─ Wall art / paintings ───────────────────────────────────────────────
  const artColors = ['#ef4444','#3b82f6','#22c55e','#f59e0b','#8b5cf6'];
  const artColor = artColors[floorIdx % artColors.length];
  // Painting frame in living room
  box(scene, 1.1, 0.75, 0.04, lx + 0.8, yBase + 2.2, -BD / 2 + 0.25, mat('#1a1a1a', { roughness: 0.8 }));
  box(scene, 0.95, 0.62, 0.05, lx + 0.8, yBase + 2.2, -BD / 2 + 0.27, mat(artColor, { roughness: 0.6 }));
  // Abstract stripes on painting
  [-0.15, 0, 0.15].forEach((ox, i) => {
    box(scene, 0.12, 0.62, 0.02, lx + 0.8 + ox, yBase + 2.2, -BD / 2 + 0.29,
      mat(artColors[(i + floorIdx + 1) % artColors.length], { roughness: 0.5 }));
  });

  // Wall clock
  const clockGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.05, 16);
  const clock = new THREE.Mesh(clockGeo, mat('#0f172a', { roughness: 0.5 }));
  clock.rotation.x = Math.PI / 2;
  clock.position.set(lx - 1.2, yBase + 2.4, -BD / 2 + 0.2);
  scene.add(clock);
  const clockFace = new THREE.Mesh(new THREE.CircleGeometry(0.2, 16), mat('#f1f5f9', { roughness: 0.8 }));
  clockFace.rotation.x = Math.PI / 2;
  clockFace.position.set(lx - 1.2, yBase + 2.4, -BD / 2 + 0.24);
  scene.add(clockFace);

  // ─ Balcony enhancements ───────────────────────────────────────────────
  // Balcony plants
  [cx - 2.8, cx + 2.8].forEach(px => {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.28, 8), mat('#92400e', { roughness: 0.9 }));
    pot.position.set(px, yBase + 0.28, BD / 2 + 1.5);
    scene.add(pot);
    const plant = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 7), mat('#15803d', { roughness: 0.9 }));
    plant.position.set(px, yBase + 0.65, BD / 2 + 1.5);
    scene.add(plant);
  });
  // Glass balcony panel
  const glassFence = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.95, 0.04),
    mat('#7dd3fc', { transparent: true, opacity: 0.18, roughness: 0.04 }));
  glassFence.position.set(cx, yBase + 0.68, BD / 2 + 1.8);
  scene.add(glassFence);
  // Outdoor chair on balcony
  box(scene, 0.55, 0.06, 0.55, cx, yBase + 0.3, BD / 2 + 1.2, mat('#1e293b', { roughness: 0.9 }));
  box(scene, 0.55, 0.5, 0.06, cx, yBase + 0.55, BD / 2 + 1.45, mat('#1e293b', { roughness: 0.9 }));
}

function makeTextSprite(text, color, fontSize = 14) {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 256, 64);
  ctx.fillStyle = 'rgba(10,15,29,0.8)';
  ctx.roundRect(0, 0, 256, 64, 10);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.font = `bold ${fontSize}px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 32);
  const tex = new THREE.CanvasTexture(canvas);
  return new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
}

// ── Helpers ────────────────────────────────────────────────────────────────
function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...opts });
}

function box(scene, w, h, d, x, y, z, material, cast = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}
