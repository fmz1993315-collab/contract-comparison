/**
 * 高亮叠加渲染模块 (Overlay Renderer)
 * 在PDF Canvas之上叠加透明Canvas层，绘制差异高亮框
 * 实现"绝对定位叠加法"，不破坏原PDF排版
 */
class OverlayRenderer {

  constructor() {
    this.overlays = new Map(); // pageNum -> canvas
    this.highlights = new Map(); // side -> [{id, pageNum, rect, type}]
    this.activeHighlightId = null;
  }

  /**
   * 为指定页面创建叠加Canvas
   * @param {HTMLElement} container - 页面容器元素
   * @param {number} pageNum - 页码
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @returns {HTMLCanvasElement}
   */
  createOverlay(container, pageNum, width, height) {
    // 移除已有overlay
    this.removeOverlay(pageNum);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.className = 'highlight-overlay-canvas';
    canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10;
    `;

    // 创建overlay容器
    const overlayDiv = document.createElement('div');
    overlayDiv.className = 'highlight-overlay';
    overlayDiv.dataset.page = pageNum;
    overlayDiv.appendChild(canvas);

    container.style.position = 'relative';
    container.appendChild(overlayDiv);

    this.overlays.set(pageNum, { canvas, container: overlayDiv });
    return canvas;
  }

  /**
   * 移除指定页面的叠加层
   */
  removeOverlay(pageNum) {
    const entry = this.overlays.get(pageNum);
    if (entry) {
      entry.container.remove();
      this.overlays.delete(pageNum);
    }
  }

  /**
   * 清除所有叠加层
   */
  clearAll() {
    for (const [pageNum] of this.overlays) {
      this.removeOverlay(pageNum);
    }
    this.highlights.clear();
  }

  /**
   * 设置高亮数据
   * @param {'left'|'right'} side - 左屏或右屏
   * @param {Array} diffs - 映射了坐标的差异数组
   */
  setHighlights(side, diffs) {
    this.highlights.set(side, diffs.filter(d => d.coordinates || d.oldCoordinates || d.newCoordinates));
  }

  /**
   * 渲染指定页面的所有高亮
   * @param {number} pageNum
   * @param {'left'|'right'} side
   */
  renderPage(pageNum, side) {
    const entry = this.overlays.get(pageNum);
    if (!entry) return;

    const canvas = entry.canvas;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const diffs = this.highlights.get(side);
    if (!diffs) return;

    for (const diff of diffs) {
      const coords = this._getCoordsForSide(diff, side);
      if (!coords || coords.pageNum !== pageNum) continue;

      this._drawHighlight(ctx, coords, diff.type, diff.id === this.activeHighlightId);
    }
  }

  /**
   * 渲染所有页面的高亮
   * @param {'left'|'right'} side
   */
  renderAll(side) {
    for (const [pageNum] of this.overlays) {
      this.renderPage(pageNum, side);
    }
  }

  /**
   * 获取差异在指定侧的坐标
   * @private
   */
  _getCoordsForSide(diff, side) {
    if (diff.type === 'modification') {
      return side === 'left' ? diff.oldCoordinates : diff.newCoordinates;
    }
    return diff.coordinates;
  }

  /**
   * 绘制单个高亮框
   * @private
   */
  _drawHighlight(ctx, coords, type, isActive) {
    if (!coords) return;

    const { x, y, width, height } = coords;

    // 确保坐标有效
    if (width <= 0 || height <= 0) return;

    // 根据类型选择颜色
    let fillColor, strokeColor;
    switch (type) {
      case 'deletion':
        fillColor = 'rgba(220, 38, 38, 0.15)';
        strokeColor = 'rgba(220, 38, 38, 0.6)';
        break;
      case 'insertion':
        fillColor = 'rgba(22, 163, 74, 0.15)';
        strokeColor = 'rgba(22, 163, 74, 0.6)';
        break;
      case 'modification':
        fillColor = 'rgba(245, 158, 11, 0.15)';
        strokeColor = 'rgba(245, 158, 11, 0.6)';
        break;
      default:
        fillColor = 'rgba(37, 99, 235, 0.15)';
        strokeColor = 'rgba(37, 99, 235, 0.6)';
    }

    // 如果是激活状态，加深颜色
    if (isActive) {
      fillColor = fillColor.replace('0.15', '0.35');
      strokeColor = strokeColor.replace('0.6', '0.9');
    }

    // 绘制填充矩形
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, width, height);

    // 绘制底部边框线
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + height);
    ctx.lineTo(x + width, y + height);
    ctx.stroke();

    // 如果是删除，绘制删除线
    if (type === 'deletion') {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(x, y + height / 2);
      ctx.lineTo(x + width, y + height / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 如果是新增，绘制下划线
    if (type === 'insertion') {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y + height + 1);
      ctx.lineTo(x + width, y + height + 1);
      ctx.stroke();
    }
  }

  /**
   * 设置当前激活的高亮ID（呼吸动画）
   * @param {number|null} id
   */
  setActiveHighlight(id) {
    this.activeHighlightId = id;
  }

  /**
   * 获取指定坐标位置的高亮差异ID
   * @param {number} x
   * @param {number} y
   * @param {number} pageNum
   * @param {'left'|'right'} side
   * @returns {number|null}
   */
  getHighlightAtPoint(x, y, pageNum, side) {
    const diffs = this.highlights.get(side);
    if (!diffs) return null;

    for (const diff of diffs) {
      const coords = this._getCoordsForSide(diff, side);
      if (!coords || coords.pageNum !== pageNum) continue;

      if (x >= coords.x && x <= coords.x + coords.width &&
          y >= coords.y && y <= coords.y + coords.height) {
        return diff.id;
      }
    }
    return null;
  }

  /**
   * 获取指定差异ID在指定侧的页面坐标
   * @param {number} diffId
   * @param {'left'|'right'} side
   * @returns {{pageNum: number, y: number}|null}
   */
  getDiffPosition(diffId, side) {
    const diffs = this.highlights.get(side);
    if (!diffs) return null;

    const diff = diffs.find(d => d.id === diffId);
    if (!diff) return null;

    const coords = this._getCoordsForSide(diff, side);
    if (!coords) return null;

    return {
      pageNum: coords.pageNum,
      y: coords.y,
      x: coords.x,
    };
  }
}

// 导出
window.OverlayRenderer = OverlayRenderer;
