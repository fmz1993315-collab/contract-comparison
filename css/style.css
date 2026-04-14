/* ============================================
   DocCompare - 文档比对工具 样式表
   ============================================ */

/* --- CSS Variables --- */
:root {
  --primary: #2563eb;
  --primary-hover: #1d4ed8;
  --primary-light: #dbeafe;
  --danger: #dc2626;
  --danger-bg: #fee2e2;
  --danger-bg-alpha: rgba(220, 38, 38, 0.12);
  --success: #16a34a;
  --success-bg: #dcfce7;
  --success-bg-alpha: rgba(22, 163, 74, 0.12);
  --warning: #f59e0b;
  --warning-bg: #fef3c7;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
  --radius: 8px;
  --radius-lg: 12px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
  --transition: all 0.2s ease;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  --font-mono: 'SF Mono', 'Fira Code', 'Consolas', monospace;
}

/* --- Reset & Base --- */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--gray-800);
  background: var(--gray-50);
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
}

/* --- App Layout --- */
#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* --- Header --- */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 56px;
  background: #fff;
  border-bottom: 1px solid var(--gray-200);
  flex-shrink: 0;
  z-index: 100;
}

.app-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-logo svg {
  width: 28px;
  height: 28px;
  color: var(--primary);
}

.app-logo h1 {
  font-size: 16px;
  font-weight: 700;
  color: var(--gray-900);
  letter-spacing: -0.01em;
}

.app-logo h1 span {
  color: var(--primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* --- Buttons --- */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius);
  background: #fff;
  color: var(--gray-700);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
  user-select: none;
}

.btn:hover {
  background: var(--gray-50);
  border-color: var(--gray-400);
}

.btn:active {
  transform: scale(0.97);
}

.btn-primary {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.btn-primary:hover {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 12px;
}

.btn-icon {
  padding: 6px;
  border: none;
  background: transparent;
  color: var(--gray-500);
  border-radius: 6px;
}

.btn-icon:hover {
  background: var(--gray-100);
  color: var(--gray-700);
}

.btn-icon.active {
  background: var(--primary-light);
  color: var(--primary);
}

/* --- Upload View --- */
.upload-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  gap: 32px;
}

.upload-hero {
  text-align: center;
  max-width: 560px;
}

.upload-hero h2 {
  font-size: 28px;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.upload-hero p {
  font-size: 15px;
  color: var(--gray-500);
  line-height: 1.6;
}

.upload-panels {
  display: grid;
  grid-template-columns: 1fr 80px 1fr;
  gap: 0;
  align-items: center;
  width: 100%;
  max-width: 900px;
}

.upload-panel {
  position: relative;
  border: 2px dashed var(--gray-300);
  border-radius: var(--radius-lg);
  padding: 40px 24px;
  text-align: center;
  cursor: pointer;
  transition: var(--transition);
  background: #fff;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.upload-panel:hover {
  border-color: var(--primary);
  background: var(--primary-light);
}

.upload-panel.dragover {
  border-color: var(--primary);
  background: var(--primary-light);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.upload-panel.has-file {
  border-color: var(--success);
  border-style: solid;
  background: var(--success-bg);
}

.upload-panel .upload-icon {
  width: 48px;
  height: 48px;
  color: var(--gray-400);
  margin-bottom: 4px;
}

.upload-panel.has-file .upload-icon {
  color: var(--success);
}

.upload-panel h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--gray-700);
}

.upload-panel p {
  font-size: 12px;
  color: var(--gray-400);
}

.upload-panel .file-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.upload-panel .file-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-800);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-panel .file-size {
  font-size: 11px;
  color: var(--gray-500);
}

.upload-panel input[type="file"] {
  display: none;
}

.upload-vs {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: var(--primary);
  color: #fff;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 700;
  box-shadow: var(--shadow-md);
  z-index: 1;
}

.upload-formats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--gray-400);
}

.upload-formats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* --- Compare View --- */
.compare-view {
  flex: 1;
  display: none;
  flex-direction: column;
  overflow: hidden;
}

.compare-view.active {
  display: flex;
}

/* --- Toolbar --- */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: #fff;
  border-bottom: 1px solid var(--gray-200);
  flex-shrink: 0;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-center {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.diff-counter {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: var(--gray-100);
  border-radius: 20px;
  font-size: 12px;
  color: var(--gray-600);
  font-weight: 500;
}

.diff-counter .count {
  font-weight: 700;
  color: var(--primary);
}

.diff-nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--gray-300);
  border-radius: 6px;
  background: #fff;
  color: var(--gray-600);
  cursor: pointer;
  transition: var(--transition);
  font-size: 14px;
}

.diff-nav-btn:hover {
  background: var(--gray-50);
  border-color: var(--gray-400);
}

.diff-nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.mode-toggle {
  display: flex;
  border: 1px solid var(--gray-300);
  border-radius: 6px;
  overflow: hidden;
}

.mode-toggle button {
  padding: 5px 12px;
  border: none;
  background: #fff;
  font-size: 12px;
  color: var(--gray-600);
  cursor: pointer;
  transition: var(--transition);
  font-weight: 500;
}

.mode-toggle button:not(:last-child) {
  border-right: 1px solid var(--gray-300);
}

.mode-toggle button.active {
  background: var(--primary);
  color: #fff;
}

/* --- Diff Panels (Split View) --- */
.diff-panels {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

.diff-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.diff-panel:first-child {
  border-right: 1px solid var(--gray-200);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 16px;
  background: var(--gray-100);
  border-bottom: 1px solid var(--gray-200);
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-600);
  flex-shrink: 0;
}

.panel-header .label-original {
  color: var(--danger);
}

.panel-header .label-modified {
  color: var(--success);
}

.panel-scroll-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  position: relative;
  background: var(--gray-100);
}

.panel-scroll-container::-webkit-scrollbar {
  width: 8px;
}

.panel-scroll-container::-webkit-scrollbar-track {
  background: var(--gray-100);
}

.panel-scroll-container::-webkit-scrollbar-thumb {
  background: var(--gray-300);
  border-radius: 4px;
}

.panel-scroll-container::-webkit-scrollbar-thumb:hover {
  background: var(--gray-400);
}

/* --- PDF Page Container --- */
.page-container {
  position: relative;
  margin: 16px auto;
  box-shadow: var(--shadow-md);
  background: #fff;
}

.page-canvas-wrapper {
  position: relative;
  overflow: hidden;
}

.page-canvas-wrapper canvas {
  display: block;
  width: 100%;
  height: auto;
}

/* --- Highlight Overlay --- */
.highlight-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.highlight-overlay canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* --- Highlight Styles --- */
.highlight-deletion {
  background: rgba(220, 38, 38, 0.15);
  border-bottom: 2px solid rgba(220, 38, 38, 0.6);
  pointer-events: auto;
  cursor: pointer;
  transition: background 0.2s;
}

.highlight-deletion:hover {
  background: rgba(220, 38, 38, 0.25);
}

.highlight-insertion {
  background: rgba(22, 163, 74, 0.15);
  border-bottom: 2px solid rgba(22, 163, 74, 0.6);
  pointer-events: auto;
  cursor: pointer;
  transition: background 0.2s;
}

.highlight-insertion:hover {
  background: rgba(22, 163, 74, 0.25);
}

.highlight-modification-old {
  background: rgba(245, 158, 11, 0.15);
  border-bottom: 2px solid rgba(245, 158, 11, 0.6);
  pointer-events: auto;
  cursor: pointer;
  transition: background 0.2s;
}

.highlight-modification-old:hover {
  background: rgba(245, 158, 11, 0.25);
}

.highlight-modification-new {
  background: rgba(245, 158, 11, 0.15);
  border-bottom: 2px solid rgba(245, 158, 11, 0.6);
  pointer-events: auto;
  cursor: pointer;
  transition: background 0.2s;
}

.highlight-modification-new:hover {
  background: rgba(245, 158, 11, 0.25);
}

/* --- Active Highlight (Breathing Animation) --- */
.highlight-active {
  animation: breathe 1.5s ease-in-out 3;
}

@keyframes breathe {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* --- Diff List Sidebar --- */
.diff-sidebar {
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  background: #fff;
  border-left: 1px solid var(--gray-200);
  box-shadow: var(--shadow-lg);
  z-index: 50;
  display: none;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

.diff-sidebar.open {
  display: flex;
  transform: translateX(0);
}

.diff-sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--gray-200);
  flex-shrink: 0;
}

.diff-sidebar-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-800);
}

.diff-sidebar-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.diff-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius);
  cursor: pointer;
  transition: var(--transition);
  border: 1px solid transparent;
}

.diff-item:hover {
  background: var(--gray-50);
  border-color: var(--gray-200);
}

.diff-item.active {
  background: var(--primary-light);
  border-color: var(--primary);
}

.diff-item-badge {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  margin-top: 1px;
}

.diff-item-badge.deletion {
  background: var(--danger);
}

.diff-item-badge.insertion {
  background: var(--success);
}

.diff-item-badge.modification {
  background: var(--warning);
}

.diff-item-content {
  flex: 1;
  min-width: 0;
}

.diff-item-type {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 2px;
}

.diff-item-type.deletion { color: var(--danger); }
.diff-item-type.insertion { color: var(--success); }
.diff-item-type.modification { color: var(--warning); }

.diff-item-text {
  font-size: 12px;
  color: var(--gray-600);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.diff-item-text del {
  color: var(--danger);
  text-decoration: line-through;
}

.diff-item-text ins {
  color: var(--success);
  text-decoration: none;
  border-bottom: 1px solid var(--success);
}

.diff-item-page {
  font-size: 11px;
  color: var(--gray-400);
  margin-top: 2px;
}

/* --- Loading Overlay --- */
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(4px);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  flex-direction: column;
  gap: 20px;
}

.loading-overlay.active {
  display: flex;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--gray-200);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: var(--gray-600);
  font-weight: 500;
}

.loading-progress {
  width: 300px;
  max-width: 80vw;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: var(--gray-200);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 3px;
  transition: width 0.3s ease;
  width: 0%;
}

.progress-detail {
  font-size: 12px;
  color: var(--gray-400);
  margin-top: 6px;
  text-align: center;
}

/* --- Toast Notifications --- */
.toast-container {
  position: fixed;
  top: 72px;
  right: 24px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  font-size: 13px;
  color: var(--gray-700);
  animation: slideIn 0.3s ease;
  max-width: 360px;
}

.toast.success { border-left: 3px solid var(--success); }
.toast.error { border-left: 3px solid var(--danger); }
.toast.warning { border-left: 3px solid var(--warning); }
.toast.info { border-left: 3px solid var(--primary); }

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}

/* --- Empty State --- */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--gray-400);
  gap: 12px;
}

.empty-state svg {
  width: 64px;
  height: 64px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 14px;
}

/* --- Zoom Controls --- */
.zoom-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.zoom-controls .zoom-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-600);
  min-width: 40px;
  text-align: center;
}

/* --- Page Indicator --- */
.page-indicator {
  font-size: 12px;
  color: var(--gray-500);
  font-weight: 500;
}

/* --- Responsive --- */
@media (max-width: 768px) {
  .upload-panels {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .upload-vs {
    width: 40px;
    height: 40px;
    font-size: 12px;
  }

  .diff-sidebar {
    width: 260px;
  }

  .toolbar {
    padding: 6px 10px;
  }
}

/* --- Utility --- */
.hidden { display: none !important; }
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  border: 0;
}

/* --- Scrollbar for diff sidebar --- */
.diff-sidebar-body::-webkit-scrollbar {
  width: 6px;
}

.diff-sidebar-body::-webkit-scrollbar-track {
  background: transparent;
}

.diff-sidebar-body::-webkit-scrollbar-thumb {
  background: var(--gray-300);
  border-radius: 3px;
}
