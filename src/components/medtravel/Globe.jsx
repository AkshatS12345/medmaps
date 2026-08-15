import React, { useEffect, useRef } from "react";
import * as THREE from "three";

// Lightweight interactive 3D globe: dotted sphere + faint wireframe + glow,
// slowly rotating on its Y axis. Dark scene, teal/blue palette.
export default function Globe() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let width = mount.clientWidth;
    let height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    group.rotation.x = 0.35;
    scene.add(group);

    // Solid dark core so the dots read against the back
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.985, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0x0b1324, transparent: true, opacity: 0.92 })
    );
    group.add(core);

    // Faint wireframe (latitude/longitude feel)
    const wire = new THREE.Mesh(
      new THREE.SphereGeometry(1, 40, 28),
      new THREE.MeshBasicMaterial({
        color: 0x0ea5e9,
        wireframe: true,
        transparent: true,
        opacity: 0.22,
      })
    );
    group.add(wire);

    // Dotted globe via fibonacci sphere distribution
    const dotCount = 1300;
    const positions = new Float32Array(dotCount * 3);
    const colors = new Float32Array(dotCount * 3);
    const teal = new THREE.Color(0x2dd4bf);
    const blue = new THREE.Color(0x38bdf8);
    for (let i = 0; i < dotCount; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / dotCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 1.012;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      const col = teal.clone().lerp(blue, Math.random());
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    const dotsGeo = new THREE.BufferGeometry();
    dotsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    dotsGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const dotsMat = new THREE.PointsMaterial({
      size: 0.022,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });
    group.add(new THREE.Points(dotsGeo, dotsMat));

    // Atmosphere glow
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 48, 48),
      new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.12,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
      })
    );
    scene.add(glow);

    let frameId;
    const animate = () => {
      group.rotation.y += 0.0016;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      width = mount.clientWidth;
      height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      core.geometry.dispose();
      wire.geometry.dispose();
      dotsGeo.dispose();
      dotsMat.dispose();
      glow.geometry.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full" />;
}