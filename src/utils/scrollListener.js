// 添加事件监听
export const regScroll = myHandler => {
  if (window.onscroll === null) {
    window.onscroll = myHandler;
  } else if (typeof window.onscroll === 'function') {
    const oldHandler = window.onscroll;
    window.onscroll = () => {
      myHandler();
      oldHandler();
    };
  }
};

// 监听窗口变化
export const regResize = myHandler => {
  if (window.onresize === null) {
    window.onresize = myHandler;
  } else if (typeof window.onresize === 'function') {
    const oldHandler = window.onresize;
    window.onresize = () => {
      myHandler();
      oldHandler();
    };
  }
};

// 删除所有事件监听
export const removeScrollHandler = () => {
  window.onscroll = '';
  window.onresize = '';
};

// 滚动窗口兼容
export const windowScrollTo = height => {
  document.documentElement.scrollTop = height;
  document.body.scrollTop = height;
  // if (document.documentElement.scrollTop) {
  //   document.documentElement.scrollTop = height;
  // }
  // if (document.body.scrollTop) {
  //   document.body.scrollTop = height;
  // }
};
