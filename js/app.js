/**
 * 主应用控制器 (App Controller)
 * 协调所有模块，管理应用生命周期和UI交互
 */
class App {
  constructor() {
    this.pdfRendererA = null;
    this.pdfRendererB = null;
    this.diffEngine = null;
    this.overlayRendererLeft = null;
    this.overlayRendererRight = null;
    this.syncController = null;
    this.ocrHandler = null;

    this.fileA = null;
    this.fileB = null;
    this.docDataA = null;
    this.docDataB = null;
    this.diffResults = [];

    this.state = 'upload'; // 'upload' | 'processing' | 'compare'
  }

  /**
   * 初始化应用
   */
  async init() {
    // 依赖检查
    const missing = [];
    if (typeof pdfjsLib === 'undefined') missing.push('PDF.js');
    if (typeof diff_match_patch === 'undefined') missing.push('diff-match-patch');
    if (typeof mammoth === 'undefined') missing.push('Mammoth.js');

    if (missing.length > 0) {
      this._showDependencyError(missing);
      return;
    }

    try {
      this._cacheDom();
      this._bindEvents();
      this._initModules();
      this._showView('upload');
    } catch (err) {
      console.error('初始化失败:', err);
      this._showToast('应用初始化失败: ' + err.message, 'error');
    }
  }

  /**
   * 显示依赖缺失错误
   * @private
   */
  _showDependencyError(missing) {
    const uploadView = document.getElementById('uploadView');
    if (uploadView) {
      uploadView.innerHTML = `
        <div style="text-align:center; max-width:500px; padding:40px;">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="1.5" style="margin-bottom:20px;">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h2 style="font-size:20px; font-weight:700; color:#111827; margin-bottom:12px;">依赖库加载失败</h2>
          <p style="font-size:14px; color:#6b7280; line-height:1.6; margin-bottom:8px;">
            以下库未能成功加载：<strong style="color:#dc2626;">${missing.join('、')}</strong>
          </p>
          <p style="font-size:13px; color:#9ca3af; line-height:1.6; margin-bottom:24px;">
            请检查网络连接后刷新页面重试。
          </p>
          <button onclick="location.reload()" style="
            display:inline-flex; align-items:center; gap:6px;
            padding:10px 24px; border:1px solid #d1d5db; border-radius:8px;
            background:#fff; color:#374151; font-size:14px; font-weight:500; cursor:pointer;
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
            刷新页面
          </button>
        </div>
      `;
    }
  }

  /**
   * 缓存DOM引用
   * @private
   */
  _cacheDom() {
    // Views
    this.uploadView = document.getElementById('uploadView');
    this.compareView = document.getElementById('compareView');

    // Upload panels
    this.uploadPanelA = document.getElementById('uploadPanelA');
    this.uploadPanelB = document.getElementById('uploadPanelB');
    this.fileInputA = document.getElementById('fileInputA');
    this.fileInputB = document.getElementById('fileInputB');
    this.compareBtn = document.getElementById('compareBtn');

    // Compare panels
    this.leftScrollContainer = document.getElementById('leftScrollContainer');
    this.rightScrollContainer = document.getElementById('rightScrollContainer');

    // Toolbar
    this.diffCounter = document.getElementById('diffCounter');
    this.diffCountNum = document.getElementById('diffCountNum');
    this.prevBtn = document.getElementById('prevDiffBtn');
    this.nextBtn = document.getElementById('nextDiffBtn');
    this.diffPosition = document.getElementById('diffPosition');
    this.modeToggle = document.getElementById('modeToggle');
    this.sidebarToggle = document.getElementById('sidebarToggle');
    this.resetBtn = document.getElementById('resetBtn');

    // Sidebar
    this.diffSidebar = document.getElementById('diffSidebar');
    this.diffSidebarBody = document.getElementById('diffSidebarBody');
    this.sidebarClose = document.getElementById('sidebarClose');

    // Loading
    this.loadingOverlay = document.getElementById('loadingOverlay');
    this.loadingText = document.getElementById('loadingText');
    this.progressBar = document.getElementById('progressBar');
    this.progressDetail = document.getElementById('progressDetail');

    // Toast
    this.toastContainer = document.getElementById('toastContainer');
  }

  /**
   * 绑定事件
   * @private
   */
  _bindEvents() {
    // 文件上传 - 面板A
    this._setupUploadPanel(this.uploadPanelA, this.fileInputA, (file) => {
      this.fileA = file;
      this._updatePanelUI(this.uploadPanelA, file);
      this._updateCompareButton();
    });

    // 文件上传 - 面板B
    this._setupUploadPanel(this.uploadPanelB, this.fileInputB, (file) => {
      this.fileB = file;
      this._updatePanelUI(this.uploadPanelB, file);
      this._updateCompareButton();
    });

    // 开始比对按钮
    this.compareBtn.addEventListener('click', () => this._startCompare());

    // 差异导航
    this.prevBtn.addEventListener('click', () => this.syncController?.navigatePrev());
    this.nextBtn.addEventListener('click', () => this.syncController?.navigateNext());

    // 模式切换
    this.modeToggle.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        this.modeToggle.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (this.diffEngine) {
          this.diffEngine.setMode(btn.dataset.mode);
          this._recomputeDiff();
        }
      });
    });

    // 侧边栏
    this.sidebarToggle.addEventListener('click', () => {
      this.diffSidebar.classList.toggle('open');
      this.sidebarToggle.classList.toggle('active');
    });

    this.sidebarClose.addEventListener('click', () => {
      this.diffSidebar.classList.remove('open');
      this.sidebarToggle.classList.remove('active');
    });

    // 重置
    this.resetBtn.addEventListener('click', () => this._reset());

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
      if (this.state !== 'compare') return;
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        this.syncController?.navigateNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        this.syncController?.navigatePrev();
      } else if (e.key === 'Escape') {
        this.diffSidebar.classList.remove('open');
        this.sidebarToggle.classList.remove('active');
      }
    });
  }

  /**
   * 设置上传面板的拖拽和点击事件
   * @private
   */
  _setupUploadPanel(panel, input, onFileSelected) {
    // 点击上传（使用事件委托，避免innerHTML替换后引用失效）
    panel.addEventListener('click', (e) => {
      const currentInput = panel.querySelector('input[type="file"]');
      if (!currentInput || e.target === currentInput) return;
      currentInput.click();
    });

    input.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        onFileSelected(e.target.files[0]);
      }
    });

    // 拖拽上传
    panel.addEventListener('dragover', (e) => {
      e.preventDefault();
      panel.classList.add('dragover');
    });

    panel.addEventListener('dragleave', () => {
      panel.classList.remove('dragover');
    });

    panel.addEventListener('drop', (e) => {
      e.preventDefault();
      panel.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (this._isValidFileType(file)) {
          onFileSelected(file);
        } else {
          this._showToast('不支持的文件格式，请上传 PDF 或 Word 文档', 'error');
        }
      }
    });
  }

  /**
   * 初始化各模块
   * @private
   */
  _initModules() {
    this.diffEngine = new DiffEngine();
    this.overlayRendererLeft = new OverlayRenderer();
    this.overlayRendererRight = new OverlayRenderer();
    this.syncController = new SyncController();
    this.ocrHandler = new OcrHandler();

    // 设置同步控制器的导航回调
    this.syncController.onDiffNavigate = (diffId) => {
      this._updateDiffPosition(diffId);
      this._updateSidebarActive(diffId);
    };
  }

  /**
   * 更新上传面板UI
   * @private
   */
  _updatePanelUI(panel, file) {
    panel.classList.add('has-file');
    const size = file.size < 1024 * 1024
      ? (file.size / 1024).toFixed(1) + ' KB'
      : (file.size / (1024 * 1024)).toFixed(1) + ' MB';

    panel.innerHTML = `
      <input type="file" id="${panel.id === 'uploadPanelA' ? 'fileInputA' : 'fileInputB'}" accept=".pdf,.doc,.docx">
      <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
      </svg>
      <div class="file-info">
        <span class="file-name">${file.name}</span>
        <span class="file-size">${size}</span>
      </div>
    `;

    // 重新绑定input事件
    const newInput = panel.querySelector('input[type="file"]');
    newInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        const f = e.target.files[0];
        if (panel.id === 'uploadPanelA') {
          this.fileA = f;
        } else {
          this.fileB = f;
        }
        this._updatePanelUI(panel, f);
        this._updateCompareButton();
      }
    });
  }

  /**
   * 更新比对按钮状态
   * @private
   */
  _updateCompareButton() {
    this.compareBtn.disabled = !(this.fileA && this.fileB);
  }

  /**
   * 验证文件类型
   * @private
   */
  _isValidFileType(file) {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const validExts = ['.pdf', '.doc', '.docx'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    return validTypes.includes(file.type) || validExts.includes(ext);
  }

  /**
   * 开始比对流程
   * @private
   */
  async _startCompare() {
    if (!this.fileA || !this.fileB) return;

    this.state = 'processing';
    this._showLoading(true);

    try {
      // Step 1: 加载文档A
      this._updateProgress(5, '正在加载原件...');
      this.docDataA = await this._loadDocument(this.fileA, (pct, msg) => {
        this._updateProgress(5 + pct * 0.4, msg);
      });
      if (this.docDataA.renderer) this.pdfRendererA = this.docDataA.renderer;

      // Step 2: 加载文档B
      this._updateProgress(45, '正在加载修订件...');
      this.docDataB = await this._loadDocument(this.fileB, (pct, msg) => {
        this._updateProgress(45 + pct * 0.4, msg);
      });
      if (this.docDataB.renderer) this.pdfRendererB = this.docDataB.renderer;

      // Step 3: 如果需要OCR
      if (this.docDataA.isScanned || this.docDataB.isScanned) {
        this._updateProgress(85, '检测到扫描件，启动OCR识别...');

        if (this.docDataA.isScanned) {
          const ocrResults = await this.ocrHandler.recognizeDocument(
            this.docDataA.pages,
            (pct, msg) => this._updateProgress(85 + pct * 0.075, msg)
          );
          // 用OCR结果替换文本项
          for (const ocrPage of ocrResults) {
            const page = this.docDataA.pages.find(p => p.pageNum === ocrPage.pageNum);
            if (page) {
              page.textItems = ocrPage.textItems;
              page.fullText = ocrPage.fullText;
            }
          }
        }

        if (this.docDataB.isScanned) {
          const ocrResults = await this.ocrHandler.recognizeDocument(
            this.docDataB.pages,
            (pct, msg) => this._updateProgress(92.5 + pct * 0.075, msg)
          );
          for (const ocrPage of ocrResults) {
            const page = this.docDataB.pages.find(p => p.pageNum === ocrPage.pageNum);
            if (page) {
              page.textItems = ocrPage.textItems;
              page.fullText = ocrPage.fullText;
            }
          }
        }
      }

      // Step 4: 执行差异计算
      this._updateProgress(95, '正在计算差异...');
      await this._computeDiff();

      // Step 5: 渲染比对视图
      this._updateProgress(98, '正在渲染比对视图...');
      await this._renderCompareView();

      this._updateProgress(100, '比对完成！');

      // 短暂延迟后切换视图
      await this._delay(300);
      this._showLoading(false);
      this._showView('compare');
      this.state = 'compare';

      this._showToast(`比对完成，共发现 ${this.diffResults.length} 处差异`, 'success');

    } catch (error) {
      console.error('比对过程出错:', error);
      this._showLoading(false);
      this._showToast('比对过程出错: ' + error.message, 'error');
      this.state = 'upload';
    }
  }

  /**
   * 加载文档（PDF直接加载，Word需先转PDF）
   * @private
   */
  async _loadDocument(file, onProgress) {
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'pdf') {
      return await this._loadPdf(file, onProgress);
    } else if (ext === 'doc' || ext === 'docx') {
      return await this._loadWord(file, onProgress);
    } else {
      throw new Error('不支持的文件格式: ' + ext);
    }
  }

  /**
   * 加载PDF文件
   * @private
   */
  async _loadPdf(file, onProgress) {
    const arrayBuffer = await file.arrayBuffer();
    const renderer = new PdfRenderer();
    const result = await renderer.loadDocument(arrayBuffer, onProgress);

    // 为每个文本项设置页码
    for (const page of result.pages) {
      for (const item of page.textItems) {
        item.pageNum = page.pageNum;
      }
    }

    return {
      renderer: renderer,
      pages: result.pages,
      isScanned: result.isScanned,
      numPages: result.numPages,
      fileName: file.name,
    };
  }

  /**
   * 加载Word文件（使用mammoth.js提取文本，模拟PDF渲染）
   * @private
   */
  async _loadWord(file, onProgress) {
    onProgress(10, '正在解析Word文档...');

    const arrayBuffer = await file.arrayBuffer();

    // 使用mammoth.js提取HTML
    const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
    const htmlContent = result.value;

    onProgress(40, '正在转换为PDF格式...');

    // 将HTML渲染到Canvas（模拟PDF页面）
    const pages = await this._htmlToPages(htmlContent, file.name);

    onProgress(90, 'Word文档处理完成');

    return {
      renderer: null, // Word没有PDF renderer
      pages: pages,
      isScanned: false,
      numPages: pages.length,
      fileName: file.name,
    };
  }

  /**
   * 将HTML内容转换为模拟的PDF页面
   * @private
   */
  async _htmlToPages(html, fileName) {
    const pages = [];
    const pageWidth = 794; // A4 width at 96dpi
    const pageHeight = 1123; // A4 height at 96dpi
    const margin = 60;
    const lineHeight = 24;
    const maxCharsPerLine = Math.floor((pageWidth - margin * 2) / 8);

    // 提取纯文本
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || '';

    // 按行分割并分页
    const paragraphs = text.split(/\n+/).filter(p => p.trim());
    let currentY = margin;
    let pageNum = 1;
    let textItems = [];

    // 创建第一页Canvas
    let canvas = document.createElement('canvas');
    canvas.width = pageWidth;
    canvas.height = pageHeight;
    let ctx = canvas.getContext('2d');

    // 白色背景
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, pageWidth, pageHeight);

    // 设置字体
    ctx.fillStyle = '#000';
    ctx.font = '14px -apple-system, "Microsoft YaHei", sans-serif';

    let globalIndex = 0;

    for (const para of paragraphs) {
      const lines = this._wrapText(para, maxCharsPerLine);

      for (const line of lines) {
        if (currentY + lineHeight > pageHeight - margin) {
          // 保存当前页
          pages.push({
            pageNum: pageNum,
            canvas: canvas,
            width: pageWidth,
            height: pageHeight,
            textItems: [...textItems],
            fullText: textItems.map(t => t.str).join(''),
          });

          // 新建页面
          pageNum++;
          canvas = document.createElement('canvas');
          canvas.width = pageWidth;
          canvas.height = pageHeight;
          ctx = canvas.getContext('2d');
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, pageWidth, pageHeight);
          ctx.fillStyle = '#000';
          ctx.font = '14px -apple-system, "Microsoft YaHei", sans-serif';
          currentY = margin;
          textItems = [];
        }

        // 绘制文本
        ctx.fillText(line, margin, currentY + lineHeight - 6);

        // 记录文本项坐标
        textItems.push({
          str: line + ' ',
          x: margin,
          y: currentY,
          width: line.length * 8,
          height: lineHeight,
          fontSize: 14,
          pageNum: pageNum,
        });

        globalIndex += line.length + 1;
        currentY += lineHeight;
      }

      currentY += lineHeight * 0.5; // 段落间距
    }

    // 保存最后一页
    if (textItems.length > 0) {
      pages.push({
        pageNum: pageNum,
        canvas: canvas,
        width: pageWidth,
        height: pageHeight,
        textItems: textItems,
        fullText: textItems.map(t => t.str).join(''),
      });
    }

    // 如果没有任何内容，创建一个空白页
    if (pages.length === 0) {
      canvas = document.createElement('canvas');
      canvas.width = pageWidth;
      canvas.height = pageHeight;
      ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, pageWidth, pageHeight);
      pages.push({
        pageNum: 1,
        canvas: canvas,
        width: pageWidth,
        height: pageHeight,
        textItems: [],
        fullText: '',
      });
    }

    return pages;
  }

  /**
   * 文本自动换行
   * @private
   */
  _wrapText(text, maxCharsPerLine) {
    const lines = [];
    let remaining = text;

    while (remaining.length > 0) {
      if (remaining.length <= maxCharsPerLine) {
        lines.push(remaining);
        break;
      }

      // 尝试在最后一个空格处断行
      let breakIndex = remaining.lastIndexOf(' ', maxCharsPerLine);
      if (breakIndex <= 0) {
        breakIndex = maxCharsPerLine;
      }

      lines.push(remaining.substring(0, breakIndex));
      remaining = remaining.substring(breakIndex).trimStart();
    }

    return lines;
  }

  /**
   * 计算差异
   * @private
   */
  async _computeDiff() {
    // 提取全文
    const textA = this.docDataA.pages.map(p => p.fullText).join('\n');
    const textB = this.docDataB.pages.map(p => p.fullText).join('\n');

    // 合并所有页面的文本项
    const allTextItemsA = [];
    const allTextItemsB = [];
    for (const page of this.docDataA.pages) {
      allTextItemsA.push(...page.textItems);
    }
    for (const page of this.docDataB.pages) {
      allTextItemsB.push(...page.textItems);
    }

    // 执行比对
    const rawDiffs = this.diffEngine.compare(textA, textB);

    // 映射坐标
    this.diffResults = this.diffEngine.mapDiffsToCoordinates(
      rawDiffs, allTextItemsA, allTextItemsB
    );

    // 设置同步控制器的差异数据
    this.syncController.setDiffResults(this.diffResults);
  }

  /**
   * 重新计算差异（切换模式后）
   * @private
   */
  async _recomputeDiff() {
    await this._computeDiff();
    this._renderHighlights();
    this._updateDiffCounter();
    this._renderDiffSidebar();
  }

  /**
   * 渲染比对视图
   * @private
   */
  async _renderCompareView() {
    // 清空容器
    this.leftScrollContainer.innerHTML = '';
    this.rightScrollContainer.innerHTML = '';

    // 渲染左屏（原件）
    for (const page of this.docDataA.pages) {
      const pageContainer = this._createPageElement(page, 'left');
      this.leftScrollContainer.appendChild(pageContainer);
    }

    // 渲染右屏（修订件）
    for (const page of this.docDataB.pages) {
      const pageContainer = this._createPageElement(page, 'right');
      this.rightScrollContainer.appendChild(pageContainer);
    }

    // 渲染高亮
    this._renderHighlights();

    // 初始化同步控制器
    this.syncController.init(
      this.leftScrollContainer,
      this.rightScrollContainer,
      this.overlayRendererLeft,
      this.overlayRendererRight
    );

    // 更新UI
    this._updateDiffCounter();
    this._renderDiffSidebar();

    // 更新文件名标签
    document.getElementById('leftFileName').textContent = this.docDataA.fileName;
    document.getElementById('rightFileName').textContent = this.docDataB.fileName;
  }

  /**
   * 创建页面DOM元素
   * @private
   */
  _createPageElement(page, side) {
    const container = document.createElement('div');
    container.className = 'page-container';
    container.dataset.page = page.pageNum;

    const wrapper = document.createElement('div');
    wrapper.className = 'page-canvas-wrapper';

    // 添加PDF Canvas
    const canvas = page.canvas;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    wrapper.appendChild(canvas);

    container.appendChild(wrapper);

    // 创建叠加层
    const overlay = side === 'left' ? this.overlayRendererLeft : this.overlayRendererRight;
    overlay.createOverlay(wrapper, page.pageNum, page.width, page.height);

    return container;
  }

  /**
   * 渲染高亮
   * @private
   */
  _renderHighlights() {
    // 设置高亮数据
    this.overlayRendererLeft.setHighlights('left', this.diffResults);
    this.overlayRendererRight.setHighlights('right', this.diffResults);

    // 渲染所有页面
    this.overlayRendererLeft.renderAll('left');
    this.overlayRendererRight.renderAll('right');
  }

  /**
   * 更新差异计数器
   * @private
   */
  _updateDiffCounter() {
    const stats = this.diffEngine.getStats(this.diffResults);
    this.diffCountNum.textContent = this.diffResults.length;

    if (this.diffResults.length === 0) {
      this.diffPosition.textContent = '无差异';
    } else {
      this.diffPosition.textContent = `删除 ${stats.deletions} | 新增 ${stats.insertions} | 修改 ${stats.modifications}`;
    }
  }

  /**
   * 更新差异位置指示
   * @private
   */
  _updateDiffPosition(diffId) {
    const idx = this.diffResults.findIndex(d => d.id === diffId);
    if (idx >= 0) {
      this.diffPosition.textContent = `${idx + 1} / ${this.diffResults.length}`;
    }

    // 更新按钮状态
    this.prevBtn.disabled = idx <= 0;
    this.nextBtn.disabled = idx >= this.diffResults.length - 1;
  }

  /**
   * 渲染差异侧边栏列表
   * @private
   */
  _renderDiffSidebar() {
    this.diffSidebarBody.innerHTML = '';

    if (this.diffResults.length === 0) {
      this.diffSidebarBody.innerHTML = `
        <div class="empty-state" style="padding: 40px 20px;">
          <p>未发现差异</p>
        </div>
      `;
      return;
    }

    for (const diff of this.diffResults) {
      const item = document.createElement('div');
      item.className = 'diff-item';
      item.dataset.diffId = diff.id;

      const typeLabel = {
        deletion: '删除',
        insertion: '新增',
        modification: '修改',
      }[diff.type] || diff.type;

      const typeIcon = {
        deletion: '−',
        insertion: '+',
        modification: '↔',
      }[diff.type] || '•';

      let previewText = '';
      if (diff.type === 'deletion') {
        previewText = `<del>${this._escapeHtml(diff.text.substring(0, 50))}</del>`;
      } else if (diff.type === 'insertion') {
        previewText = `<ins>${this._escapeHtml(diff.text.substring(0, 50))}</ins>`;
      } else if (diff.type === 'modification') {
        previewText = `<del>${this._escapeHtml(diff.oldText.substring(0, 30))}</del> → <ins>${this._escapeHtml(diff.newText.substring(0, 30))}</ins>`;
      }

      const coords = diff.coordinates || diff.oldCoordinates || diff.newCoordinates;
      const pageNum = coords ? coords.pageNum : '?';

      item.innerHTML = `
        <div class="diff-item-badge ${diff.type}">${typeIcon}</div>
        <div class="diff-item-content">
          <div class="diff-item-type ${diff.type}">${typeLabel}</div>
          <div class="diff-item-text">${previewText}</div>
          <div class="diff-item-page">第 ${pageNum} 页</div>
        </div>
      `;

      item.addEventListener('click', () => {
        this.syncController.navigateToDiff(diff.id);
      });

      this.diffSidebarBody.appendChild(item);
    }
  }

  /**
   * 更新侧边栏激活状态
   * @private
   */
  _updateSidebarActive(diffId) {
    this.diffSidebarBody.querySelectorAll('.diff-item').forEach(item => {
      item.classList.toggle('active', parseInt(item.dataset.diffId) === diffId);
    });

    // 滚动侧边栏使激活项可见
    const activeItem = this.diffSidebarBody.querySelector('.diff-item.active');
    if (activeItem) {
      activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /**
   * 显示/隐藏视图
   * @private
   */
  _showView(view) {
    this.uploadView.style.display = view === 'upload' ? 'flex' : 'none';
    this.compareView.classList.toggle('active', view === 'compare');
  }

  /**
   * 显示/隐藏加载遮罩
   * @private
   */
  _showLoading(show) {
    this.loadingOverlay.classList.toggle('active', show);
  }

  /**
   * 更新进度
   * @private
   */
  _updateProgress(percent, message) {
    this.progressBar.style.width = percent + '%';
    this.progressDetail.textContent = message;
    this.loadingText.textContent = message;
  }

  /**
   * 显示Toast通知
   * @private
   */
  _showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * 重置应用
   * @private
   */
  _reset() {
    // 销毁模块
    this.syncController?.destroy();
    this.overlayRendererLeft?.clearAll();
    this.overlayRendererRight?.clearAll();
    this.ocrHandler?.terminate();
    this.pdfRendererA?.destroy();
    this.pdfRendererB?.destroy();

    // 清理数据
    this.fileA = null;
    this.fileB = null;
    this.docDataA = null;
    this.docDataB = null;
    this.diffResults = [];
    this.pdfRendererA = null;
    this.pdfRendererB = null;

    // 重新初始化模块
    this._initModules();

    // 重置UI
    this._showView('upload');
    this.diffSidebar.classList.remove('open');
    this.sidebarToggle.classList.remove('active');

    // 重置上传面板
    this._resetUploadPanel(this.uploadPanelA, 'fileInputA', '原件 (合同A)');
    this._resetUploadPanel(this.uploadPanelB, 'fileInputB', '修订件 (合同B)');

    this._updateCompareButton();
    this.state = 'upload';

    // 释放内存
    if (window.gc) window.gc();
  }

  /**
   * 重置上传面板
   * @private
   */
  _resetUploadPanel(panel, inputId, label) {
    panel.classList.remove('has-file');
    panel.innerHTML = `
      <input type="file" id="${inputId}" accept=".pdf,.doc,.docx">
      <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
      </svg>
      <h3>${label}</h3>
      <p>拖拽文件到此处，或点击选择</p>
      <p style="font-size:11px; color:#9ca3af;">支持 PDF、DOC、DOCX</p>
    `;

    // 重新绑定事件
    const newInput = panel.querySelector('input[type="file"]');
    const isPanelA = panel.id === 'uploadPanelA';

    newInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        const file = e.target.files[0];
        if (isPanelA) {
          this.fileA = file;
        } else {
          this.fileB = file;
        }
        this._updatePanelUI(panel, file);
        this._updateCompareButton();
      }
    });
  }

  /**
   * HTML转义
   * @private
   */
  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 延迟工具
   * @private
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 导出
window.App = App;
