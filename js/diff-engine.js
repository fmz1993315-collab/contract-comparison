/**
 * 差异计算引擎 (Diff Engine)
 * 基于LCS最长公共子序列算法进行字符级/词级差异比对
 * 依赖: diff-match-patch (CDN)
 */
class DiffEngine {

  constructor() {
    if (typeof diff_match_patch === 'undefined') {
      throw new Error('diff-match-patch 库未加载，请检查网络连接');
    }
    this.dmp = new diff_match_patch();
    this.mode = 'normal'; // 'strict' | 'normal' | 'loose'
  }

  /**
   * 设置比对模式
   * @param {'strict'|'normal'|'loose'} mode
   */
  setMode(mode) {
    this.mode = mode;
  }

  /**
   * 执行差异比对
   * @param {string} textA - 原件文本
   * @param {string} textB - 修订件文本
   * @returns {Array<DiffResult>} 差异结果数组
   */
  compare(textA, textB) {
    // 预处理文本
    let processedA = this._preprocess(textA);
    let processedB = this._preprocess(textB);

    // 空文本快速返回
    if (!processedA && !processedB) return [];
    if (!processedA) return [{ id: 1, type: 'insertion', text: processedB, index: 0, length: processedB.length }];
    if (!processedB) return [{ id: 1, type: 'deletion', text: processedA, index: 0, length: processedA.length }];

    // 执行diff
    const diffs = this.dmp.diff_main(processedA, processedB);

    // 防御性检查：diff_main 超时可能返回 null
    if (!diffs) {
      // 降级为整段对比
      if (processedA === processedB) return [];
      return [{
        id: 1,
        type: 'modification',
        oldText: processedA.substring(0, 100),
        newText: processedB.substring(0, 100),
        index: 0,
        oldLength: processedA.length,
        newLength: processedB.length,
      }];
    }

    // 优化diff结果（语义清理）
    this.dmp.diff_cleanupSemantic(diffs);

    // 后处理：根据模式过滤微小差异
    const filteredDiffs = this._filterByMode(diffs);

    // 转换为结构化差异结果
    return this._buildDiffResults(filteredDiffs, textA, textB);
  }

  /**
   * 文本预处理
   * @private
   */
  _preprocess(text) {
    let t = text;
    if (this.mode === 'loose') {
      // 宽松模式：统一空白字符
      t = t.replace(/\s+/g, ' ');
      // 统一全角/半角标点
      t = t.replace(/，/g, ',').replace(/。/g, '.').replace(/：/g, ':');
      t = t.replace(/（/g, '(').replace(/）/g, ')');
      t = t.replace(/"/g, '"').replace(/"/g, '"');
      t = t.replace(/'/g, "'").replace(/'/g, "'");
    } else if (this.mode === 'normal') {
      // 普通模式：仅合并多余空格
      t = t.replace(/[ \t]+/g, ' ');
    }
    return t;
  }

  /**
   * 根据模式过滤微小差异
   * @private
   */
  _filterByMode(diffs) {
    if (this.mode === 'strict') return diffs;

    const threshold = this.mode === 'loose' ? 3 : 1;
    const result = [];

    for (let i = 0; i < diffs.length; i++) {
      const [op, text] = diffs[i];

      // 跳过纯空白差异
      if (text.trim() === '' && text.length <= threshold) {
        // 如果前后都是相等操作，合并它们
        if (i > 0 && diffs[i - 1][0] === DIFF_EQUAL && i < diffs.length - 1 && diffs[i + 1][0] === DIFF_EQUAL) {
          continue;
        }
      }

      // 宽松模式下忽略极短差异（可能是OCR误差）
      if (this.mode === 'loose' && text.length <= threshold && op !== DIFF_EQUAL) {
        // 检查是否是标点差异
        const punctuationRegex = /^[，。：；（）、,.\-:;()\-—\s]+$/;
        if (punctuationRegex.test(text)) {
          continue;
        }
      }

      result.push([op, text]);
    }

    // 合并相邻的相同操作
    return this._mergeAdjacentDiffs(result);
  }

  /**
   * 合并相邻的相同操作类型
   * @private
   */
  _mergeAdjacentDiffs(diffs) {
    if (diffs.length === 0) return diffs;
    const merged = [diffs[0]];
    for (let i = 1; i < diffs.length; i++) {
      const last = merged[merged.length - 1];
      if (last[0] === diffs[i][0]) {
        last[1] += diffs[i][1];
      } else {
        merged.push(diffs[i][0] === undefined ? [DIFF_EQUAL, diffs[i][1]] : [...diffs[i]]);
      }
    }
    return merged;
  }

  /**
   * 构建结构化差异结果
   * @private
   * @returns {Array<DiffResult>}
   */
  _buildDiffResults(diffs, originalA, originalB) {
    const results = [];
    let index = 0;

    for (const [op, text] of diffs) {
      if (op === DIFF_EQUAL) {
        index += text.length;
        continue;
      }

      const diffResult = {
        id: results.length + 1,
        type: op === DIFF_DELETE ? 'deletion' : 'insertion',
        text: text,
        index: index,
        length: text.length,
      };

      // 检测是否为"修改"（连续的删除+新增）
      // 这在后续的pairing阶段处理

      results.push(diffResult);
      index += text.length;
    }

    // 配对删除和新增为"修改"
    return this._pairModifications(results);
  }

  /**
   * 将相邻的删除+新增配对为"修改"操作
   * @private
   */
  _pairModifications(results) {
    const paired = [];
    let i = 0;

    while (i < results.length) {
      const current = results[i];

      // 如果当前是删除，且下一个是新增，且它们在原文中位置相邻
      if (current.type === 'deletion' && i + 1 < results.length && results[i + 1].type === 'insertion') {
        const next = results[i + 1];
        // 判断是否为修改：位置接近且长度相似
        const posDiff = Math.abs(next.index - (current.index + current.length));
        const lengthRatio = Math.min(current.length, next.length) / Math.max(current.length, next.length, 1);

        if (posDiff <= 5 && lengthRatio > 0.3) {
          paired.push({
            id: paired.length + 1,
            type: 'modification',
            oldText: current.text,
            newText: next.text,
            index: current.index,
            oldLength: current.length,
            newLength: next.length,
          });
          i += 2;
          continue;
        }
      }

      paired.push(current);
      i++;
    }

    // 重新编号
    paired.forEach((d, idx) => d.id = idx + 1);
    return paired;
  }

  /**
   * 将差异映射到页面坐标
   * @param {Array<DiffResult>} diffs - 差异结果
   * @param {Array} textItemsA - 原件文本项（含坐标）
   * @param {Array} textItemsB - 修订件文本项（含坐标）
   * @returns {Array<MappedDiff>} 映射了坐标的差异
   */
  mapDiffsToCoordinates(diffs, textItemsA, textItemsB) {
    return diffs.map(diff => {
      if (diff.type === 'deletion') {
        return {
          ...diff,
          side: 'left',
          coordinates: this._findCoordinates(diff.text, diff.index, textItemsA),
        };
      } else if (diff.type === 'insertion') {
        return {
          ...diff,
          side: 'right',
          coordinates: this._findCoordinates(diff.text, diff.index, textItemsB),
        };
      } else if (diff.type === 'modification') {
        return {
          ...diff,
          side: 'both',
          oldCoordinates: this._findCoordinates(diff.oldText, diff.index, textItemsA),
          newCoordinates: this._findCoordinates(diff.newText, diff.index, textItemsB),
        };
      }
      return diff;
    });
  }

  /**
   * 在文本项中查找差异文本的坐标范围
   * @private
   */
  _findCoordinates(diffText, globalIndex, textItems) {
    // 构建全局索引到文本项的映射
    let currentIndex = 0;
    const matchedItems = [];

    for (const item of textItems) {
      if (currentIndex + item.str.length > globalIndex) {
        // 找到了起始位置所在的文本项
        const offsetInItem = globalIndex - currentIndex;
        matchedItems.push({
          ...item,
          offsetInItem: offsetInItem,
          remainingInItem: item.str.length - offsetInItem,
        });

        // 继续收集后续文本项直到覆盖整个差异文本
        let remaining = diffText.length - (item.str.length - offsetInItem);
        let j = textItems.indexOf(item) + 1;

        while (remaining > 0 && j < textItems.length) {
          matchedItems.push({
            ...textItems[j],
            offsetInItem: 0,
            remainingInItem: textItems[j].str.length,
          });
          remaining -= textItems[j].str.length;
          j++;
        }

        break;
      }
      currentIndex += item.str.length;
    }

    if (matchedItems.length === 0) return null;

    // 计算边界框
    const firstItem = matchedItems[0];
    const lastItem = matchedItems[matchedItems.length - 1];

    return {
      x: firstItem.x,
      y: firstItem.y - firstItem.fontSize, // 调整到文字顶部
      width: lastItem.x + lastItem.width - firstItem.x,
      height: firstItem.fontSize * 1.3,
      pageNum: firstItem.pageNum || 1,
      items: matchedItems,
    };
  }

  /**
   * 生成差异摘要统计
   * @param {Array<DiffResult>} diffs
   */
  getStats(diffs) {
    const stats = {
      total: diffs.length,
      deletions: 0,
      insertions: 0,
      modifications: 0,
    };

    for (const d of diffs) {
      if (d.type === 'deletion') stats.deletions++;
      else if (d.type === 'insertion') stats.insertions++;
      else if (d.type === 'modification') stats.modifications++;
    }

    return stats;
  }
}

// 导出
window.DiffEngine = DiffEngine;
