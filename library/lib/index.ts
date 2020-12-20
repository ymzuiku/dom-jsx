import "./polyfillIE";
import { dom, domFrag } from "./dom";
import { events, next, subscribe, subscribeElement } from "./state";
import { registerTag, isElement } from "./helper";
import { propFn } from "./propFn";
import { stringToHex } from "./stringToHex";

(window as any).next = next;

export { stringToHex, propFn, registerTag, dom, domFrag, isElement, events, next, subscribe, subscribeElement };
