/**
 * 同步滚动与导航控制模块 (Sync Controller)
 * 实现双屏非线性同步滚动、差异导航、点击精准定位
 */
class SyncController {
  constructor() {
    this.leftContainer = null;
    this.rightContainer = null;
    this.diffResults = [];
    this.currentDiffIndex = -1;
    this.isScrolling = false;
    this.scrollTimeout = null;
    this.leftOverlay = null;
    this.rightOverlay = null;
    this.onDiffNavigate = null; // 回调: (diffId) => void
  }

  /**
   * 初始化控制器
   * @param {HTMLElement} leftContainer - 左屏滚动容器
   * @param {HTMLElement} rightContainer - 右屏滚动容器
   * @param {OverlayRenderer} leftOverlay - 左屏高亮渲染器
   * @param {OverlayRenderer} rightOverlay - 右屏高亮渲染器
   */
  init(leftContainer, rightContainer, leftOverlay, rightOverlay) {
    this.leftContainer = leftContainer;
    this.rightContainer = rightContainer;
    this.leftOverlay = leftOverlay;
    this.rightOverlay = rightOverlay;

    // 绑定滚动事件（使用passive提高性能）
    this._onLeftScroll = this._handleScroll.bind(this, 'left');
    this._onRightScroll = this._handleScroll.bind(this, 'right');

    leftContainer.addEventListener('scroll', this._onLeftScroll, { passive: true });
    rightContainer.addEventListener('scroll', this._onRightScroll, { passive: true });
  }

  /**
   * 设置差异结果数据
   * @param {Array} diffs
   */
  setDiffResults(diffs) {
    this.diffResults = diffs;
    this.currentDiffIndex = -1;
  }

  /**
   * 处理滚动事件 - 实现非线性同步
   * @private
   */
  _handleScroll(sourceSide) {
    if (this.isScrolling) return;

    this.isScrolling = true;
    clearTimeout(this.scrollTimeout);

    const sourceContainer = sourceSide === 'left' ? this.leftContainer : this.rightContainer;
    const targetContainer = sourceSide === 'left' ? this.rightContainer : this.leftContainer;
    const sourceScrollRatio = sourceContainer.scrollTop / (sourceContainer.scrollHeight - sourceContainer.clientHeight || 1);

    // 基于比例的初步同步
    const targetScrollTop = sourceScrollRatio * (targetContainer.scrollHeight - targetContainer.clientHeight || 1);
    targetContainer.scrollTop = targetScrollTop;

    this.scrollTimeout = setTimeout(() => {
      this.isScrolling = false;
    }, 50);
  }

  /**
   * 导航到指定差异
   * @param {number} diffId - 差异ID
   * @param {boolean} animate - 是否使用动画
   */
  navigateToDiff(diffId, animate = true) {
    const diff = this.diffResults.find(d => d.id === diffId);
    if (!diff) return;

    this.currentDiffIndex = this.diffResults.indexOf(diff);

    // 获取左右两侧的坐标位置
    const leftPos = this._getDiffPagePosition(diff, 'left');
    const rightPos = this._getDiffPagePosition(diff, 'right');

    // 滚动左屏
    if (leftPos) {
      this._scrollToPosition(leftPos, animate);
    }

    // 滚动右屏
    if (rightPos) {
      this._scrollToPosition(rightPos, animate);
    }

    // 设置激活高亮
    if (this.leftOverlay) {
      this.leftOverlay.setActiveHighlight(diffId);
      this.leftOverlay.renderAll('left');
    }
    if (this.rightOverlay) {
      this.rightOverlay.setActiveHighlight(diffId);
      this.rightOverlay.renderAll('right');
    }

    // 触发回调
    if (this.onDiffNavigate) {
      this.onDiffNavigate(diffId);
    }
  }

  /**
   * 获取差异在指定侧的页面和位置
   * @private
   */
  _getDiffPagePosition(diff, side) {
    let coords = null;

    if (diff.type === 'modification') {
      coords = side === 'left' ? diff.oldCoordinates : diff.newCoordinates;
    } else if (diff.type === 'deletion' && side === 'left') {
      coords = diff.coordinates;
    } else if (diff.type === 'insertion' && side === 'right') {
      coords = diff.coordinates;
    }

    if (!coords) {
      // 对于另一侧没有坐标的情况，尝试使用对侧坐标做近似定位
      if (diff.type === 'deletion' && side === 'right') {
        coords = diff.coordinates; // 近似使用左侧坐标
      } else if (diff.type === 'insertion' && side === 'left') {
        coords = diff.coordinates; // 近似使用右侧坐标
      }
    }

    if (!coords) return null;

    // 找到对应的页面容器
    const container = side === 'left' ? this.leftContainer : this.rightContainer;
    const pageElements = container.querySelectorAll('.page-container');

    for (const pageEl of pageElements) {
      const pageNum = parseInt(pageEl.dataset.page);
      if (pageNum === coords.pageNum) {
        return {
          element: pageEl,
          y: coords.y,
          x: coords.x,
          pageNum: coords.pageNum,
          container: container,
        };
      }
    }

    return null;
  }

  /**
   * 平滑滚动到指定位置
   * @private
   */
  _scrollToPosition(position, animate) {
    if (!position || !position.element || !position.container) return;

    const container = position.container;
    const element = position.element;

    // 计算元素相对于容器的偏移
    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const elementOffsetTop = elementRect.top - containerRect.top + container.scrollTop;

    // 计算目标滚动位置（将差异点置于视口垂直居中）
    const containerHeight = container.clientHeight;
    const targetScrollTop = elementOffsetTop + position.y - containerHeight / 2;

    if (animate) {
      this._smoothScroll(container, targetScrollTop, 400);
    } else {
      container.scrollTop = targetScrollTop;
    }
  }

  /**
   * 平滑滚动实现
   * @private
   */
  _smoothScroll(container, targetTop, duration) {
    const startTop = container.scrollTop;
    const distance = targetTop - startTop;
    const startTime = performance.now();

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      container.scrollTop = startTop + distance * easedProgress;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }

  /**
   * 导航到下一处差异
   */
  navigateNext() {
    if (this.diffResults.length === 0) return;
    const nextIndex = this.currentDiffIndex + 1;
    if (nextIndex < this.diffResults.length) {
      this.navigateToDiff(this.diffResults[nextIndex].id);
    }
  }

  /**
   * 导航到上一处差异
   */
  navigatePrev() {
    if (this.diffResults.length === 0) return;
    const prevIndex = this.currentDiffIndex - 1;
    if (prevIndex >= 0) {
      this.navigateToDiff(this.diffResults[prevIndex].id);
    }
  }

  /**
   * 获取当前差异索引
   */
  getCurrentIndex() {
    return this.currentDiffIndex;
  }

  /**
   * 获取差异总数
   */
  getTotalCount() {
    return this.diffResults.length;
  }

  /**
   * 销毁控制器，解绑事件
   */
  destroy() {
    if (this.leftContainer && this._onLeftScroll) {
      this.leftContainer.removeEventListener('scroll', this._onLeftScroll);
    }
    if (this.rightContainer && this._onRightScroll) {
      this.rightContainer.removeEventListener('scroll', this._onRightScroll);
    }
    this.leftContainer = null;
    this.rightContainer = null;
    this.leftOverlay = null;
    this.rightOverlay = null;
    this.diffResults = [];
  }
}

// 导出
window.SyncController = SyncController;
