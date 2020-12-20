# dom-jsx

使用 jsx 开发 native-js 程序, 每个组建都是一个原始的 HTMLElment，可以和所有原生 js 库很好的兼容使用。

## 安装

```sh
$ npm init dom-jsx <project-name>
$ cd <project-name>
$ yarn install
$ yarn dev
```

## 开始

```tsx
import "dom-jsx";

function App({ name }: { name: string }) {
  let num = 0;
  return (
    <div class="app">
      <h1>Hello {name}</h1>
      <p>{() => num}</p>
      <button
        onclick={() => {
          num += 1;
          next(".app");
        }}
      >
        Add num
      </button>
    </div>
  );
}

document.body.append(App({ name: "World" }));
```
