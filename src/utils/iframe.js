export const iframeOrigin = window.location.href.match('filoop.com')
  ? 'https://www.filoink.cn'
  : 'http://172.16.1.16:4000';

export const iframeSrc = `${iframeOrigin}/blank.html`;

export const iframeSendMessage = msg => {
  const ifr = window.frames[0];
  if (ifr) ifr.postMessage(JSON.stringify(msg), iframeOrigin);
};
