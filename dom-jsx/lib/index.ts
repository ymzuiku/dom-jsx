import "./polyfillIE";
import { dom, domFrag } from "./dom";
import { events, next, subscribe, subscribeElement } from "./state";
import { addTag, isElement } from "./helper";
import { setRootCssValues } from "./setRootCssValues";
import { propFn } from "./propFn";
import { stringToHex } from "./stringToHex";

setRootCssValues();

(window as any).dom = dom;
(window as any).next = next;
if (!(window as any).React) {
  (window as any).React = {
    createElement: (window as any).dom,
  };
}

export {
  stringToHex,
  propFn,
  addTag,
  dom,
  domFrag,
  isElement,
  events,
  next,
  subscribe,
  subscribeElement,
};
