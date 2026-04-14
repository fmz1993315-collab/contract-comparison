/**
 * PDF渲染与文本提取模块
 * 负责PDF文件加载、页面渲染、文本内容及坐标提取
 * 依赖: pdf.js (CDN)
 */
class PdfRenderer {
  constructor() {
    this.pdfDoc = null;
    this.pages = []; // { pageNum, canvas, textContent, textItems }
    this.scale = 1.5;
    this.isScanned = false;
  }

  /**
   * 加载PDF文档
   * @param {ArrayBuffer} data - PDF文件二进制数据
   * @param {Function} onProgress - 进度回调 (percent, message)
   * @returns {Promise<{pages: Array, isScanned: boolean}>}
   */
  async loadDocument(data, onProgress = () => {}) {
    onProgress(10, '正在解析PDF文档...');

    const loadingTask = pdfjsLib.getDocument({
      data: data,
      useSystemFonts: true,
    });

    this.pdfDoc = await loadingTask.promise;
    const numPages = this.pdfDoc.numPages;
    this.pages = [];

    onProgress(20, `文档共 ${numPages} 页，正在渲染...`);

    // 逐页渲染并提取文本
    for (let i = 1; i <= numPages; i++) {
      const page = await this.pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: this.scale });

      // 创建Canvas渲染
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      // 提取文本内容及坐标
      const textContent = await page.getTextContent();
      const textItems = this._processTextItems(textContent, viewport);

      this.pages.push({
        pageNum: i,
        canvas: canvas,
        viewport: viewport,
        width: viewport.width,
        height: viewport.height,
        textItems: textItems,
        fullText: textItems.map(t => t.str).join(''),
      });

      const progress = 20 + Math.round((i / numPages) * 60);
      onProgress(progress, `正在渲染第 ${i}/${numPages} 页...`);
    }

    // 检测是否为扫描件
    this.isScanned = this._detectScannedDocument();
    onProgress(85, this.isScanned ? '检测到扫描件，需要OCR识别...' : '文本提取完成');

    return {
      pages: this.pages,
      isScanned: this.isScanned,
      numPages: numPages,
    };
  }

  /**
   * 处理PDF.js提取的文本项，计算标准化坐标
   * @private
   */
  _processTextItems(textContent, viewport) {
    const items = [];
    let lastY = null;
    let lineText = '';
    let lineStartX = 0;

    for (const item of textContent.items) {
      if (!item.str || item.str.trim() === '') continue;

      // 使用transform矩阵计算实际坐标
      // transform = [scaleX, skewX, skewY, scaleY, translateX, translateY]
      const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
      const x = tx[4];
      const y = tx[5];
      const fontSize = Math.abs(tx[3]) || Math.abs(tx[0]) || 12;

      items.push({
        str: item.str,
        x: x,
        y: y,
        width: item.width * this.scale,
        height: fontSize * 1.2,
        fontSize: fontSize,
        pageNum: textContent.items.indexOf(item) > -1 ? 0 : 0, // will be set later
      });
    }

    return items;
  }

  /**
   * 检测文档是否为扫描件（文本层覆盖率极低）
   * @private
   */
  _detectScannedDocument() {
    let totalArea = 0;
    let textArea = 0;
    let totalTextItems = 0;
    let meaningfulTextItems = 0;

    for (const page of this.pages) {
      totalArea += page.width * page.height;
      for (const item of page.textItems) {
        totalTextItems++;
        textArea += item.width * item.height;
        if (item.str.trim().length > 0) meaningfulTextItems++;
      }
    }

    // 如果文本覆盖面积不到页面面积的0.5%，认为是扫描件
    // 或者虽然有文本项但都没有有意义的内容
    const coverageRatio = totalArea > 0 ? textArea / totalArea : 0;
    return coverageRatio < 0.005 || (totalTextItems > 0 && meaningfulTextItems === 0);
  }

  /**
   * 获取文档全部纯文本（按页分组）
   * @returns {Array<{pageNum: number, text: string}>}
   */
  getFullText() {
    return this.pages.map(page => ({
      pageNum: page.pageNum,
      text: page.textItems.map(t => t.str).join(''),
      items: page.textItems,
    }));
  }

  /**
   * 获取指定页面的Canvas元素
   */
  getPageCanvas(pageNum) {
    const page = this.pages.find(p => p.pageNum === pageNum);
    return page ? page.canvas : null;
  }

  /**
   * 设置渲染缩放比例
   */
  setScale(scale) {
    this.scale = scale;
  }

  /**
   * 销毁文档，释放内存
   */
  destroy() {
    if (this.pdfDoc) {
      this.pdfDoc.destroy();
      this.pdfDoc = null;
    }
    this.pages = [];
  }
}

// 导出
window.PdfRenderer = PdfRenderer;
