export function waitAppend(ele: HTMLElement, max = 400): Promise<HTMLElement> {
  let n = 0;
  return new Promise((res, rej) => {
    const check = () => {
      if (document.body.contains(ele)) {
        res(ele);
      } else if (n < max) {
        n++;
        requestAnimationFrame(check);
      } else {
        rej(ele);
      }
    };
    check();
  });
}
