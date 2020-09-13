import { JSDOM } from 'jsdom';

function copyProps<S, T>(src: S, target: T): void {
  Object.defineProperties(target, {
    ...Object.getOwnPropertyDescriptors(src),
    ...Object.getOwnPropertyDescriptors(target),
  });
}

export function mockBrowser(): void {
  const jsdom = new JSDOM('');
  const { window, reconfigure } = jsdom;

  window.fetch = () => Promise.resolve(new Response());

  global['window'] = window as unknown as Window & typeof globalThis;

  global['document'] = window.document;
  global['navigator'] = window.navigator;
  global['reconfigure'] = reconfigure.bind(jsdom);
  (<any>global.requestAnimationFrame) = function(callback) {
    return setTimeout(callback, 0);
  };
  global.cancelAnimationFrame = function(id) {
    clearTimeout(id);
  };
  copyProps(window, global);
}
