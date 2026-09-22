/* =========================================================
   NEXUS — THREE.JS AMBIENT 3D BACKGROUND ENGINE
   Atmospheric abstract wireframe/glass geometry cluster.
   ========================================================= */

(function () {
  let bg3d = null;

  function initBg3D() {
    if (bg3d) return;

    const canvas = document.getElementById('bg-canvas');
    if (!canvas || !window.THREE) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      48,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 7.5);

    scene.add(new THREE.AmbientLight(0x4a6b52, 0.7));

    const key = new THREE.DirectionalLight(0x9fe8b8, 0.8);
    key.position.set(3, 4, 5);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x2fa766, 0.6);
    rim.position.set(-4, -2, -3);
    scene.add(rim);

    const wireMat1 = new THREE.MeshBasicMaterial({
      color: 0x2FA766,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });

    const wireMat2 = new THREE.MeshBasicMaterial({
      color: 0x8FE3A6,
      wireframe: true,
      transparent: true,
      opacity: 0.22
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x1D7A4C,
      transparent: true,
      opacity: 0.14,
      roughness: 0.15,
      metalness: 0.1
    });

    const group = new THREE.Group();
    scene.add(group);

    const shapes = [];

    function addShape(geo, mat, x, y, z, scale, spin) {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.scale.setScalar(scale);
      group.add(m);
      shapes.push({ mesh: m, spin });
    }

    addShape(
      new THREE.IcosahedronGeometry(1.5, 0),
      wireMat1,
      3.1, 1.4, -2, 1,
      { x: 0.05, y: 0.07, z: 0.02 }
    );

    addShape(
      new THREE.TorusKnotGeometry(0.6, 0.16, 120, 16),
      wireMat2,
      -3.4, -1.6, -1.5, 1,
      { x: 0.03, y: -0.06, z: 0.04 }
    );

    addShape(
      new THREE.OctahedronGeometry(0.9, 0),
      glassMat,
      -2.6, 1.8, -3, 1,
      { x: -0.04, y: 0.05, z: 0.03 }
    );

    addShape(
      new THREE.IcosahedronGeometry(0.55, 1),
      wireMat2,
      2.4, -2.1, -1, 1,
      { x: 0.06, y: -0.04, z: -0.05 }
    );

    addShape(
      new THREE.TorusGeometry(0.5, 0.12, 10, 40),
      wireMat1,
      0.2, 2.4, -3.5, 1,
      { x: 0.02, y: 0.05, z: 0.03 }
    );

    let scrollY = 0;
    let ptrX = 0;
    let ptrY = 0;
    let curX = 0;
    let curY = 0;
    let idle = 0;

    const clock = new THREE.Clock();

    function onScroll() {
      scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    }

    window.addEventListener(
      'scroll',
      () => requestAnimationFrame(onScroll),
      { passive: true, capture: true }
    );

    document.addEventListener(
      'scroll',
      () => requestAnimationFrame(onScroll),
      { passive: true, capture: true }
    );

    window.addEventListener('mousemove', e => {
      ptrX = (e.clientX / window.innerWidth - 0.5) * 2;
      ptrY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    function animate() {
      requestAnimationFrame(animate);

      const dt = Math.min(clock.getDelta(), 0.05);
      idle += dt;
      curX += (ptrX - curX) * 0.03;
      curY += (ptrY - curY) * 0.03;

      const scrollNorm = Math.min(1.5, scrollY * 0.0016);

      group.rotation.y = 0.15 + curX * 0.12 + scrollNorm * 0.5;
      group.rotation.x = -0.06 + curY * 0.08 + scrollNorm * 0.15;
      group.position.y = -scrollNorm * 0.6;

      shapes.forEach(s => {
        s.mesh.rotation.x += s.spin.x * dt;
        s.mesh.rotation.y += s.spin.y * dt;
        s.mesh.rotation.z += s.spin.z * dt;
      });

      renderer.render(scene, camera);
    }

    requestAnimationFrame(animate);
    bg3d = { renderer, scene, camera };
  }

  window.initBg3D = initBg3D;

  function bootstrap() {
    try {
      if (window.THREE && document.getElementById('bg-canvas')) {
        initBg3D();
      }
    } catch (err) {
      console.warn('NEXUS 3D background skipped:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
