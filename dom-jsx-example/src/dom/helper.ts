export const uiCaches: any = {};

export function addTag(data: { [key: string]: any }) {
  Object.keys(data).forEach((key) => {
    uiCaches[key] = data[key];
  });
}

export function isString(obj: any) {
  const t = Object.prototype.toString.call(obj);
  if (t === "[object String]" || t === "[object Number]") {
    return true;
  }
}
export function isElement(obj: any) {
  return Object.prototype.toString.call(obj).indexOf("lement") > 0;
}