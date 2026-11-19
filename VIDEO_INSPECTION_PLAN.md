# Inspovideo (ID Finance) Landing Page Plan & Implementation Spec

## 1. Deep Video Inspection Breakdown

We inspected `inspo_2(1).mp4` frame by frame (at 60fps across the 15.7s timeline). Here are the exact elements, layout, styling, and motion mechanics:

### 1. Overall Theme & Palette (Light Neo-Clean Luxury)
- **Background**: Soft outer warm-gray frame (`#E5E5E7` / `#DEDFE1`), containing an inner pristine white/ultra-light rounded stage (`#FFFFFF` with `rounded-[32px] sm:rounded-[40px]`, subtle soft drop shadow).
- **Dark Mode**: Explicitly removed. The application defaults and locks to this radiant, clean, tactile light theme.
- **Accents**: 
  - Vibrant Cobalt/Electric Royal Blue (`#2563EB` / `#1D4ED8`) for primary action buttons, inline badges, and focus widgets.
  - Coral / Peach / Terracotta (`#F97316` / `#FB923C` / `#EA580C`) warm organic 3D clay accents.
  - Frosted White & Soft Sky Blue 3D sculptural objects (`#FFFFFF`, `#93C5FD`, `#DBEAFE`).
- **Typography**: Clean, geometric modern sans-serif with tight tracking (`tracking-tight`), crisp font hierarchy, high-contrast dark titles (`#0F172A`).

---

## 2. Section-by-Section Anatomy from Video

#### Section A: Floating Island Pill Navigation Bar (Frames 01-02)
- **Structure**: Floating island pill with divided pill capsule sections (`rounded-full bg-white/90 backdrop-blur shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-slate-100/80`).
- **Left**: Minimalist brand logo (interlinked ring or stylish icon) + brand name.
- **Center**: Segmented pill links (`Features`, `How it Works`, `Testimonials`, `Pricing`).
- **Right**: Secondary link (`Sign In`) + blue pill CTA (`Get Started` / `Explore more` with subtle arrow).

#### Section B: Hero Section with Organic 3D Shapes & Parallax Motion (Frames 01-02)
- **Centerpiece**:
  - Grand Headline: 
    > **Empowering Your Career**  
    > **Through Precision AI**  
  - Subtitle: Clean 2-line explanation.
  - Pill Input + Button Combo: An elegant unified search/input bar (`Enter your email or target job role...` + vibrant blue `Tailor Now` pill button).
- **Flanking 3D Sculpture Elements**:
  - **Left & Right**: Multi-layered organic 3D clay jacks / asterisks (Coral/Terracotta, Soft Pearl White, Powder Blue, frosted translucent accents with depth-of-field blur).
  - **Interactive Motion**: Mouse-driven 3D parallax tilt + continuous gentle levitation (`translateY` oscillation) so they feel alive and floating.
- **Partner / Trust Logo Ticker**:
  - Horizontal ticker with monochrome / light gray badges (Google, Amazon, Stripe, Microsoft, LinkedIn, Bloomberg, etc.).

#### Section C: Typographic Statement with Inline Dynamic Badges (Frames 03-04)
- **Headline**: High-impact editorial headline with inline custom pill widgets:
  > **Over `[ 40,000+ ]` resumes tailored to bypass ATS filters and land high-paying roles**
- **Inline Badges**:
  - `[ 40,000+ ]`: Vibrant electric blue rounded pill badge with white bold text.
  - `[ Leaf / Sparkle icon ]`: Round glowing circular badge.
  - `[ Mini User Photo / Thumbnail ]`: Rounded mini-photo preview pill.
- **Background Flanking Widgets**: Softly tilted glass cards (`Fast 📈`, `Code verified`, `ATS Score 96%`) emerging on scroll.

#### Section D: Bento Grid Feature Showcase with Tactile Micro-Interactions (Frames 05-10)
A 3-column / asymmetric bento grid with elevated white cards (`rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-100`):
1. **Card 1: Human-Centric AI Optimization**:
   - Title & description.
   - Interactive floating card with mini bar chart (`+16%`, `+25%`, match growth), floating 3D jacks, and blue action button `[ Tailor Experience ]`.
2. **Card 2: Responsibility & Privacy (Zero-Retention Security)**:
   - Floating 3D dual-pill toggle (Orange/Peach icons connected with an interactive toggle switch).
3. **Card 3: 4-Digit Match / Verification Interactive Widget**:
   - Large tactile digit display (`7 9 5 2` or `9 8 %` ATS Match Score) with status pill `Code verified. Your ATS score is confirmed.` and interactive `Verify` action.
4. **Card 4: Fast Mode vs Deep Mode Settings Pill**:
   - Floating settings card with pill tags: `Fast ⚡`, `Deep Scan 🛡️`, and radio toggles (`Prioritize speed`, `Prioritize keyword density`).
5. **Card 5: 3D Royal Blue Sculpture Feature**:
   - A bold 3D curved cross/jack sculpture anchoring the corner with high visual fidelity.

#### Section E: Key Metrics & Animated Stats (Frames 11-12)
- Headline with inline icons:
  > **Highlighting `[ 📊 ]` our Key Metrics & Career Impact**
- Circular progress gauges (e.g. `98%` interview callback increase, `3.8x` faster job placement).

#### Section F: Stepped Article / Case Study Accordion Rows (Frames 13-16)
- Clean numbered rows (`01`, `02`, `03`):
  - Number on the left.
  - High-res rounded thumbnail image (`rounded-2xl`).
  - Title and publication date (`How our users secured $180k+ offers at top tech firms`, `08 July 2024`).
  - Right circular arrow button (`rounded-full bg-slate-50 border border-slate-100 hover:bg-blue-600 hover:text-white transition-all`).

---

## 3. Motion & Animation Specs (Framer Motion + Spring Physics)
- **Mouse Parallax Motion**: Framer Motion `useMotionValue` and `useSpring` tracking cursor position `(mouseX, mouseY)` to create smooth floating 2.5D tilt on the organic shapes.
- **Hover Micro-Interactions**: Bento cards subtly scale (`scale: 1.015`) with deepening soft ambient shadows.
- **Staggered Entry**: Sections reveal with `whileInView={{ opacity: 1, y: 0 }}` and smooth spring easing `[0.21, 0.47, 0.32, 0.98]`.
- **Badge Pulsing & Ticker**: Logo ticker auto-scrolls infinitely with smooth CSS marquee.
