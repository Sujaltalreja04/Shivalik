import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Compass, RotateCw, ZoomIn, ZoomOut, Move, Eye } from 'lucide-react';

export default function ThreeDViewer({
  mode = 'interior', // 'township' or 'interior'
  interiorStyle = 'Modern', // 'Modern', 'Luxury', 'Scandinavian', 'Minimalist'
  interiorBudget = 1000000,
  timeOfDay = 12, // 8 to 18 (shadow clock)
  selectedTower = null,
  onSelectTower = null,
  onSelectAmenity = null,
  highlightFloor = null,
}) {
  const mountRef = useRef(null);
  const [viewMode, setViewMode] = useState('dollhouse');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true); // track if component is still mounted

  // Keep control states in refs — initialized lazily in useEffect to avoid calling THREE during render
  const stateRef = useRef(null);
  if (!stateRef.current) {
    stateRef.current = {
      viewMode: 'dollhouse',
      style: interiorStyle,
      time: timeOfDay,
      selectedTower: selectedTower,
      highlightFloor: highlightFloor,
      keys: { w: false, a: false, s: false, d: false },
      cameraYaw: -Math.PI / 4,
      cameraPitch: -Math.PI / 6,
      vrYaw: 0,
      vrPitch: 0,
      radius: 18,
      vrPos: null,   // initialized inside useEffect (THREE.Vector3)
      target: null,  // initialized inside useEffect (THREE.Vector3)
      isDragging: false,
      prevMouse: { x: 0, y: 0 }
    };
  }

  // Track state updates
  useEffect(() => {
    stateRef.current.viewMode = viewMode;
    stateRef.current.style = interiorStyle;
    stateRef.current.time = timeOfDay;
    stateRef.current.selectedTower = selectedTower;
    stateRef.current.highlightFloor = highlightFloor;
  }, [viewMode, interiorStyle, timeOfDay, selectedTower, highlightFloor]);

  // Handle keyboard events for VR mode navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(k)) {
        if (k === 'w' || k === 'arrowup') stateRef.current.keys.w = true;
        if (k === 'a' || k === 'arrowleft') stateRef.current.keys.a = true;
        if (k === 's' || k === 'arrowdown') stateRef.current.keys.s = true;
        if (k === 'd' || k === 'arrowright') stateRef.current.keys.d = true;
      }
    };

    const handleKeyUp = (e) => {
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(k)) {
        if (k === 'w' || k === 'arrowup') stateRef.current.keys.w = false;
        if (k === 'a' || k === 'arrowleft') stateRef.current.keys.a = false;
        if (k === 's' || k === 'arrowdown') stateRef.current.keys.s = false;
        if (k === 'd' || k === 'arrowright') stateRef.current.keys.d = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (!mountRef.current) return;

    const container = mountRef.current;

    // --- INIT FUNCTION: wrapped in try-catch to prevent production crashes ---
    const initScene = () => {
      try {
        // Get actual container dimensions (fallback to safe defaults)
        const width = container.clientWidth > 0 ? container.clientWidth : 800;
        const height = container.clientHeight > 0 ? container.clientHeight : 500;

      const scene = new THREE.Scene();
      // Premium Slate Gradient-like Background Color
      scene.background = new THREE.Color(0x0a0f1d);
      scene.fog = new THREE.FogExp2(0x0a0f1d, 0.015);

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      // Clear previous canvas and attach new one
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
      
      // Make the canvas fill the container via CSS
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';

      // Initialize THREE.Vector3 objects here (safe inside effect)
      if (!stateRef.current.vrPos) {
        stateRef.current.vrPos = new THREE.Vector3(0, 1.6, 5);
      }
      if (!stateRef.current.target) {
        stateRef.current.target = new THREE.Vector3(0, 0, 0);
      }

      // Hide loading overlay — scene is now initializing
      if (mountedRef.current) setLoading(false);

    // --- PROCEDURAL 3D MESH GENERATORS ---

    // Materials Store
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0xd4af37,
      emissiveIntensity: 0.1
    });

    // Simple glass material (MeshPhysicalMaterial with transmission requires WebGL2 extensions - use MeshStandardMaterial for compatibility)
    const windowGlassMat = new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.25,
      roughness: 0.05,
      metalness: 0.95,
    });

    const glowWindowMat = new THREE.MeshStandardMaterial({
      color: 0xffe082,
      emissive: 0xffb300,
      emissiveIntensity: 1.0,
      roughness: 0.5
    });

    const darkSlateMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
      metalness: 0.2
    });

    // Mesh Holders
    const meshesGroup = new THREE.Group();
    scene.add(meshesGroup);

    // Track clickable objects for raycasting
    const clickableObjects = [];

    // Helper: Dynamic Floor material styling
    const getFloorMaterial = (style) => {
      switch (style) {
        case 'Luxury': // Carrara Marble
          return new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.1, metalness: 0.1 });
        case 'Scandinavian': // Light Oak
          return new THREE.MeshStandardMaterial({ color: 0xd6b38c, roughness: 0.6, metalness: 0.0 });
        case 'Minimalist': // Microcement Screed
          return new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5, metalness: 0.1 });
        case 'Modern': // Engineered Timber
        default:
          return new THREE.MeshStandardMaterial({ color: 0x8a5a36, roughness: 0.4, metalness: 0.0 });
      }
    };

    const getWallMaterial = (style) => {
      switch (style) {
        case 'Luxury':
          return new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.5 }); // Deep Royal Navy
        case 'Scandinavian':
          return new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.8 }); // Clean Chalk White
        case 'Minimalist':
          return new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 }); // Industrial Gray
        case 'Modern':
        default:
          return new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 }); // Deep Charcoal Slate
      }
    };

    // 1. POPULATE SCENE BASED ON MODE
    if (mode === 'township') {
      // --- TOWNSHIP MODEL ---
      // Ground lawn
      const grassGeo = new THREE.PlaneGeometry(35, 35);
      const grassMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.9 });
      const grass = new THREE.Mesh(grassGeo, grassMat);
      grass.rotation.x = -Math.PI / 2;
      grass.receiveShadow = true;
      meshesGroup.add(grass);

      // Central Garden
      const gardenGeo = new THREE.CylinderGeometry(6, 6, 0.1, 32);
      const gardenMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });
      const garden = new THREE.Mesh(gardenGeo, gardenMat);
      garden.position.set(0, 0.05, 0);
      meshesGroup.add(garden);

      // Clubhouse Pool
      const poolFrameGeo = new THREE.BoxGeometry(7, 0.2, 4);
      const poolFrame = new THREE.Mesh(poolFrameGeo, darkSlateMat);
      poolFrame.position.set(-6, 0.1, -6);
      meshesGroup.add(poolFrame);

      const poolWaterGeo = new THREE.PlaneGeometry(6.6, 3.6);
      const poolWaterMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.1,
        metalness: 0.8,
        emissive: 0x0e7490,
        emissiveIntensity: 0.3
      });
      const poolWater = new THREE.Mesh(poolWaterGeo, poolWaterMat);
      poolWater.rotation.x = -Math.PI / 2;
      poolWater.position.set(-6, 0.21, -6);
      poolWater.name = 'amenity-pool';
      meshesGroup.add(poolWater);
      clickableObjects.push(poolWater);

      // Clubhouse Gym structure
      const gymGeo = new THREE.BoxGeometry(6, 3, 5);
      const gym = new THREE.Mesh(gymGeo, darkSlateMat);
      gym.position.set(-6, 1.5, 3);
      gym.name = 'amenity-gym';
      gym.castShadow = true;
      gym.receiveShadow = true;
      meshesGroup.add(gym);
      clickableObjects.push(gym);

      // Add a gold roof strip
      const gymRoofGeo = new THREE.BoxGeometry(6.2, 0.3, 5.2);
      const gymRoof = new THREE.Mesh(gymRoofGeo, goldMat);
      gymRoof.position.set(-6, 3.15, 3);
      meshesGroup.add(gymRoof);

      // Tower A mesh
      const towerAGeo = new THREE.BoxGeometry(3.5, 12, 3.5);
      const towerAMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
      const towerA = new THREE.Mesh(towerAGeo, towerAMat);
      towerA.position.set(6, 6, -5);
      towerA.castShadow = true;
      towerA.receiveShadow = true;
      towerA.name = 'tower-A';
      meshesGroup.add(towerA);
      clickableObjects.push(towerA);

      // Tower B mesh
      const towerBGeo = new THREE.BoxGeometry(3.5, 8, 3.5);
      const towerBMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
      const towerB = new THREE.Mesh(towerBGeo, towerBMat);
      towerB.position.set(2, 4, 7);
      towerB.castShadow = true;
      towerB.receiveShadow = true;
      towerB.name = 'tower-B';
      meshesGroup.add(towerB);
      clickableObjects.push(towerB);

      // Tower C mesh
      const towerCGeo = new THREE.BoxGeometry(3.5, 15, 3.5);
      const towerCMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
      const towerC = new THREE.Mesh(towerCGeo, towerCMat);
      towerC.position.set(8, 7.5, 5);
      towerC.castShadow = true;
      towerC.receiveShadow = true;
      towerC.name = 'tower-C';
      meshesGroup.add(towerC);
      clickableObjects.push(towerC);

      // Helper to construct tower glowing windows
      const buildWindows = (parentTower, floorsCount, towerLetter) => {
        const offset = 0.8;
        const windowGeo = new THREE.BoxGeometry(0.3, 0.4, 0.4);
        for (let f = 1; f <= floorsCount; f++) {
          for (let side = 0; side < 4; side++) {
            const wMesh = new THREE.Mesh(windowGeo, glowWindowMat);
            wMesh.name = `window-${towerLetter}-floor-${f}`;
            // Position windows around building sides
            const yPos = (f * (parentTower.geometry.parameters.height / (floorsCount + 1)));
            const halfW = parentTower.geometry.parameters.width / 2;
            if (side === 0) wMesh.position.set(parentTower.position.x + halfW + 0.02, yPos, parentTower.position.z);
            if (side === 1) wMesh.position.set(parentTower.position.x - halfW - 0.02, yPos, parentTower.position.z);
            if (side === 2) wMesh.position.set(parentTower.position.x, yPos, parentTower.position.z + halfW + 0.02);
            if (side === 3) wMesh.position.set(parentTower.position.x, yPos, parentTower.position.z - halfW - 0.02);

            if (side >= 2) wMesh.rotation.y = Math.PI / 2;
            meshesGroup.add(wMesh);
          }
        }
      };

      buildWindows(towerA, 10, 'A');
      buildWindows(towerB, 6, 'B');
      buildWindows(towerC, 14, 'C');

      // Add simple trees (Cone geometries on cylinders)
      const addTree = (x, z) => {
        const trunkGeo = new THREE.CylinderGeometry(0.15, 0.2, 1, 8);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.set(x, 0.5, z);
        trunk.castShadow = true;
        meshesGroup.add(trunk);

        const leavesGeo = new THREE.ConeGeometry(0.8, 1.8, 8);
        const leavesMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
        const leaves = new THREE.Mesh(leavesGeo, leavesMat);
        leaves.position.set(x, 1.8, z);
        leaves.castShadow = true;
        meshesGroup.add(leaves);
      };

      addTree(-3, -2);
      addTree(-4, 0);
      addTree(3, -1);
      addTree(4, 2);
      addTree(-1, 5);
      addTree(-8, -2);

    } else {
      // --- APARTMENT FLAT MODEL ---
      // Floor Plan Plane
      const floorGeo = new THREE.PlaneGeometry(12, 12);
      const floorMesh = new THREE.Mesh(floorGeo, getFloorMaterial(interiorStyle));
      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.receiveShadow = true;
      meshesGroup.add(floorMesh);

      // Generate boundary & partition walls (procedural boxes)
      const wallMat = getWallMaterial(interiorStyle);

      const addWall = (x, z, w, d, h = 3, name = '') => {
        const wallGeo = new THREE.BoxGeometry(w, h, d);
        const wall = new THREE.Mesh(wallGeo, wallMat);
        wall.position.set(x, h / 2, z);
        wall.castShadow = true;
        wall.receiveShadow = true;
        wall.name = name;
        meshesGroup.add(wall);
        return wall;
      };

      // External perimeter walls
      addWall(0, -6, 12, 0.3); // Back
      addWall(0, 6, 12, 0.3);  // Front
      addWall(-6, 0, 0.3, 12); // Left
      addWall(6, 0, 0.3, 12);  // Right

      // Interior partition walls (splitting Master Bed, Living Room, Kitchen)
      addWall(0, 1, 0.2, 10, 3); // Middle dividing line Y
      addWall(3, -2, 6, 0.2, 3); // Divider for Kitchen/Bed

      // Big Window Frame on Back Wall looking out
      const windowOuterGeo = new THREE.BoxGeometry(4, 2, 0.4);
      const windowOuter = new THREE.Mesh(windowOuterGeo, goldMat);
      windowOuter.position.set(0, 1.5, -5.9);
      meshesGroup.add(windowOuter);

      const windowPaneGeo = new THREE.BoxGeometry(3.8, 1.8, 0.1);
      const windowPane = new THREE.Mesh(windowPaneGeo, windowGlassMat);
      windowPane.position.set(0, 1.5, -5.9);
      meshesGroup.add(windowPane);

      // Procedural Luxury Sofa Model (Sofa Group)
      const sofaGroup = new THREE.Group();
      sofaGroup.position.set(-3, 0, -2);
      sofaGroup.rotation.y = Math.PI / 2;

      const sofaColor = interiorStyle === 'Luxury' ? 0xb91c1c : interiorStyle === 'Minimalist' ? 0x64748b : 0x1e3a8a;
      const cushionMat = new THREE.MeshStandardMaterial({ color: sofaColor, roughness: 0.6 });

      // Base
      const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.4, 1.4), cushionMat);
      baseMesh.position.set(0, 0.2, 0);
      baseMesh.castShadow = true;
      sofaGroup.add(baseMesh);

      // Backrest
      const backMesh = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.8, 0.3), cushionMat);
      backMesh.position.set(0, 0.6, -0.55);
      backMesh.castShadow = true;
      sofaGroup.add(backMesh);

      // Armrests
      const armL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 1.4), cushionMat);
      armL.position.set(-1.75, 0.4, 0);
      armL.castShadow = true;
      sofaGroup.add(armL);

      const armR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 1.4), cushionMat);
      armR.position.set(1.75, 0.4, 0);
      armR.castShadow = true;
      sofaGroup.add(armR);

      meshesGroup.add(sofaGroup);

      // Coffee Table (Glass top + wood legs)
      const tableGroup = new THREE.Group();
      tableGroup.position.set(-3, 0, 1);

      const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 });
      for (let i = 0; i < 4; i++) {
        const leg = new THREE.Mesh(legGeo, legMat);
        const lx = i < 2 ? -0.8 : 0.8;
        const lz = i % 2 === 0 ? -0.5 : 0.5;
        leg.position.set(lx, 0.25, lz);
        leg.castShadow = true;
        tableGroup.add(leg);
      }

      const topMesh = new THREE.Mesh(new THREE.BoxGeometry(2, 0.08, 1.2), windowGlassMat);
      topMesh.position.set(0, 0.5, 0);
      topMesh.castShadow = true;
      tableGroup.add(topMesh);

      meshesGroup.add(tableGroup);

      // Luxury Master Bed Model (Master Bed Group)
      const bedGroup = new THREE.Group();
      bedGroup.position.set(3, 0, -3.5);
      bedGroup.rotation.y = -Math.PI;

      const woodFrameMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.6 });
      const sheetsMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });
      const pillowsMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.8 });

      // Bed Frame
      const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.4, 4), woodFrameMat);
      bedFrame.position.set(0, 0.2, 0);
      bedFrame.castShadow = true;
      bedGroup.add(bedFrame);

      // Bed Mattress/Sheets
      const mattress = new THREE.Mesh(new THREE.BoxGeometry(3, 0.4, 3.8), sheetsMat);
      mattress.position.set(0, 0.5, 0.1);
      mattress.castShadow = true;
      bedGroup.add(mattress);

      // Headboard
      const headboard = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.2, 0.2), woodFrameMat);
      headboard.position.set(0, 0.8, -1.9);
      headboard.castShadow = true;
      bedGroup.add(headboard);

      // Two Pillows
      const pillow1 = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.15, 0.7), pillowsMat);
      pillow1.position.set(-0.65, 0.75, -1.3);
      bedGroup.add(pillow1);

      const pillow2 = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.15, 0.7), pillowsMat);
      pillow2.position.set(0.65, 0.75, -1.3);
      bedGroup.add(pillow2);

      meshesGroup.add(bedGroup);

      // Standing Floor Lamp with PointLight source
      const lampGroup = new THREE.Group();
      lampGroup.position.set(5, 0, -1);

      const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.05), goldMat);
      lampBase.position.set(0, 0.025, 0);
      lampGroup.add(lampBase);

      const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8), goldMat);
      lampPole.position.set(0, 0.9, 0);
      lampPole.castShadow = true;
      lampGroup.add(lampPole);

      const shadeGeo = new THREE.CylinderGeometry(0.3, 0.4, 0.5, 16);
      const shadeMat = new THREE.MeshStandardMaterial({
        color: 0xfffaf0,
        emissive: 0xffffe0,
        emissiveIntensity: 0.2,
        roughness: 0.8
      });
      const lampShade = new THREE.Mesh(shadeGeo, shadeMat);
      lampShade.position.set(0, 1.8, 0);
      lampGroup.add(lampShade);

      // Light point that glows in dark/night times
      const lampLight = new THREE.PointLight(0xffb300, 1.5, 8);
      lampLight.position.set(0, 1.8, 0);
      lampLight.castShadow = true;
      lampLight.shadow.bias = -0.002;
      lampGroup.add(lampLight);

      meshesGroup.add(lampGroup);

      // Indoor Green Plant in Gold Pot
      const plantGroup = new THREE.Group();
      plantGroup.position.set(-5, 0, -5);

      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 0.6), goldMat);
      pot.position.set(0, 0.3, 0);
      pot.castShadow = true;
      plantGroup.add(pot);

      const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.05), new THREE.MeshStandardMaterial({ color: 0x3d2314 }));
      soil.position.set(0, 0.58, 0);
      plantGroup.add(soil);

      const plantGeo = new THREE.SphereGeometry(0.5, 8, 8);
      const plantMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });
      for (let i = 0; i < 4; i++) {
        const leaves = new THREE.Mesh(plantGeo, plantMat);
        leaves.scale.set(0.6, 1.5, 0.6);
        leaves.rotation.x = 0.3;
        leaves.rotation.z = i * Math.PI / 2;
        leaves.position.set(0, 1.0, 0);
        leaves.castShadow = true;
        plantGroup.add(leaves);
      }

      meshesGroup.add(plantGroup);
    }

    // --- LIGHTS & ATMOSPHERE ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunLight.position.set(10, 15, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 40;
    const d = 15;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    // Warm evening/indoor ambient fallback light
    const floorLight = new THREE.PointLight(0xffffff, 0.1, 20);
    floorLight.position.set(0, 8, 0);
    scene.add(floorLight);

    setLoading(false);

    // --- RAYCASTING (Clicks on objects) ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (event) => {
      // Calculate mouse position in normalized device coordinates
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickableObjects, true);

      if (intersects.length > 0) {
        let rootObj = intersects[0].object;
        while (rootObj.parent && rootObj.parent !== meshesGroup) {
          rootObj = rootObj.parent;
        }

        if (rootObj.name.startsWith('tower-')) {
          const tLetter = rootObj.name.replace('tower-', '');
          if (onSelectTower) onSelectTower(tLetter);
        } else if (rootObj.name.startsWith('amenity-')) {
          const aName = rootObj.name === 'amenity-pool' ? 'Clubhouse Pool' : 'Clubhouse Gym';
          if (onSelectAmenity) onSelectAmenity(aName);
        }
      }
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);

    // --- CUSTOM ORBIT & VR MATH / CONTROLS ---

    const handleMouseDown = (e) => {
      stateRef.current.isDragging = true;
      stateRef.current.prevMouse.x = e.clientX;
      stateRef.current.prevMouse.y = e.clientY;
    };

    const handleMouseMove = (e) => {
      if (!stateRef.current.isDragging) return;
      const deltaX = e.clientX - stateRef.current.prevMouse.x;
      const deltaY = e.clientY - stateRef.current.prevMouse.y;
      stateRef.current.prevMouse.x = e.clientX;
      stateRef.current.prevMouse.y = e.clientY;

      if (stateRef.current.viewMode === 'dollhouse') {
        // Rotate dollhouse camera angles
        stateRef.current.cameraYaw -= deltaX * 0.005;
        stateRef.current.cameraPitch = Math.max(
          -Math.PI / 2.1,
          Math.min(-Math.PI / 12, stateRef.current.cameraPitch - deltaY * 0.005)
        );
      } else {
        // VR look horizontal/vertical rotation
        stateRef.current.vrYaw -= deltaX * 0.003;
        stateRef.current.vrPitch = Math.max(
          -Math.PI / 3,
          Math.min(Math.PI / 3, stateRef.current.vrPitch - deltaY * 0.003)
        );
      }
    };

    const handleMouseUp = () => {
      stateRef.current.isDragging = false;
    };

    const handleWheel = (e) => {
      if (stateRef.current.viewMode === 'dollhouse') {
        stateRef.current.radius = Math.max(8, Math.min(30, stateRef.current.radius + e.deltaY * 0.01));
      }
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('mouseleave', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: true });

    // --- ANIMATION / RENDER LOOP ---
    let animFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const st = stateRef.current;

      // 1. Dynamic Lighting (Day/Night Shadow Clock)
      // Map hours 8 -> 18 to angles/intensities
      const hourRatio = (st.time - 8) / 10; // 0 to 1
      const sunAngle = Math.PI * hourRatio;
      sunLight.position.set(
        Math.cos(sunAngle) * 15,
        Math.sin(sunAngle) * 15 + 2,
        Math.sin(sunAngle) * 5
      );

      // Night lighting transition (sunset after 16, night starts 17)
      if (st.time > 16 || st.time < 9) {
        sunLight.intensity = Math.max(0.05, 1.0 - (st.time - 16) * 0.4);
        ambientLight.color.setHex(0x1e1e38);
        ambientLight.intensity = 0.25;
        // Turn on/off window and lamp glows
        glowWindowMat.emissiveIntensity = 1.0;
        glowWindowMat.color.setHex(0xffe082);
        // Turn on points lights inside flat
        scene.traverse((node) => {
          if (node instanceof THREE.PointLight) {
            node.intensity = 2.0;
          }
        });
      } else {
        sunLight.intensity = 1.0;
        ambientLight.color.setHex(0xffffff);
        ambientLight.intensity = 0.45;
        glowWindowMat.emissiveIntensity = 0.1;
        glowWindowMat.color.setHex(0x334155);
        scene.traverse((node) => {
          if (node instanceof THREE.PointLight) {
            node.intensity = 0.2;
          }
        });
      }

      // Dynamic flooring & wall customization in Flat mode
      if (mode === 'interior') {
        scene.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            if (node.geometry instanceof THREE.PlaneGeometry && node.position.y === 0) {
              node.material = getFloorMaterial(st.style);
            }
            if (node.name && node.name.startsWith('wall-')) {
              node.material = getWallMaterial(st.style);
            }
          }
        });
      }

      // Dynamic tower selections highlighted in Gold
      if (mode === 'township') {
        scene.traverse((node) => {
          if (node instanceof THREE.Mesh && node.name && node.name.startsWith('tower-')) {
            const letter = node.name.replace('tower-', '');
            if (st.selectedTower === letter) {
              node.material.color.setHex(0xd4af37);
              node.material.emissiveIntensity = 0.3;
            } else {
              node.material.color.setHex(0x334155);
              node.material.emissiveIntensity = 0.05;
            }
          }
          // Highlight individual vacancy floors if highlightFloor matches
          if (node instanceof THREE.Mesh && node.name && node.name.startsWith('window-')) {
            const matches = node.name.match(/window-([A-C])-floor-(\d+)/);
            if (matches) {
              const [_, tL, flNum] = matches;
              if (st.highlightFloor && st.highlightFloor.includes(`Tower ${tL}`) && st.highlightFloor.includes(`Floor ${flNum}`)) {
                node.material.color.setHex(0x10b981); // Bright vacancy green
                node.material.emissive.setHex(0x10b981);
                node.material.emissiveIntensity = 2.0;
              } else {
                // Reset standard glow
                node.material.color.setHex(0xffe082);
                node.material.emissive.setHex(0xffb300);
                node.material.emissiveIntensity = st.time > 16 || st.time < 9 ? 1.0 : 0.1;
              }
            }
          }
        });

        // Animate clubhouse pool ripples subtly
        const pool = scene.getObjectByName('amenity-pool');
        if (pool) {
          pool.material.emissiveIntensity = 0.3 + Math.sin(clock.getElapsedTime() * 2) * 0.15;
        }
      }

      // 2. Camera Updates based on Navigation Mode
      if (st.viewMode === 'dollhouse') {
        // Calculate orbit position
        const radius = st.radius;
        const yaw = st.cameraYaw;
        const pitch = st.cameraPitch;

        camera.position.x = st.target.x + radius * Math.cos(pitch) * Math.sin(yaw);
        camera.position.y = st.target.y + radius * Math.sin(-pitch);
        camera.position.z = st.target.z + radius * Math.cos(pitch) * Math.cos(yaw);

        camera.lookAt(st.target);
      } else {
        // VR Mode walkthrough navigation
        const speed = 4.0; // Units per second
        const moveDist = speed * delta;
        const yaw = st.vrYaw;

        // WASD Movement vector relative to camera direction along horizontal plane
        const moveVec = new THREE.Vector3();
        if (st.keys.w) {
          moveVec.z -= moveDist * Math.cos(yaw);
          moveVec.x -= moveDist * Math.sin(yaw);
        }
        if (st.keys.s) {
          moveVec.z += moveDist * Math.cos(yaw);
          moveVec.x += moveDist * Math.sin(yaw);
        }
        if (st.keys.a) {
          moveVec.x -= moveDist * Math.cos(yaw);
          moveVec.z += moveDist * Math.sin(yaw);
        }
        if (st.keys.d) {
          moveVec.x += moveDist * Math.cos(yaw);
          moveVec.z -= moveDist * Math.sin(yaw);
        }

        st.vrPos.add(moveVec);
        // Collisions: Restrict bounds inside the apartment floor boundary (-5.5 to 5.5)
        st.vrPos.x = Math.max(-5.5, Math.min(5.5, st.vrPos.x));
        st.vrPos.z = Math.max(-5.5, Math.min(5.5, st.vrPos.z));
        st.vrPos.y = 1.6; // Keep head height constant

        camera.position.copy(st.vrPos);

        // Calculate direction vector camera looks at
        const pitch = st.vrPitch;
        const lookTarget = new THREE.Vector3(
          camera.position.x - Math.sin(yaw) * Math.cos(pitch),
          camera.position.y + Math.sin(pitch),
          camera.position.z - Math.cos(yaw) * Math.cos(pitch)
        );
        camera.lookAt(lookTarget);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize: update camera aspect and renderer to match container
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Also observe container size changes (tab switch / panel resize)
    let resizeObs;
    if (window.ResizeObserver) {
      resizeObs = new ResizeObserver(handleResize);
      resizeObs.observe(container);
    }

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      if (resizeObs) resizeObs.disconnect();
      renderer.domElement.removeEventListener('click', handleCanvasClick);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('mouseleave', handleMouseUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
      } catch (err) {
        // Catch any WebGL / Three.js error to prevent crashing the entire app
        console.error('[ThreeDViewer] WebGL initialization failed:', err);
        if (mountedRef.current) {
          setLoading(false);
          setError(err?.message || 'WebGL initialization failed');
        }
        return () => {};
      }
    }; // end initScene

    // Use ResizeObserver to call initScene once the container has real dimensions.
    // This prevents the black screen caused by initializing Three.js before layout paints.
    let cleanupFn = null;
    let initObs;

    if (container.clientWidth > 0 && container.clientHeight > 0) {
      // Container already has dimensions, init immediately
      cleanupFn = initScene();
    } else {
      // Wait for first real layout paint
      if (window.ResizeObserver) {
        initObs = new ResizeObserver(() => {
          if (container.clientWidth > 0 && container.clientHeight > 0) {
            if (initObs) initObs.disconnect();
            cleanupFn = initScene();
          }
        });
        initObs.observe(container);
      } else {
        // Fallback: small delay for layout
        const t = setTimeout(() => { cleanupFn = initScene(); }, 150);
        return () => { clearTimeout(t); mountedRef.current = false; };
      }
    }

    return () => {
      mountedRef.current = false;
      if (initObs) initObs.disconnect();
      if (cleanupFn) cleanupFn();
    };
  }, [mode]);

  // Orbit control shortcuts helper
  const adjustOrbit = (action) => {
    const st = stateRef.current;
    if (action === 'zoomIn') st.radius = Math.max(8, st.radius - 2);
    if (action === 'zoomOut') st.radius = Math.min(30, st.radius + 2);
    if (action === 'rotateLeft') st.cameraYaw -= Math.PI / 6;
    if (action === 'rotateRight') st.cameraYaw += Math.PI / 6;
    if (action === 'reset') {
      st.radius = 18;
      st.cameraYaw = -Math.PI / 4;
      st.cameraPitch = -Math.PI / 6;
      st.vrPos.set(0, 1.6, 5);
      st.vrYaw = 0;
      st.vrPitch = 0;
    }
  };

  return (
    <div className="three-d-viewer-root relative overflow-hidden" style={{ width: '100%', height: '100%', minHeight: '420px', background: '#0a0f1d' }}>
      {/* 3D Render Port — must have explicit height so Three.js gets real dimensions */}
      <div ref={mountRef} style={{ width: '100%', height: '100%', minHeight: '420px', display: 'block' }} className="cursor-grab active:cursor-grabbing" />

      {/* Error Fallback — shown if WebGL fails */}
      {error && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: '#0a0f1d',
          color: '#94A3B8', gap: '16px', padding: '32px', textAlign: 'center', zIndex: 30
        }}>
          <div style={{ fontSize: '48px' }}>🏗️</div>
          <div style={{ color: '#D4AF37', fontSize: '18px', fontWeight: 700 }}>3D Engine Unavailable</div>
          <div style={{ fontSize: '13px', maxWidth: '320px', lineHeight: 1.6 }}>
            Your browser or device does not support WebGL 3D rendering. 
            Please try Chrome or Edge for the full 3D experience.
          </div>
          <div style={{ fontSize: '11px', color: '#475569', marginTop: '8px' }}>
            Technical detail: {error}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && !error && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: 'rgba(10,15,29,0.85)', zIndex: 20
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', border: '3px solid #D4AF37',
              borderTopColor: 'transparent', borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ color: '#D4AF37', fontSize: '13px', fontWeight: 600 }}>Initializing 3D Engine...</span>
          </div>
        </div>
      )}

      {/* Control HUD Panel */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none z-10">
        
        {/* Left side: View Mode Toggle */}
        <div className="flex gap-2 pointer-events-auto">
          <button
            className={`btn btn-small btn-hud ${viewMode === 'dollhouse' ? 'btn-hud-active' : 'btn-hud-outline'}`}
            onClick={() => setViewMode('dollhouse')}
          >
            <Compass size={14} /> Dollhouse View
          </button>
          {mode === 'interior' && (
            <button
              className={`btn btn-small btn-hud ${viewMode === 'vr' ? 'btn-hud-active' : 'btn-hud-outline'}`}
              onClick={() => setViewMode('vr')}
            >
              <Eye size={14} /> First Person VR
            </button>
          )}
        </div>

        {/* Right side: Camera adjustment gizmos */}
        <div className="flex gap-1 pointer-events-auto">
          {viewMode === 'dollhouse' ? (
            <>
              <button className="gizmo-btn-square" onClick={() => adjustOrbit('zoomIn')} title="Zoom In"><ZoomIn size={14} /></button>
              <button className="gizmo-btn-square" onClick={() => adjustOrbit('zoomOut')} title="Zoom Out"><ZoomOut size={14} /></button>
              <button className="gizmo-btn-square" onClick={() => adjustOrbit('rotateLeft')} title="Rotate Left"><RotateCw size={14} className="scale-x-[-1]" /></button>
              <button className="gizmo-btn-square" onClick={() => adjustOrbit('rotateRight')} title="Rotate Right"><RotateCw size={14} /></button>
            </>
          ) : (
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/50 backdrop-blur-md px-3 py-1.5 rounded-lg text-slate-300 font-medium text-xs">
              <Move size={12} className="text-amber-400" />
              <span>Use <b>W A S D</b> or <b>Arrows</b> to walk inside the rooms. Drag mouse to look around.</span>
            </div>
          )}
          <button className="gizmo-btn-square bg-slate-800 text-slate-400 hover:text-amber-400" onClick={() => adjustOrbit('reset')} title="Reset Camera">Reset</button>
        </div>

      </div>
    </div>
  );
}
