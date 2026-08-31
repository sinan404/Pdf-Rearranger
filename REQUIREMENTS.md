# Software Requirements Specification (SRS)
## PDF Rearranger & Micro-Sizer (`microbit`)

---

## 1. Project Overview

### 1.1 Purpose
The **PDF Rearranger & Micro-Sizer** is a client-side React/Vite web application engineered to transform standard multi-page PDF documents into compact, multi-page grid sheets (3×3 / 9-up layout) optimized for double-sided (duplex) printing and micro-booklet assembly.

### 1.2 Core Capabilities
1. **Odd/Even Stream Reordering**: Reorganizes PDF pages using a custom 9-page duplex interleaving algorithm so that front and back sheets align perfectly when printed double-sided.
2. **Micro-Sizing (3×3 N-Up Compression)**: Scales and arranges 9 document pages onto a single standard A4 sheet (3 columns × 3 rows).
3. **Dual Processing**: Seamlessly executes both page reordering and 3×3 grid rendering in a single pipeline.
4. **Client-Side Privacy**: Performs all parsing, rendering, transformation, and compilation directly in the user's browser using Web Workers and Canvas APIs.

---

## 2. System & Runtime Requirements

### 2.1 Hardware Requirements
| Component | Minimum Specification | Recommended Specification |
| :--- | :--- | :--- |
| **Processor** | Dual-core 1.5 GHz or higher | Quad-core 2.0 GHz+ (multi-threaded PDF rendering) |
| **RAM** | 4 GB | 8 GB+ (for processing large/high-page-count PDFs) |
| **Display** | 1280 × 720 resolution | 1920 × 1080 (Full HD) or higher |

### 2.2 Software & Environment Prerequisites
- **Runtime**: [Node.js](https://nodejs.org/) `v18.0.0` or higher (Recommended: `v20.x` LTS or `v22.x`)
- **Package Manager**: `npm` `v9.0.0`+ (or compatible `pnpm` / `yarn`)
- **Target Operating Systems**: Windows 10/11, macOS 11+, Linux (Ubuntu 20.04+, Fedora, etc.)
- **Supported Browsers**:
  - Google Chrome / Chromium 90+
  - Mozilla Firefox 90+
  - Apple Safari 15+
  - Microsoft Edge 90+

---

## 3. Technology Stack & Dependencies

### 3.1 Core Dependencies (`dependencies`)
| Package | Version | Purpose |
| :--- | :--- | :--- |
| **`react`** | `^19.2.6` | Component-based UI library |
| **`react-dom`** | `^19.2.6` | DOM bindings for React 19 |
| **`pdf-lib`** | `^1.17.1` | In-memory PDF document manipulation, extraction, merging, and JPEG embedding |
| **`pdfjs-dist`** | `^5.7.284` | Browser-based PDF rasterization & rendering engine |
| **`motion`** | `^12.40.0` | Declarative animations and UI transitions |
| **`HTML5 Canvas`** | *Native API* | Client-side 2D rasterization & page preview rendering |

### 3.2 Development & Build Dependencies (`devDependencies`)
| Package | Version | Purpose |
| :--- | :--- | :--- |
| **`vite`** | `^8.0.12` | Next-generation fast frontend build tool & dev server |
| **`@vitejs/plugin-react`** | `^6.0.1` | Vite React integration with HMR |
| **`tailwindcss`** | `^4.3.0` | Utility-first CSS styling engine |
| **`@tailwindcss/postcss`** | `^4.3.0` | PostCSS integration for Tailwind CSS v4 |
| **`postcss`** | `^8.5.15` | CSS transformation pipeline |
| **`autoprefixer`** | `^10.5.0` | Vendor prefix automation for cross-browser CSS |
| **`eslint`** | `^10.3.0` | Code quality and linting |
| **`@eslint/js`** | `^10.0.1` | ESLint JavaScript core rules |
| **`eslint-plugin-react-hooks`**| `^7.1.1` | React Hooks lint rules enforcement |
| **`eslint-plugin-react-refresh`**| `^0.5.2`| Fast refresh validation for Vite |
| **`globals`** | `^17.6.0` | Global identifier definitions for ESLint |

---

## 4. Functional Requirements

### 4.1 Document Ingestion & Parsing (FR-1)
- **FR-1.1 File Selection**: Users can select PDF files via drag-and-drop or standard file picker dialog.
- **FR-1.2 File Format Validation**: Only `.pdf` files (MIME type `application/pdf`) are accepted.
- **FR-1.3 Encryption Handling**: Encrypted or password-protected PDFs must be caught and present a clear notification ("*Password-protected PDFs are not supported yet*").
- **FR-1.4 Empty / Corrupted File Rejection**: Zero-page or malformed PDFs must return an explicit error and permit resetting.

### 4.2 Reordering Algorithm (FR-2)
- **FR-2.1 Odd/Even Partitioning**: Input document pages $1 \dots N$ are separated into an `oddStream` ($1, 3, 5, \dots$) and an `evenStream` ($2, 4, 6, \dots$).
- **FR-2.2 Odd Set Batching**: Pulls batches of 9 pages from `oddStream`. If fewer than 9 remain, the set is padded with `0` (blank placeholder pages).
- **FR-2.3 Even Set Reversal**: Pulls 3 blocks of 3 pages (total 9 pages) from `evenStream`. Each 3-page row block is reversed horizontally ($[p_1, p_2, p_3] \to [p_3, p_2, p_1]$) and padded with `0` if fewer than 3 pages remain.
- **FR-2.4 Interleaving**: Sequences alternating sets: `[Odd Set 1 (9 pages)]`, `[Even Set 1 (9 pages)]`, `[Odd Set 2]`, `[Even Set 2]`, etc.

### 4.3 Micro-Sizing Engine (FR-3)
- **FR-3.1 Sheet Geometry**: Target sheet is standard A4 portrait ($595 \times 842$ points).
- **FR-3.2 Grid Configuration**: Fixed 3-column $\times$ 3-row layout (9 cells per sheet, cell dimensions: $\approx 198.33 \times 280.66$ pt).
- **FR-3.3 High-Resolution Rasterization**: PDF.js renders source pages into Canvas at a $1.5\times$ scale factor before exporting to JPEG format (quality `0.92`).
- **FR-3.4 Proportional Aspect-Ratio Scaling**: Each page image is scaled with uniform aspect ratio fitting within cell bounds ($cell - 2 \times padding$), centered within its respective cell.

### 4.4 Interactive Preview & Output (FR-4)
- **FR-4.1 Result Visualization**: Shows total original vs. output page counts and renders a preview grid of processed pages.
- **FR-4.2 PDF Download**: One-click download providing a file named `<original_name>_reordered.pdf`.
- **FR-4.3 Direct Printing**: Opens the generated Blob URL directly in browser print preview.
- **FR-4.4 Session Reset**: Cleanly revokes previous `Blob` URLs to prevent memory leaks and restores application state to `idle`.

---

## 5. Non-Functional Requirements

### 5.1 Privacy & Security (NFR-1)
- **NFR-1.1 Zero Server Upload**: No PDF documents or page assets are transmitted to external servers. All operations occur locally in browser memory.
- **NFR-1.2 Memory Lifecycle**: Object URLs created via `URL.createObjectURL()` must be released via `URL.revokeObjectURL()` upon reset or reload.

### 5.2 Performance (NFR-2)
- **NFR-2.1 Worker Offloading**: PDF rasterization leverages asynchronous Web Workers (`pdf.worker.min.mjs`) to maintain UI responsiveness at 60 FPS.
- **NFR-2.2 Processing Speed**: A 50-page document must complete rearrangement and grid rendering in under 5 seconds on standard hardware.

### 5.3 User Experience & Design (NFR-3)
- **NFR-3.1 Theme**: Sleek dark aesthetic (`#000000` base, `#F0F2F7` text, `#9BA3B8` muted labels).
- **NFR-3.2 Dynamic Visuals**: Interactive starfield particle canvas with cursor attraction (`GravityStarsBackground`).
- **NFR-3.3 Responsive Layout**: Fully responsive interface accommodating desktop, tablet, and mobile viewing.

---

## 6. Installation & Execution Guide

### 6.1 Install Dependencies
```bash
npm install
```

### 6.2 Start Development Server
```bash
npm run dev
```
Launches the local Vite development server (typically at `http://localhost:5173`).

### 6.3 Build for Production
```bash
npm run build
```
Generates an optimized production distribution bundle in the `dist/` directory.

### 6.4 Preview Production Build
```bash
npm run preview
```

### 6.5 Run Linter
```bash
npm run lint
```

---

## 7. Project Structure

```
microbit/
├── public/
│   ├── icons.svg
│   ├── logo.png
│   └── pdf.worker.min.mjs       # PDF.js Web Worker bundle
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── DashboardCards.jsx
│   │   ├── EditorHero.jsx       # Drag & drop upload hero section
│   │   ├── GravityStars.jsx     # Interactive background particle canvas
│   │   ├── Header.jsx           # App top navigation & branding
│   │   ├── OptionSelector.jsx   # Processing options checkboxes
│   │   └── PreviewGrid.jsx      # Post-processing page visualizer
│   ├── engine/
│   │   └── algorithm.js         # 9-up odd/even page sequencing algorithm
│   ├── pdf/
│   │   ├── builder.js           # pdf-lib reordered PDF generator
│   │   ├── microsize.js         # 3x3 A4 grid rasterization & assembly
│   │   └── parser.js            # PDF validation and page count extraction
│   ├── App.css
│   ├── App.jsx                  # Main application state machine & controller
│   ├── index.css                # Global Tailwind CSS styles
│   └── main.jsx                 # React root mount point
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── README.md
└── REQUIREMENTS.md              # Software Requirements Specification
```
