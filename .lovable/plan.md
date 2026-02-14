

# 🌌 Cinematic Romantic Web Experience — Phased Build Plan

## Overview
A handcrafted, immersive cinematic web experience — dark, elegant, and emotionally paced. Built with React, Three.js (via R3F), GSAP, Framer Motion, and Howler.js. Designed as a personal gift with swappable content.

---

## Phase 1: Foundation + Cinematic Intro + Starfield
**The core 3D scene and entry experience**

- **Project setup**: Install `@react-three/fiber@^8.18`, `three`, `@react-three/drei@^9.122.0`, `@react-three/postprocessing`, `gsap`, `framer-motion`, `howler`
- **Modular folder structure**: `/components`, `/scenes`, `/hooks`, `/utils`, `/assets`, `/config` (personal content config file)
- **Dark elegant theme**: Near-black background (#0f172a), pastel accent palette
- **Cinematic intro screen**: Fullscreen black → fade-in text "This space exists for one person. You." → minimal "Enter" button → smooth crossfade into 3D canvas
- **Ambient audio**: Howler.js instance with placeholder silent/ambient audio, play on enter
- **Living particle starfield**: BufferGeometry + Points, adaptive particle count, subtle parallax, Bloom postprocessing
- **Custom shader light trail**: GLSL shader following mouse/touch position via Raycaster pointer tracking
- **Responsive**: Works on desktop and mobile with device-aware performance scaling

---

## Phase 2: Constellation → Heart Morph
**The signature interactive moment**

- **Initial state**: Stars scattered randomly in 3D space
- **"See Us" button**: Triggers GSAP timeline that morphs particles into a heart shape
- **Smooth camera dolly**: Camera zooms/orbits during morph animation
- **Performance**: Pre-computed target positions, no geometry recreation — only attribute updates
- **Post-morph glow pulse**: Subtle pulsing bloom effect on the heart shape
- **Touch-friendly**: Works with tap on mobile

---

## Phase 3: Floating Glass Memories
**Interactive 3D photo gallery**

- **3D plane meshes** with image textures (elegant placeholder images for now)
- **Glassmorphism material**: Transparency + roughness + subtle refraction
- **Hover/touch tilt**: Pointer events for interactive tilt effect
- **Click to zoom**: Smooth camera animation to focus on selected memory
- **DepthOfField**: Background blur when viewing a memory
- **Caption overlay**: Clean text overlay on each memory card
- **Content config**: Photos and captions defined in an easy-to-edit config file

---

## Phase 4: Love Letter + Time Capsule + Easter Egg
**Emotional content sections**

- **Love Letter**: Glassmorphism panel with typewriter text animation, personal message from config file, clean serif typography
- **Time Capsule**: Displays days together (from a configurable start date), mock message count, "Still loading forever..." — minimal elegant UI with counter animations
- **Easter Egg**: Clicking a specific name 3 times reveals a hidden modal with a secret message, smooth animated reveal with Framer Motion

---

## Phase 5: Voice Message + Ending Scene
**The emotional finale**

- **Voice message**: Hidden play button that reveals on interaction, Howler.js audio playback, mobile-compatible (handles autoplay restrictions)
- **Ending scene**: Soft particle petals falling (custom particle system), camera slowly pulls back, fade to black, centered text "I'm choosing you. Every day." with signature line, final ambient audio fade out
- **Smooth transitions**: All sections flow cinematically with scroll or navigation triggers

---

## Content Configuration
All personal content (texts, photos, dates, names, audio files) will live in a single `/config/content.ts` file for easy editing without touching component code.

---

## Performance & Quality
- Memoized geometries and materials throughout
- Device-aware particle counts (fewer on mobile)
- Lazy-loaded assets and textures
- Proper GSAP timeline cleanup on unmount
- Responsive typography and spacing at all breakpoints
- No emojis, no cheesy visuals — premium cinematic aesthetic throughout

