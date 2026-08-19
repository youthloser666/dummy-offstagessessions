# ⚡ Laporan Analisa Performa Mobile (FPS & Stutter Audit)
**Project:** Offstage Sessions (Next.js + React Three Fiber)  
**Target Platform:** Mobile Devices (iOS Safari / WebKit & Android Chrome)  
**Tanggal Analisa:** 19 Agustus 2026  

---

## 📋 Ringkasan Eksekutif (Executive Summary)

Penyebab utama terjadinya lag, stutter parah, dan drop FPS (bahkan hingga < 15 FPS) di perangkat mobile—khususnya iPhone (iOS WebKit)—adalah **kombinasi "Compositor Overload" dan "Multi-Pass FBO WebGL Loop"**. 

Beban performa terberat **bukan semata-mata dari polycount 3D model**, melainkan penumpukan layer rendering dinamis:
1. **Procedural SVG `<feTurbulence>` Grain Animation** di `z-index: 9999` yang memaksa Safari mere-rasterize seluruh layar setiap frame.
2. **Eulerian Fluid Simulation (Post-processing)** di dalam `<Canvas>` yang mengeksekusi 8–12+ render target pass per frame, memicu thermal throttling pada GPU mobile berbasis TBDR.
3. **Live CSS Filter** pada video latar belakang yang berjalan bersamaan dengan WebGL canvas transparan (`alpha: true`).
4. **Alokasi Objek di dalam Render Loop** (`new THREE.Vector3`) yang memicu Garbage Collection (GC) freeze.
5. **Infinite `requestAnimationFrame` Loops** pada kartu interaktif (`TiltCard`) yang membebani Main Thread.

---

## 🔍 Temuan Masalah Mendalam (Root Cause Analysis)

---

### 1. 🎮 React Three Fiber (R3F) & WebGL Bottlenecks

#### A. Fluid Simulation Multi-Pass FBO (Tingkat Keparahan: 🔴 KRITIS)
* **File Terkait:** `components/Logo3D.tsx` (Baris 258–274) & `components/react-fluid-distortion/Fluid.tsx` (Baris 103–167)
* **Analisa Masalah:**
  Komponen `<Fluid />` di dalam `<EffectComposer>` menjalankan simulasi fluida real-time:
  * Menjalankan shader pass: `curl` ➔ `vorticity` ➔ `divergence` ➔ `clear` ➔ loop `pressure` (3x) ➔ `gradientSubstract` ➔ `advection` velocity ➔ `advection` density.
  * Setiap pass mengubah `gl.setRenderTarget` (ping-pong FBO buffer).
* **Dampak Mobile:**
  GPU Apple A-Series / Android Adreno menggunakan arsitektur **Tile-Based Deferred Rendering (TBDR)**. Pergantian RenderTarget berkali-kali per frame memaksa GPU melakukan flush On-Chip Tile Memory ke VRAM secara berulang, merusak efisiensi TBDR dan melipatgandakan konsumsi daya/panas (GPU Throttling).

#### B. Pemuatan HDRI Environment Map 2K Format `.exr` (Tingkat Keparahan: 🔴 TINGGI)
* **File Terkait:** `components/Logo3D.tsx` (Baris 228)
* **Analisa Masalah:**
  ```tsx
  <Environment files="/3D/car-showroom-studio-hdri_2K_e8b02ed8-7d1d-4cf9-ad57-1f6d96eeff48.exr" />
  ```
  File `.exr` berukuran **2.4 MB** dengan presisi 32-bit floating point.
* **Dampak Mobile:**
  iOS Safari membutuhkan alokasi memori VRAM puluhan megabyte hanya untuk menguraikan dan mengonversi file EXR menjadi PMREM (*Pre-filtered Mipmapped Radiance Environment Map*) cubemap. Ini memicu *Memory Pressure Warning* di Safari dan berpotensi menyebabkan crash atau drop frame awal.

#### C. Resolusi DPR `[1, 2]` + `alpha: true` di Layar Retina (Tingkat Keparahan: 🟡 TINGGI)
* **File Terkait:** `components/Logo3D.tsx` (Baris 218–220)
* **Analisa Masalah:**
  Di layar iPhone dengan resolusi native Retina 3x, setting `dpr={[1, 2]}` memaksa canvas dirender pada skala 2x (misal ~786×1704 px). Ditambah `alpha: true`, browser harus melakukan alpha blending antara framebuffer WebGL beresolusi tinggi dengan elemen DOM video di belakangnya di setiap frame.

#### D. Garbage Collection (GC) Thrashing pada Animasi (Tingkat Keparahan: 🟡 SEDANG)
* **File Terkait:** `components/Logo3D.tsx` (Baris 165)
* **Analisa Masalah:**
  ```tsx
  innerRef.current.scale.lerp(new THREE.Vector3(scaleX, scaleY, scaleZ), delta * 8);
  ```
  Membuat instance baru `new THREE.Vector3(...)` di setiap frame (60–120 kali/detik) menghasilkan ribuan objek yang harus dibersihkan oleh JavaScript Engine.
* **Dampak Mobile:**
  Memicu *Garbage Collection pause* yang terlihat sebagai **micro-freeze / patah-patah periodik** setiap 2–3 detik.

#### E. Gesture Scroll Terkunci oleh `PresentationControls global` (Tingkat Keparahan: 🟡 SEDANG)
* **File Terkait:** `components/Logo3D.tsx` (Baris 236–242)
* **Analisa Masalah:**
  Prop `global` memasang listener drag ke seluruh window. Di layar sentuh mobile, usapan jari untuk scrolling ke bawah malah memicu rotasi 3D dan menghambat scroll native halaman.

---

### 2. 🎨 CSS & DOM Compositor Overload (WebKit Kryptonite)

#### A. Animasi SVG Procedural Noise pada `z-index: 9999` (Tingkat Keparahan: 🔴 KRITIS)
* **File Terkait:** `app/globals.css` (Baris 64–91)
* **Analisa Masalah:**
  ```css
  body::before {
    position: fixed;
    top: -50%; left: -50%; width: 200%; height: 200%;
    background-image: url("data:image/svg+xml,...<feTurbulence baseFrequency='0.85' numOctaves='3'/>...");
    opacity: 0.04;
    z-index: 9999;
    animation: filmGrainShift 7s steps(10) infinite;
    will-change: transform;
  }
  ```
* **Dampak Mobile:**
  Ini adalah penyebab nomor satu browser Safari iOS mengalami crash FPS. Filter SVG `<feTurbulence>` dengan 3 octaves pada elemen berukuran 200% yang dianimasikan posisinya di atas Canvas WebGL & Video memaksa WebKit **me-rasterize ulang filter CPU/GPU secara terus-menerus**.

#### B. CSS Filter Dinamis pada Tag `<video>` (Tingkat Keparahan: 🟡 TINGGI)
* **File Terkait:** `app/page.module.css` (Baris 25) & `app/page.tsx` (Baris 104)
* **Analisa Masalah:**
  ```css
  .heroVideo {
    filter: grayscale(1) brightness(0.28);
  }
  ```
* **Dampak Mobile:**
  Menerapkan filter CSS pada video hardware-decoded membuat GPU mobile harus menjalankan kalkulasi fragment shader ekstra pada setiap video frame yang dimainkan sebelum di-composite dengan WebGL canvas di atasnya.

---

### 3. ⚙️ Main Thread & Animation Loops

#### A. Infinite `requestAnimationFrame` pada `TiltCard` (Tingkat Keparahan: 🟡 SEDANG)
* **File Terkait:** `components/TiltCard.tsx` (Baris 67–91)
* **Analisa Masalah:**
  Setiap komponen `TiltCard` (ada 6 kartu pada homepage) mengeksekusi loop `requestAnimationFrame` tanpa henti, bahkan saat kartu dalam posisi idle (tidak di-hover):
  ```tsx
  card.style.transform = `perspective(1000px) rotateX(...) ...`;
  ```
* **Dampak:**
  Memaksa browser melakukan *style recalculation* untuk 6 elemen DOM terus-menerus di main thread, bersaing dengan rendering loop 3D.

---

## 🛠️ Rencana Aksi & Rekomendasi Solusi (Prioritas & Quick Wins)

| Prioritas | Komponen / Area | Solusi Konkret | Estimasi Penghematan FPS |
| :--- | :--- | :--- | :--- |
| **P0 (Kritis)** | **CSS Grain Noise Overlay** | Nonaktifkan animasi `filmGrainShift` dan ganti filter SVG dengan pola WebP/PNG noise statis tile (128x128px), atau matikan total pada layar mobile: `@media (max-width: 768px) { body::before { display: none; } }` | **+20–30 FPS** di iOS Safari |
| **P0 (Kritis)** | **Fluid Distortion Postprocessing** | **Matikan `<EffectComposer><Fluid /></EffectComposer>` di perangkat mobile** (gunakan deteksi `isMobile` / touch device). Fluida distorsi kursor tidak ada gunanya di layar sentuh dan memakan 60%+ waktu render GPU. | **+20–25 FPS** di GPU mobile |
| **P1 (Tinggi)** | **DPR & Canvas WebGL** | Kunci `dpr={1}` (atau `[1, 1.2]`) khusus mobile. Tambahkan `frameloop="demand"` jika scene sedang tidak bergerak atau optimalkan `gl={{ powerPreference: 'high-performance', antialias: false }}` di mobile. | **+10–15 FPS**, suhu baterai lebih dingin |
| **P1 (Tinggi)** | **HDRI Environment** | Ganti file `.exr` 2K (2.4 MB) dengan HDR preset bawaan Drei (`<Environment preset="city" />`) atau kompresi ke file `.hdr` / `.webp` ukuran 512px–1K. | Mengurangi VRAM hingga **> 50 MB**, loading lebih cepat |
| **P1 (Tinggi)** | **Video Background Filter** | Edit/bake video `hero-video.mp4` menjadi grayscale & gelap secara permanen dari file aslinya, lalu hapus properti `filter: grayscale(1) brightness(0.28);` dari CSS. | Meringankan beban compositor WebKit |
| **P2 (Sedang)** | **Optimasi Alokasi Objek 3D** | Di `components/Logo3D.tsx`, pindahkan alokasi vector ke luar hook loop: <br>`const targetVec = useMemo(() => new THREE.Vector3(), []);`<br>lalu di `useFrame`: `targetVec.set(scaleX, scaleY, scaleZ); innerRef.current.scale.lerp(targetVec, delta * 8);` | Menghilangkan **micro-stutter GC** |
| **P2 (Sedang)** | **PresentationControls** | Ubah `global={false}` atau nonaktifkan `PresentationControls` pada mobile agar scroll swipe vertikal di atas logo tidak tersendat. | Scroll halaman menjadi mulus |
| **P2 (Sedang)** | **TiltCard Animation Loop** | Hanya jalankan loop `requestAnimationFrame` saat `isHovered === true` dan hentikan loop saat elemen kembali ke posisi netral `[0, 0]`. | Menghemat CPU Main Thread |

---

## 📝 Rekomendasi Urutan Pengerjaan (Step-by-Step Implementation)

1. **Step 1:** Nonaktifkan animasi film grain SVG di `globals.css` untuk mobile.
2. **Step 2:** Bungkus `<EffectComposer><Fluid ... /></EffectComposer>` dengan kondisi `!isMobile` di `Logo3D.tsx`.
3. **Step 3:** Set `dpr={isMobile ? 1 : [1, 1.5]}` pada `<Canvas>` di `Logo3D.tsx`.
4. **Step 4:** Perbaiki instansiasi `Vector3` di dalam `useFrame` `Logo3D.tsx`.
5. **Step 5:** Perbaiki rAF loop pada `TiltCard.tsx`.
6. **Step 6:** Re-encode file `hero-video.mp4` dan hapus filter CSS.

---
*Dokumen ini dibuat otomatis sebagai bahan acuan optimasi performa.*
