/**
 * OCR处理模块 (OCR Handler)
 * 使用Tesseract.js在浏览器端进行OCR识别
 * 提取文字的同时记录每个词在原图上的物理坐标
 */
class OcrHandler {
  constructor() {
    this.worker = null;
    this.isInitialized = false;
    this.language = 'chi_sim+eng'; // 中文简体 + 英文
  }

  /**
   * 初始化Tesseract Worker
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<void>}
   */
  async initialize(onProgress = () => {}) {
    if (this.isInitialized) return;

    onProgress(0, '正在加载OCR引擎...');

    this.worker = await Tesseract.createWorker(this.language, 1, {
      logger: (m) => {
        if (m.status === 'loading tesseract core') {
          onProgress(10, '正在加载OCR核心...');
        } else if (m.status === 'initializing tesseract') {
          onProgress(20, '正在初始化OCR引擎...');
        } else if (m.status === 'loading language traineddata') {
          const langProgress = Math.round(m.progress * 100);
          onProgress(20 + langProgress * 0.5, `正在加载语言包 (${langProgress}%)...`);
        } else if (m.status === 'initializing api') {
          onProgress(70, '正在初始化API...');
        }
      }
    });

    this.isInitialized = true;
    onProgress(75, 'OCR引擎就绪');
  }

  /**
   * 对PDF页面Canvas执行OCR
   * @param {HTMLCanvasElement} canvas - PDF页面渲染的Canvas
   * @param {number} pageNum - 页码
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<Array<TextItem>>} 识别出的文本项（含坐标）
   */
  async recognizePage(canvas, pageNum, onProgress = () => {}) {
    if (!this.isInitialized) {
      await this.initialize(onProgress);
    }

    onProgress(0, `正在识别第 ${pageNum} 页...`);

    const result = await this.worker.recognize(canvas);

    const textItems = [];
    const data = result.data;

    if (data && data.words) {
      for (const word of data.words) {
        const bbox = word.bbox;
        textItems.push({
          str: word.text,
          x: bbox.x0,
          y: bbox.y0,
          width: bbox.x1 - bbox.x0,
          height: bbox.y1 - bbox.y0,
          fontSize: bbox.y1 - bbox.y0,
          confidence: word.confidence,
          pageNum: pageNum,
        });
      }
    } else if (data && data.lines) {
      // fallback: 使用行级数据
      for (const line of data.lines) {
        const bbox = line.bbox;
        textItems.push({
          str: line.text,
          x: bbox.x0,
          y: bbox.y0,
          width: bbox.x1 - bbox.x0,
          height: bbox.y1 - bbox.y0,
          fontSize: bbox.y1 - bbox.y0,
          confidence: line.confidence,
          pageNum: pageNum,
        });
      }
    }

    onProgress(100, `第 ${pageNum} 页识别完成`);
    return textItems;
  }

  /**
   * 对整个PDF文档执行OCR
   * @param {Array<{canvas: HTMLCanvasElement, pageNum: number}>} pages
   * @param {Function} onProgress - 全局进度回调
   * @returns {Promise<Array<{pageNum: number, textItems: Array}>>}
   */
  async recognizeDocument(pages, onProgress = () => {}) {
    await this.initialize(onProgress);

    const results = [];
    const total = pages.length;

    for (let i = 0; i < total; i++) {
      const page = pages[i];
      const pageStart = 75 + (i / total) * 25;

      const textItems = await this.recognizePage(
        page.canvas,
        page.pageNum,
        (pct, msg) => {
          const overallPct = pageStart + (pct / 100) * (25 / total);
          onProgress(Math.round(overallPct), msg);
        }
      );

      results.push({
        pageNum: page.pageNum,
        textItems: textItems,
        fullText: textItems.map(t => t.str).join(''),
      });
    }

    return results;
  }

  /**
   * 销毁Worker，释放资源
   */
  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }
}

// 导出
window.OcrHandler = OcrHandler;
