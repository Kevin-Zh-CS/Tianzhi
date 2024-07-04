// import { parse } from 'querystring';
// import pathRegexp from 'path-to-regexp';
export const checkIsNumber = value => value !== null && !Number.isNaN(Number(value));

export const scrollToTop = query => {
  const elm = document.querySelector(query);
  if (elm) elm.scrollTop = 0;
};

export const scrollMainToTop = () => scrollToTop('.quanta-control-main');
export const formItemLayout = {
  labelCol: { style: { width: 76, textAlign: 'left' } },
  wrapperCol: { span: 17 },
};
