# dom-jsx

使用 jsx 开发 native-js 程序, 每个组建都是一个原始的 HTMLElment，可以和所有原生 js 库很好的兼容使用。

dom-jsx 非常小, gzip: 3.5kb

## 安装

```sh
$ npm init dom-jsx <project-name>
$ cd <project-name>
$ yarn install
$ yarn dev
```

## API

next 是 dom-jsx 的一个全局函数，dom-jsx 也仅有此一个 API

```ts
declare const next: (
  focusUpdateTargets?: string | undefined,
  ignoreUpdateTargets?: string | any[] | undefined
) => HTMLElement[];
```

## 很短且完整的教程

如果你会 React，学习 dom-jsx 只需要 5 分钟，`注意 dom-jsx 并不是 React 的轮子`。

dom-jsx 仅仅保留了 JSX 相关的概念，移除了 React 所有非 JSX 相关的概念，所以 dom-jsx 没有生命周期，hooks、diffDOM。

但是 dom-jsx 可以完成所有 React 能完成的项目，为了弥补缺少 React 相关的概念，看看我们是怎么做的：

前端开发可以抽象为两部分：页面绘制、页面更新；在 dom-jsx 中，页面绘制就是使用 jsx 语法组织原始的 HTMLElement；然后使用 `函数赋值` 来解决元素更新。

`函数赋值`: 即在声明元素的过程中，给属性绑定一个函数，jsx 解析过程中，若发现属性是一个函数，记录一个发布订阅任务，然后则执行函数，并且赋值；在未来需要更新此属性时，使用 `next` 函数对文档进行选择，命中的**元素及其子元素**会执行之前订阅的任务，更新属性。

我们看一个例子

```tsx
import "dom-jsx";

// 这是一个普通的 jsx 组件
function App() {
  return (
    <div class="app">
      <h1>Hello World</h1>
      {/* 传递 props.name */}
      <StatefulExample name="Add Num" />
    </div>
  );
}

// 这是一个用于演示 函数赋值/更新 的组件
function StatefulExample({ name }: { name: string }) {
  console.log(
    "这个日志仅会打印一次，因为next更新仅仅会派发元素的子属性，不会重绘整个组件"
  );
  let num = 0;
  return (
    <div>
      <button
        onclick={() => {
          num += 1;
          // next 会使用 document.body.querySelectorAll() 查询并更新 `.add` 匹配的元素及子元素
          next(".add");
        }}
      >
        {name}
      </button>
      {/* 使用【函数赋值】更新样式 */}
      <div
        class="add"
        style={() => ({
          fontSize: 20 + num + "px",
        })}
      >
        {/* 使用【函数赋值】文字 */}
        <p>{() => num}</p>
      </div>
    </div>
  );
}

document.body.append(App());
```

## 设计细节

1. 为了延续声明式的开发方式，`next` 函数并没有传递值，仅仅是派发了更新命令，元素的属性还是由内部状态管理的逻辑来解决状态分支问题
2. 我们移除了类似 React 中 SCU，purecomponent、memo 等解决重绘问题的概念，因为**一次** next 执行仅仅更新**一次**局部元素的**属性**，并不会造成大规模重绘
3. next 已经是全局可选则的更新，所以失去了传统的状态管理库的必要；合理规范好 next 的调用即可。

## 生态

dom-jsx 的核心设计理念就是用原生 JS 解决生态问题，任何一个函数，其返回值是一个 HTMLElement，就可以在 dom-jsx 中作为标签进行使用。
