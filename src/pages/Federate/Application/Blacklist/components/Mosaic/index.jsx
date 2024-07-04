import React, { useEffect, useRef } from 'react';
import _ from 'lodash';
import styles from './index.less';
import { useWindowSize } from './windowSize';

function Mosaic() {
  let ctx = null;

  const canvas = useRef(null);
  const timer = useRef(null);
  const PADDING = 1;
  const CELL_SIZE = 18;
  const MOSAIC_SIZE = CELL_SIZE - 2 * PADDING;
  const BASE_COLOR = 'lightblue';
  const cellArr = []; // 网格数组
  const windowSize = useWindowSize();
  const isFullscreen =
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement;

  class Cell {
    constructor(key, x, y) {
      this.id = key;
      this.x = x;
      this.y = y;
      this.opacity = this.getOpacity();
      this.painted = false;
    }

    getOpacity() {
      this.opacity = Math.max(0.05, Math.random() - 0.8);
      return this.opacity;
    }

    draw() {
      if (this.painted) return;
      const X = this.x + PADDING;
      const Y = this.y + PADDING;
      ctx.globalAlpha = this.getOpacity();
      ctx.fillRect(X, Y, MOSAIC_SIZE, MOSAIC_SIZE);
      this.painted = true;
    }

    clear() {
      if (!this.painted) return;
      const X = this.x + PADDING;
      const Y = this.y + PADDING;
      ctx.clearRect(X, Y, MOSAIC_SIZE, MOSAIC_SIZE);
      this.painted = false;
    }
  }

  function print() {
    // eslint-disable-next-line no-restricted-syntax
    for (const cell of cellArr) {
      cell.draw();
    }
  }

  function update() {
    // 从cellArr中随机筛选出百分之一个cell进行重绘
    // eslint-disable-next-line no-bitwise
    _.sampleSize(cellArr, (0.5 + cellArr.length / 100) | 0).forEach(cell => {
      cell.clear();
      cell.draw();
    });
    // eslint-disable-next-line no-restricted-syntax
    // for (const cell of cellArr) {
    //   cell.clear();
    //   cell.draw();
    // }
    timer.current = window.requestAnimationFrame(update);
  }

  function init() {
    canvas.current.width = document.body.clientWidth;
    canvas.current.height = window.innerHeight - 50;
    if (isFullscreen) {
      canvas.current.height = window.innerHeight;
    }
    ctx = canvas.current.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.fillStyle = BASE_COLOR;
    let id = 0;

    for (let i = 0; i < canvas.current.width; i += CELL_SIZE) {
      for (let j = 0; j < canvas.current.height; j += CELL_SIZE) {
        // eslint-disable-next-line no-plusplus
        const cell = new Cell(id++, i, j);
        cellArr.push(cell);
      }
    }
    print();
    timer.current = window.requestAnimationFrame(update);
  }

  useEffect(() => {
    init();
    return () => {
      window.cancelAnimationFrame(timer.current);
      timer.current = null;
    };
  }, [windowSize, isFullscreen]);

  return <canvas ref={canvas} className={styles.canvas} />;
}

export default Mosaic;
