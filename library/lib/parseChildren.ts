import { dom } from "./dom";
import { isElement, isString } from "./helper";
import { subscribeElement } from "./state";

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

function deepCloneElement(old: Element, next: Element) {
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

export function parseChildren(_childs: any[], ele: HTMLElement) {
  if (!Array.isArray(_childs)) {
    return;
  }

  // ele.innerText = "";
  // 递归 Array

  const childs = (_childs as any).filter(
    (v: any) => v !== undefined && v !== null
  );

  childs.forEach((ch: any, index: number) => {
    if (isString(ch)) {
      const text = document.createTextNode(ch) as any;
      text.key = index;
      ele.append(text);
    } else if (typeof ch === "function") {
      const temp = document.createTextNode("");
      ele.append(temp);
      const fn = () => {
        const child = ch();
        if (isString(child)) {
          const text = document.createTextNode(child) as any;
          text.key = index;
          let isHave = false;
          ele.childNodes.forEach((e) => {
            if ((e as any).key === text.key) {
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
        } else if (Array.isArray(child)) {
          // 函数返回一个数组
          const oldKeys = {} as any;
          const childKeys = {} as any;
          child.forEach((c, i) => {
            c.___forList = index;
            if (!c.key) {
              c.key = `fn(${index})-list(${i})`;
            }
            childKeys[c.key] = c;
          });

          // 找到之前的list元素，并且删除现在key没有的，然后array转map
          const needRemove = [] as HTMLElement[];
          ele.childNodes.forEach((el: any) => {
            if (el.___forList === index) {
              if (!childKeys[el.key]) {
                needRemove.push(el);
              } else {
                oldKeys[el.key] = el;
              }
            }
          });
          needRemove.forEach((e) => {
            e.remove();
          });

          // 遍历数组，替换旧的元素或插入之前没有的
          child.forEach((c, i) => {
            const oldEl = oldKeys[c.key] as HTMLElement;
            if (oldEl) {
              if (!oldEl.isEqualNode(c)) {
                deepCloneElement(oldEl, c);
              }
            } else {
              ele.insertBefore(c, temp);
              // ele.append(c);
            }
          });
          return "for-list-" + index;
        } else if (child) {
          if (!child.key) {
            child.key = index;
          }
          let isHave = false;
          ele.childNodes.forEach((e) => {
            if ((e as any).key === child.key) {
              deepCloneElement(e as any, child);
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
    } else if (isElement(ch)) {
      ele.append(ch);
    } else {
      ele.append((dom as any)(...ch));
    }
  });
}
