'use client'

/**
 * Equirectangular 360° view: camera inside a textured sphere.
 * Left drag: yaw / pitch. Shift + drag or right button: roll.
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface Video360CanvasProps {
  video: HTMLVideoElement;
  active: boolean;
  lookSensitivity?: number;
  rollSensitivity?: number;
  /** Patrol-style auto-rotation while not dragging */
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}

export const Video360Canvas: React.FC<Video360CanvasProps> = ({
  video,
  active,
  lookSensitivity = 0.0025,
  rollSensitivity = 0.004,
  autoRotate = false,
  autoRotateSpeed = 0.35,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const rollRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 2000);
    camera.position.set(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const geometry = new THREE.SphereGeometry(500, 64, 32);
    geometry.scale(-1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const updateCamera = () => {
      const euler = new THREE.Euler(pitchRef.current, yawRef.current, rollRef.current, 'YXZ');
      camera.quaternion.setFromEuler(euler);
    };
    updateCamera();

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w <= 0 || h <= 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    resize();
    container.appendChild(renderer.domElement);

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let rollMode = false;

    let raf = 0;
    let lastFrame = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((now - lastFrame) / 1000, 0.1);
      lastFrame = now;
      if (autoRotate && !dragging) {
        yawRef.current += autoRotateSpeed * dt;
        updateCamera();
      }
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        texture.needsUpdate = true;
      }
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(loop);

    const el = renderer.domElement;

    const onDown = (ev: PointerEvent) => {
      dragging = true;
      rollMode = ev.shiftKey || ev.button === 2;
      lastX = ev.clientX;
      lastY = ev.clientY;
      el.setPointerCapture(ev.pointerId);
    };

    const onUp = (ev: PointerEvent) => {
      dragging = false;
      try {
        el.releasePointerCapture(ev.pointerId);
      } catch {
        /* not captured */
      }
    };

    const onMove = (ev: PointerEvent) => {
      if (!dragging) return;
      const dx = ev.clientX - lastX;
      const dy = ev.clientY - lastY;
      lastX = ev.clientX;
      lastY = ev.clientY;
      if (rollMode) {
        rollRef.current += dx * rollSensitivity;
      } else {
        yawRef.current -= dx * lookSensitivity;
        pitchRef.current -= dy * lookSensitivity;
        const lim = Math.PI / 2 - 0.05;
        pitchRef.current = Math.max(-lim, Math.min(lim, pitchRef.current));
      }
      updateCamera();
    };

    const onCtx = (e: Event) => e.preventDefault();

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('contextmenu', onCtx);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('contextmenu', onCtx);
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
      if (el.parentNode === container) {
        container.removeChild(el);
      }
    };
  }, [video, active, lookSensitivity, rollSensitivity, autoRotate, autoRotateSpeed]);

  if (!active) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        cursor: 'grab',
      }}
    />
  );
};
