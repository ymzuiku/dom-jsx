(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.$verk = {}));
}(this, function (exports) { 'use strict';

  function AppendChild(...args) {
      args.forEach((item) => {
          this.prototype.appendChild(item);
      });
  }
  if (typeof HTMLElement.prototype.append === "undefined") {
      Element.prototype.append = AppendChild;
  }
  function Remove(...args) {
      if (this.prototype.parentNode) {
          this.prototype.parentNode.removeChild(this);
      }
  }
  if (typeof HTMLElement.prototype.remove === "undefined") {
      Element.prototype.remove = Remove;
  }
  function ReplaceWithPolyfill() {
      "use-strict"; // For safari, and IE > 10
      var parent = this.parentNode, i = arguments.length, currentNode;
      if (!parent)
          return;
      if (!i)
          // if there are no arguments
          parent.removeChild(this);
      while (i--) {
          // i-- decrements i and returns the value of i before the decrement
          currentNode = arguments[i];
          if (typeof currentNode !== "object") {
              currentNode = this.ownerDocument.createTextNode(currentNode);
          }
          else if (currentNode.parentNode) {
              currentNode.parentNode.removeChild(currentNode);
          }
          // the value of "i" below is after the decrement
          if (!i)
              // if currentNode is the first argument (currentNode === arguments[0])
              parent.replaceChild(currentNode, this);
          // if currentNode isn't the first
          else
              parent.insertBefore(currentNode, this.nextSibling);
      }
  }
  if (!Element.prototype.replaceWith)
      Element.prototype.replaceWith = ReplaceWithPolyfill;
  if (!CharacterData.prototype.replaceWith)
      CharacterData.prototype.replaceWith = ReplaceWithPolyfill;
  if (!DocumentType.prototype.replaceWith)
      DocumentType.prototype.replaceWith = ReplaceWithPolyfill;

  const events = new Set();
  const next = (focusUpdateTargets, ignoreUpdateTargets) => {
      let ignoreList;
      if (ignoreUpdateTargets) {
          if (typeof ignoreUpdateTargets === "string") {
              const list = document.body.querySelectorAll(ignoreUpdateTargets);
              ignoreList = new Set(list);
          }
          else {
              ignoreList = new Set(ignoreUpdateTargets);
          }
      }
      const outEle = [];
      if (focusUpdateTargets) {
          let eleList = document.body.querySelectorAll(`${focusUpdateTargets}[data-next], ${focusUpdateTargets} [data-next]`);
          eleList.forEach((ele) => {
              if (ignoreList && ignoreList.has(ele)) {
                  return;
              }
              if (ele.__next) {
                  ele.__next.forEach((fn) => {
                      fn();
                  });
                  outEle.push(ele);
              }
          });
      }
      events.forEach((fn) => fn());
      return outEle;
  };
  const subscribe = (fn) => {
      events.add(fn);
      return () => {
          events.delete(fn);
      };
  };
  const subscribeElement = (ele, key, fn) => {
      if (!ele.__next) {
          ele.setAttribute("data-next", key);
          ele.__next = new Map();
      }
      ele.__next.set(key, fn);
  };

  function loadable(createElementFn, args = [], { ref, loading, defaultKey = "default" } = {}) {
      if (!loading) {
          loading = document.createElement("input");
      }
      Promise.resolve(createElementFn(...args)).then((obj) => {
          const fn = obj[defaultKey];
          if (fn) {
              obj = fn(...args);
          }
          if (typeof obj === "function") {
              obj = obj(...args);
          }
          if (ref) {
              ref(obj);
          }
          loading && loading.replaceWith(obj);
      });
      return loading;
  }

  const cache = {};
  function stringToHex(str, start = "c") {
      const old = cache[str];
      if (old) {
          return start + old;
      }
      let val = "";
      for (let i = 0; i < str.length; i++) {
          if (val === "")
              val = str.charCodeAt(i).toString(36);
          else
              val += str.charCodeAt(i).toString(36);
      }
      cache[str] = val;
      return start + val;
  }

  let cssKeyNum = 0;
  const cssKeyMap = {};
  const cssCache = {};
  const UpKeys = {
      A: "-a",
      B: "-b",
      C: "-c",
      D: "-d",
      E: "-e",
      F: "-f",
      G: "-g",
      H: "-h",
      I: "-i",
      J: "-j",
      K: "-k",
      L: "-l",
      M: "-m",
      N: "-n",
      O: "-o",
      P: "-p",
      Q: "-q",
      R: "-r",
      S: "-s",
      T: "-t",
      U: "-u",
      V: "-v",
      W: "-w",
      X: "-x",
      Y: "-y",
      Z: "-z",
  };
  function styleAddCss({ ele, elKey, select, cssName, style }) {
      // 若ele旧的css一致，不执行
      const oldCssName = ele[elKey];
      if (oldCssName === cssName) {
          return;
      }
      // 设置旧的ele名称缓存和样式设定
      if (oldCssName) {
          ele.classList.replace(oldCssName, cssName);
      }
      else {
          ele.classList.add(cssName);
      }
      ele[elKey] = cssName;
      if (cssCache[cssName]) {
          return;
      }
      // 如果未创建类似的css，才创建
      let css = select + "{";
      Object.keys(style).forEach((k) => {
          if (k.indexOf("webkit") === 0) {
              k = k.replace("webkit", "--webkit");
          }
          let _k = "";
          for (let i = 0; i < k.length; i++) {
              const v = k[i];
              _k += UpKeys[v] || v;
          }
          css += _k + ":" + style[k] + " !important; ";
      });
      css += "}";
      if (/@media/.test(select)) {
          css += "}";
      }
      const el = document.createElement("style");
      el.id = cssName;
      el.textContent = css;
      cssCache[cssName] = true;
      document.head.appendChild(el);
  }
  function makeCss(ele, style, type, fn) {
      let cssName = stringToHex(JSON.stringify(style), type);
      // cssName 转化 为有序短名
      const oldCssNameNum = cssKeyMap[cssName];
      if (oldCssNameNum) {
          cssName = oldCssNameNum;
      }
      else {
          cssKeyNum += 1;
          cssKeyMap[cssName] = "cssinjs-" + cssKeyNum;
          cssName = cssKeyMap[cssName];
      }
      styleAddCss({
          ele,
          style,
          elKey: "__style_" + type,
          cssName,
          select: fn(cssName),
      });
  }
  const mediaKeys = {
      onExtraSmall: "480px",
      onSmall: "640px",
      onMiddle: "720px",
      onLarge: "1024px",
      onExtraLager: "1280px",
  };
  const pesudoKeys = {
      onActive: ":active",
      onFocus: ":focus",
      onFirstChild: ":first-child",
      onLastChild: ":last-child",
      onBlank: ":blank",
      onChecked: ":checked",
      onCurrent: ":current",
      onDisabled: ":disabled",
      onFocusWithin: ":focus-within",
      onInRange: ":in-range",
      onVisited: ":visited",
      onEven: ":nth-child(even)",
      onOdd: ":nth-child(odd)",
      onAfter: "::after",
      onBefore: "::before",
      onPlaceholderShown: ":placeholder-shown",
  };
  const _pseudoStyle = {};
  Object.keys(pesudoKeys).forEach((k) => {
      const v = pesudoKeys[k];
      _pseudoStyle[k] = (ele, style) => {
          makeCss(ele, style, k, (c) => `.${c}${v}`);
      };
  });
  const _mediaStyle = {};
  Object.keys(mediaKeys).forEach((k) => {
      const v = mediaKeys[k];
      _mediaStyle[k] = (ele, style) => {
          makeCss(ele, style, k, (c) => `@media (min-width:${v}) {.${c}`);
      };
  });
  const just = {
      start: "flex-start",
      center: "center",
      end: "flex-end",
      around: "space-around",
      between: "space-between",
      evenly: "space-evenly",
  };
  const align = {
      start: "flex-start",
      center: "center",
      end: "flex_end",
      stretch: "stretch",
      baseline: "baseline",
  };
  function setJustItem(ele, val) {
      const [a, b] = val.split("-");
      ele.style.display = "flex";
      ele.style.justifyContent = just[a];
      ele.style.alignItems = align[b];
  }
  const cssInJs = Object.assign({ onHover: (ele, style) => {
          makeCss(ele, style, "onHover", (c) => `@media (min-width:640px) {.${c}:hover`);
      } }, _mediaStyle, _pseudoStyle, { setRow: (ele, val) => {
          setJustItem(ele, val);
          ele.style.flexDirection = "row";
      }, setCol: (ele, val) => {
          setJustItem(ele, val);
          ele.style.flexDirection = "column";
      }, setNowrap: (ele, val) => {
          ele.style.whiteSpace = "nowrap";
          ele.style.overflow = "hidden";
          ele.style.wordBreak = "break-all";
          ele.style.textOverflow = val;
      } });

  const attrKeys = {
      autofocus: true,
  };
  function getValue(value) {
      return typeof value === "function" ? value() : value;
  }
  function bindFn(ele, key, value) {
      if (/^on/.test(key)) {
          ele[key] = value;
          return null;
      }
      if (/^listen/.test(key)) {
          ele.addEventListener(key.replace("listen", ""), value);
          return null;
      }
      let fn;
      if (attrKeys[key] || /-/.test(key)) {
          fn = () => {
              const v = getValue(value);
              if (ele.getAttribute(key) !== v) {
                  ele.setAttribute(key, v);
              }
          };
      }
      else if (key === "style") {
          if (typeof ele.className === "undefined") {
              ele.className = " ";
          }
          fn = () => {
              const v = getValue(value);
              if (!v) {
                  return;
              }
              if (typeof v === "string") {
                  ele.style.cssText = v;
                  return;
              }
              Object.keys(v).forEach((k) => {
                  const pesudo = cssInJs[k];
                  if (pesudo) {
                      pesudo(ele, v[k]);
                  }
                  else if (/-/.test(k)) {
                      ele.style.setProperty(k, v[k]);
                  }
                  else {
                      ele.style[k] = v[k];
                  }
              });
          };
      }
      else if (key === "className") {
          fn = () => {
              let v = getValue(value);
              if (Array.isArray(v)) {
                  v = v.join(" ");
              }
              if (ele.className !== v) {
                  ele.className = v;
              }
          };
      }
      else if (key === "classAdd") {
          if (typeof ele.className === "undefined") {
              ele.className = " ";
          }
          fn = () => {
              ele.className += " " + value;
          };
      }
      else if (key === "classReplace") {
          fn = () => {
              const v = getValue(value);
              if (!Array.isArray(v)) {
                  console.error("classReplace need return [string, string]");
                  return;
              }
              const newVal = ele.className.replace(v[0], v[1]);
              if (newVal !== ele.className) {
                  ele.className = newVal;
              }
          };
      }
      else if (key === "classPick") {
          if (typeof ele.className === "undefined") {
              ele.className = " ";
          }
          fn = () => {
              const v = getValue(value);
              if (!v) {
                  return;
              }
              Object.keys(v).forEach((k) => {
                  const right = v[k];
                  const hex = stringToHex(k);
                  if (!ele.__isFirstClassPick) {
                      ele.className += " " + (right ? k : hex) + " ";
                  }
                  else {
                      let newVal;
                      if (right) {
                          newVal = ele.className.replace(hex, k);
                      }
                      else {
                          newVal = ele.className.replace(k, hex);
                      }
                      if (newVal !== ele.className) {
                          ele.className = newVal;
                      }
                  }
              });
              ele.__isFirstClassPick = true;
          };
      }
      else {
          fn = () => {
              const v = getValue(value);
              if (ele[key] !== v) {
                  ele[key] = v;
              }
          };
      }
      fn();
      if (typeof value !== "function") {
          return null;
      }
      return fn;
  }

  const uiCaches = {};
  function addTag(data) {
      Object.keys(data).forEach((key) => {
          uiCaches[key] = data[key];
      });
  }
  function isString(obj) {
      const t = Object.prototype.toString.call(obj);
      if (t === "[object String]" || t === "[object Number]") {
          return true;
      }
  }
  function isElement(obj) {
      return Object.prototype.toString.call(obj).indexOf("lement") > 0;
  }

  // function clonePropElement(old: Element, next: Element): string | undefined {
  //   const len = old.childNodes.length;
  //   const isText = len === 1 && (old.textContent || next.textContent);
  //   if (
  //     isText ||
  //     old.tagName !== next.tagName ||
  //     len !== next.childNodes.length
  //   ) {
  //     old.replaceWith(next);
  //     delete (old as any).__next;
  //     return "replace";
  //   }
  //   // delete (next as any).__next;
  //   // next.querySelectorAll("*").forEach((e: any) => {
  //   //   delete e.__next;
  //   // });
  //   for (let i = 0; i < next.attributes.length; i++) {
  //     const attr = next.attributes.item(i)!;
  //     if (old.getAttribute(attr.name) !== attr.value) {
  //       old.setAttribute(attr.name, attr.value);
  //     }
  //   }
  //   Object.keys(next).forEach((k) => {
  //     const v = (next as any)[k];
  //     if ((old as any)[k] !== v) {
  //       (old as any)[k] = v;
  //     }
  //   });
  // }
  function deepCloneElement(old, next) {
      // if (
      //   isText ||
      //   old.tagName !== next.tagName ||
      //   len !== next.childNodes.length
      // ) {
      //   old.replaceWith(next);
      //   delete (old as any).__next;
      //   return "replace";
      // }
      old.replaceWith(next);
      return;
      // const isReplace = clonePropElement(old, next);
      // if (isReplace === "replace") {
      //   return;
      // }
      // next.querySelectorAll("*").forEach((ne) => {
      //   old.querySelectorAll("*").forEach((oe) => {
      //     clonePropElement(oe as any, ne as any);
      //   });
      // });
  }
  function parseChildren(_childs, ele) {
      if (!Array.isArray(_childs)) {
          return;
      }
      // ele.innerText = "";
      // 递归 Array
      const childs = _childs.filter((v) => v !== undefined && v !== null);
      childs.forEach((ch, index) => {
          if (isString(ch)) {
              const text = document.createTextNode(ch);
              text.key = index;
              ele.append(text);
          }
          else if (typeof ch === "function") {
              const temp = document.createTextNode("");
              ele.append(temp);
              const fn = () => {
                  const child = ch();
                  if (isString(child)) {
                      const text = document.createTextNode(child);
                      text.key = index;
                      let isHave = false;
                      ele.childNodes.forEach((e) => {
                          if (e.key === text.key) {
                              // 如果内容一致，不更新
                              if (e.textContent === text.textContent) {
                                  isHave = true;
                                  return;
                              }
                              e.replaceWith(text);
                              isHave = true;
                          }
                      });
                      if (!isHave) {
                          ele.insertBefore(text, temp);
                      }
                      return index;
                  }
                  else if (Array.isArray(child)) {
                      // 函数返回一个数组
                      const oldKeys = {};
                      const childKeys = {};
                      child.forEach((c, i) => {
                          c.___forList = index;
                          if (!c.key) {
                              c.key = `fn(${index})-list(${i})`;
                          }
                          childKeys[c.key] = c;
                      });
                      // 找到之前的list元素，并且删除现在key没有的，然后array转map
                      const needRemove = [];
                      ele.childNodes.forEach((el) => {
                          if (el.___forList === index) {
                              if (!childKeys[el.key]) {
                                  needRemove.push(el);
                              }
                              else {
                                  oldKeys[el.key] = el;
                              }
                          }
                      });
                      needRemove.forEach((e) => {
                          e.remove();
                      });
                      // 遍历数组，替换旧的元素或插入之前没有的
                      child.forEach((c, i) => {
                          const oldEl = oldKeys[c.key];
                          if (oldEl) {
                              if (!oldEl.isEqualNode(c)) {
                                  deepCloneElement(oldEl, c);
                              }
                          }
                          else {
                              ele.insertBefore(c, temp);
                              // ele.append(c);
                          }
                      });
                      return "for-list-" + index;
                  }
                  else if (child) {
                      if (!child.key) {
                          child.key = index;
                      }
                      let isHave = false;
                      ele.childNodes.forEach((e) => {
                          if (e.key === child.key) {
                              deepCloneElement(e, child);
                              isHave = true;
                          }
                      });
                      if (!isHave) {
                          ele.insertBefore(child, temp);
                      }
                      return child.key;
                  }
              };
              fn();
              subscribeElement(ele, "childfn-" + index, fn);
          }
          else if (isElement(ch)) {
              ele.append(ch);
          }
          else {
              ele.append(dom(...ch));
          }
      });
  }

  function waitAppend(ele, max = 400) {
      let n = 0;
      return new Promise((res, rej) => {
          const check = () => {
              if (document.body.contains(ele)) {
                  res(ele);
              }
              else if (n < max) {
                  n++;
                  setTimeout(check, 20 + n);
              }
              else {
                  rej(ele);
              }
          };
          check();
      });
  }

  const ignoreKeys = {
      class: 1,
      className: 1,
      classAdd: 1,
      classPick: 1,
      classExtends: 1,
      onsubmit: 1,
      for: 1,
      fixFor: 1,
      replace: 1,
      oncreate: 1,
      onappend: 1,
      child: 1,
      children: 1,
      length: 1,
      // __propsKeys: 1,
      __proxy: 1,
      __proxyEle: 1,
  };
  const classKeys = ["className", "classReplace", "classPick", "classAdd"];
  const cssCache$1 = {};
  const dom = (tag, attrs, ...child) => {
      let props = {};
      // 兼容第二个参数，attrs是child
      if (attrs &&
          (typeof attrs === "function" ||
              Array.isArray(attrs) ||
              isString(attrs) ||
              isElement(attrs))) {
          child = [attrs, ...child];
      }
      else if (attrs) {
          props = attrs;
      }
      props.children = [...child];
      if (props.class) {
          props.className = props.class;
      }
      if (typeof tag === "function") {
          return tag(props, ...child);
      }
      if (Array.isArray(tag)) {
          return dom(...tag);
      }
      let ele;
      // 若 tag 是一个函数组件，attrs 就作为 props 使用，并且实力化这个组件
      if (typeof tag === "string") {
          if (uiCaches[tag]) {
              ele = loadable(uiCaches[tag], [props, ...child]);
              return ele;
          }
          else if (tag === "style") {
              // style 元素只往 head 中添加一次
              if (child && typeof child[0] === "string") {
                  const cssTxt = child[0];
                  if (!cssCache$1[cssTxt]) {
                      cssCache$1[cssTxt] = true;
                      const sty = document.createElement("style");
                      sty.textContent = cssTxt;
                      document.head.append(sty);
                  }
              }
              return document.createTextNode("");
          }
          else {
              ele = document.createElement(tag);
          }
      }
      else if (isElement(tag)) {
          ele = tag;
      }
      if (props.onsubmit) {
          ele.onsubmit = (e) => {
              e.preventDefault();
              props.onsubmit && props.onsubmit(e);
          };
      }
      classKeys.forEach((key) => {
          if (props[key]) {
              const fn = bindFn(ele, key, props[key]);
              if (fn) {
                  subscribeElement(ele, key, fn);
              }
          }
      });
      Object.keys(props).forEach((key) => {
          if (ignoreKeys[key]) {
              return;
          }
          const fn = bindFn(ele, key, props[key]);
          if (fn) {
              subscribeElement(ele, key, fn);
          }
      });
      parseChildren(child, ele);
      if (typeof props.oncreate === "function") {
          props.oncreate(ele);
      }
      if (typeof props.onappend === "function") {
          waitAppend(ele).then(props.onappend);
      }
      return ele;
  };
  const domFrag = (...attrs) => {
      console.error("Dont Use Frag JSX");
  };
  window.domJSX = dom;

  // background: var(--primary1-1.0);
  let colors = "";
  const colorsList = [
      "primary",
      "gray",
      "red",
      "orange",
      "yellow",
      "green",
      "teal",
      "blue",
      "indigo",
      "purple",
      "pink",
      "light",
      "dark",
  ];
  colorsList.forEach((v) => {
      for (let i = 1; i <= 9; i++) {
          colors += `--${v}${i}-0:rgba(var(--${v}${i}-base), 0); `;
          for (let a = 1; a <= 8; a++) {
              colors += `--${v}${i}-${a}:rgba(var(--${v}${i}-base), 0.${a}); `;
          }
          colors += `--${v}${i}:rgba(var(--${v}${i}-base), 1); `;
      }
  });
  ["white", "black"].forEach((v) => {
      colors += `--${v}-0:rgba(var(--${v}-base), 0); `;
      for (let a = 1; a <= 8; a++) {
          colors += `--${v}-${a}:rgba(var(--${v}-base), 0.${a}); `;
      }
      colors += `--${v}:rgba(var(--${v}-base), 1); `;
  });
  const mini = "mini-scrollbar";
  const hidden = "mini-scrollbar-hidden";
  const scrollbar = `
:root {
  --mini-scrollbar-color: 150,151,155;
  --mini-scrollbar-bg: 100,101,105;
  --mini-scrollbar-bg-opacity: 0;
  --mini-scrollbar-color-opacity:.45;
  --mini-scrollbar-hover: 150,151,155;
  --mini-scrollbar-hover-opacity:.65;
  --mini-scrollbar-size: 6px;
}
.${mini} {
  -webkit-overflow-scrolling: touch;
}
.${mini}::-webkit-scrollbar {
  width: var(--mini-scrollbar-size);
  height: var(--mini-scrollbar-size);
}
.${mini}::-webkit-scrollbar-track {
  background: rgba(var(--mini-scrollbar-bg), var(--mini-scrollbar-bg-opacity));
}
.${mini}::-webkit-scrollbar-thumb {
  border-radius: 0px;
  background: rgba(var(--mini-scrollbar-color), var(--mini-scrollbar-color-opacity));
}
.${mini}::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--mini-scrollbar-hover), var(--mini-scrollbar-hover-opacity));
}
.${hidden}::-webkit-scrollbar-thumb {
  background: rgba(100, 100, 100, 0) !important;
}
`;
  const baseCss = `
html{-webkit-text-size-adjust:100%} main{display:block}h1{font-size:2em;margin:.67em 0}hr{box-sizing:content-box;height:0;overflow:visible}pre{font-family:monospace,monospace;font-size:1em}a{background-color:transparent}abbr[title]{border-bottom:none;text-decoration:underline;text-decoration:underline dotted}b,strong{font-weight:bolder}code,kbd,samp{font-family:monospace,monospace;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}img{border-style:none}button,input,optgroup,select,textarea{font-family:inherit;font-size:100%;line-height:1.15;margin:0}button,input{overflow:visible}button,select{text-transform:none}[type=button],[type=reset],[type=submit],button{-webkit-appearance:button}[type=button]::-moz-focus-inner,[type=reset]::-moz-focus-inner,[type=submit]::-moz-focus-inner,button::-moz-focus-inner{border-style:none;padding:0}[type=button]:-moz-focusring,[type=reset]:-moz-focusring,[type=submit]:-moz-focusring,button:-moz-focusring{outline:1px dotted ButtonText}fieldset{padding:.35em .75em .625em}legend{box-sizing:border-box;color:inherit;display:table;max-width:100%;padding:0;white-space:normal}progress{vertical-align:baseline}textarea{overflow:auto}[type=checkbox],[type=radio]{box-sizing:border-box;padding:0}[type=number]::-webkit-inner-spin-button,[type=number]::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}[type=search]::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}details{display:block}summary{display:list-item}template{display:none}[hidden]{display:none}
.full { width:100%; height:100%; }
body {line-height:1.15; padding:0px; margin:0px; font-size:16px; font-family:var(--sans);}
`;
  const baseClassCss = `
.flex-1 {
  flex:1 1 auto;
}
div, p, h1, h2, h3, h4, h5, h6, span, i {
  -webkit-font-smoothing: antialiased; 
  -moz-osx-font-smoothing: grayscale;
}
.remove-default-style, .remove-default-style * {
  margin: 0;
  border-width: 0;
  border-style: solid;
  border-color: currentColor;
  -webkit-tap-highlight-color: transparent;
  outline:0;
  text-decoration:none;
  list-style: none;
}
button.remove-default-style, .remove-default-style button {
  background: rgba(0,0,0,0);
}
a.remove-default-style {
  color: rgb(var(--font));
  text-decoration:none;
}
ol.remove-default-style, ul.remove-default-style {
  list-style: none;
  margin: 0;
  padding: 0;
}
.remove-default-style img, img.remove-default-style, image.remove-default-style {
  object-fit: cover;
  object-position: 50% 50%;
}
img.remove-default-style,svg.remove-default-style,video.remove-default-style,canvas.remove-default-style,audio.remove-default-style,iframe.remove-default-style,embed.remove-default-style,object.remove-default-style {
  display: block;
  vertical-align: middle;
}
.display-none {
  display:none;
}
.display-flex {
  display:flex;
}
.display-block {
  display:block;
}
.display-inline-block {
  display:inline-block;
}
.all-unset {
  all: unset;
  white-space: inherit;
  text-overflow: inherit;
  overflow: inherit;
}

.sans	{font-family: var(--sans)}
.serif {font-family: var(--serif)}
.mono	{font-family: var(--mono)}
.smoothing { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
.smoothing-auto { -webkit-font-smoothing: auto; -moz-osx-font-smoothing: auto; }
.outline-none {outline:none}
@keyframes spin { 0% {transform: rotate(0deg);} 100% {transform: rotate(359deg);}}
`;
  const baseCssValueString = `
--xs: 480px;
--sm: 640px;
--md: 720px;
--lg: 1024px;
--xl: 1280px;
--tip: 0.5em;
--info: .75em;
--sub: .875em;
--text: 1em;
--title: 1.125em;
--t1: 0.12s;
--t2: 0.2s;
--t3: 0.3s;
--t4: 0.5s;
--t5: 0.7s;
--t6: 1s;
--h6: 1.25em;
--h5: 1.5em;
--h4: 1.875em;
--h3: 2.25em;
--h2: 3em;
--h1: 4em;
--fs1: 10px;
--fs2: 12px;
--fs3: 14px;
--fs4: 16px;
--fs5: 18px;
--fs6: 20px;
--0: 0px;
--auto: auto;
--px: 1px;
--a1: 2px;
--a2: 4px;
--a3: 6px;
--a4: 8px;
--a5: 12px;
--a6: 16px;
--b1: 24px;
--b2: 34px;
--b3: 48px;
--b4: 64px;
--b5: 72px;
--b6: 80px;
--c1: 180px;
--c2: 260px;
--c3: 340px;
--c4: 420px;
--c5: 500px;
--c6: 580px;
--max: 3000px;
--white-base: 255,255,255;
--black-base: 0,0,0;
--primary1-base: 236,244,255;
--primary2-base: 195,218,254;
--primary3-base: 162,191,250;
--primary4-base: 127,156,244;
--primary5-base: 102,126,234;
--primary6-base: 89,104,216;
--primary7-base: 76,82,191;
--primary8-base: 67,64,144;
--primary9-base: 60,54,107;
--gray1-base: 247,250,252;
--gray2-base: 237,242,246;
--gray3-base: 226,232,240;
--gray4-base: 204,213,224;
--gray5-base: 160,174,192;
--gray6-base: 113,128,150;
--gray7-base: 73,85,104;
--gray8-base: 44,55,72;
--gray9-base: 26,32,44;
--red1-base: 254,245,245;
--red2-base: 255,215,215;
--red3-base: 254,178,178;
--red4-base: 246,173,84;
--red5-base: 236,137,54;
--red6-base: 221,106,31;
--red7-base: 192,85,33;
--red8-base: 155,66,33;
--red9-base: 123,52,30;
--orange1-base: 255,250,240;
--orange2-base: 255,235,200;
--orange3-base: 251,211,141;
--orange4-base: 246,173,84;
--orange5-base: 236,137,54;
--orange6-base: 221,106,31;
--orange7-base: 192,85,33;
--orange8-base: 155,66,33;
--orange9-base: 123,52,30;
--yellow1-base: 255,255,240;
--yellow2-base: 255,252,191;
--yellow3-base: 250,240,136;
--yellow4-base: 245,224,94;
--yellow5-base: 235,200,75;
--yellow6-base: 215,158,46;
--yellow7-base: 182,121,31;
--yellow8-base: 151,90,23;
--yellow9-base: 116,65,16;
--green1-base: 240,255,244;
--green2-base: 198,246,213;
--green3-base: 155,230,180;
--green4-base: 104,211,145;
--green5-base: 72,187,129;
--green6-base: 56,161,105;
--green7-base: 47,132,90;
--green8-base: 39,104,73;
--green9-base: 33,84,61;
--teal1-base: 230,255,250;
--teal2-base: 177,245,234;
--teal3-base: 129,231,217;
--teal4-base: 78,209,197;
--teal5-base: 55,179,172;
--teal6-base: 49,151,149;
--teal7-base: 46,122,123;
--teal8-base: 39,94,97;
--teal9-base: 35,78,82;
--blue1-base: 235,248,255;
--blue2-base: 190,227,248;
--blue3-base: 144,205,244;
--blue4-base: 98,179,237;
--blue5-base: 66,153,225;
--blue6-base: 49,130,206;
--blue7-base: 43,109,176;
--blue8-base: 44,82,130;
--blue9-base: 43,67,101;
--indigo1-base: 236,244,255;
--indigo2-base: 195,218,254;
--indigo3-base: 162,191,250;
--indigo4-base: 127,156,244;
--indigo5-base: 102,126,234;
--indigo6-base: 89,104,216;
--indigo7-base: 76,82,191;
--indigo8-base: 67,64,144;
--indigo9-base: 60,54,107;
--purple1-base: 250,245,255;
--purple2-base: 233,217,253;
--purple3-base: 215,188,250;
--purple4-base: 182,147,244;
--purple5-base: 159,121,234;
--purple6-base: 128,90,213;
--purple7-base: 108,71,193;
--purple8-base: 85,60,154;
--purple9-base: 67,51,122;
--pink1-base: 255,245,247;
--pink2-base: 255,214,226;
--pink3-base: 251,182,206;
--pink4-base: 245,136,179;
--pink5-base: 237,99,166;
--pink6-base: 214,63,140;
--pink7-base: 184,50,128;
--pink8-base: 151,39,109;
--pink9-base: 112,35,89;
--light1-base: 255,255,255;
--light2-base: 250,250,250;
--light3-base: 245,245,245;
--light4-base: 240,240,240;
--light5-base: 233,233,233;
--light6-base: 227,227,227;
--light7-base: 220,220,220;
--light8-base: 215,215,215;
--light9-base: 209,209,209;
--dark1-base: 0,0,0;
--dark2-base: 31,31,31;
--dark3-base: 48,48,48;
--dark4-base: 60,60,60;
--dark5-base: 75,75,75;
--dark6-base: 92,92,92;
--dark7-base: 108,108,108;
--dark8-base: 122,122,122;
--dark9-base: 133,133,133;
${colors}
--shadow-px: 0 0 0 2px;
--shadow-out: 0 0 0 3px;
--shadow-xs: 0 1px 2px 0;
--shadow-sm: 0 4px 6px -1px;
--shadow-md: 0 10px 15px -3px;
--shadow-lg: 0 20px 25px -5px;
--shadow-xl: 0 25px 50px -12px;
--ease: cubic-bezier(0.23, 1, 0.32, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
--serif: Georgia, Cambria, "Times New Roman", Times, serif;
--mono: Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;
`;
  function setRootCssValues() {
      const el = document.createElement("style");
      el.id = "root-css-value";
      el.innerHTML = `
:root {${baseCssValueString}}
.base-css-values {${baseCssValueString}}
${baseCss}
${baseClassCss}
${scrollbar}
`;
      document.head.appendChild(el);
  }

  function propFn(target, fn) {
      if (typeof target === "function") {
          return () => fn(target());
      }
      return fn(target);
  }

  setRootCssValues();
  window.dom = dom;
  window.next = next;

  exports.addTag = addTag;
  exports.dom = dom;
  exports.domFrag = domFrag;
  exports.events = events;
  exports.isElement = isElement;
  exports.next = next;
  exports.propFn = propFn;
  exports.stringToHex = stringToHex;
  exports.subscribe = subscribe;
  exports.subscribeElement = subscribeElement;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
