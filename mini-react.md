## 搭建项目架构

使用 Monorepo 项目结构：在同一个仓库中协同管理不同独立的库；
选择 pnpm 来实现 Monorepo；
pnpm 相比其他打包工具的优势：

- 依赖安装快
- 更规范，处理幽灵依赖问题（没有在 `packages.json` 中显式声明却被安装的依赖，在代码里可以 require 进来）

```
# 1. pnpm 初始化
pnpm init

# 2. 初始化 pnpm-workspace.yaml

# 3. 安装 eslint 规范
npx eslint --init

# 4. 修改.eslintrc.json

# 5. 安装ts的eslint插件
pnpm i -D -w @typescript-eslint/eslint-plugin

# 6. 安装prettier
pnpm i prettier -D -w

# 7. 新建 .prettierrc.json 配置文件

# 8. 将prettier集成到eslint中
pnpm i eslint-config-prettier eslint-plugin-prettier -D -w

# 9. 为lint增加对应的执行脚本
"lint": "eslint --ext .js,.ts,.jsx,.tsx --fix --quiet ./packages"

# 10. 安装husky
pnpm i husky -D -w

# 11. 初始化 husky
"prepare": "npx husky install"
pnpm prepare

# 12. 安装 lint-staged
pnpm i lint-staged -D -w

# 13. 将 lint-staged 集成到 husky 中的 precommit 中
npx husky add .husky/pre-commit "pnpm exec lint-staged"

# 14. 在package.json 中配置lint-staged
"lint-staged": {
    "*.{js,ts,jsx,tsx}": "pnpm run lint"
},

# 15. 安装 commitlint 相关依赖
pnpm i commitlint @commitlint/cli @commitlint/config-conventional -D -w

# 16. 新建配置文件 .commitlintrc.js
module.exports = {
  extends: ["@commitlint/config-conventional"]
};

# 17. 将 commitlint 集成到 husky
npx husky add .husky/commit-msg "npx --no-install commitlint -e $HUSKY_GIT_PARAMS"

# 18. 新建 ts 配置文件 tsconfig.json

# 19. 安装 rollup
pnpm i -D -w rollup
```

## JSX 转换

`<div>123</div>` 在 React17 和 React18 环境下的编译结果如下：

```js
// React18
import { jsx as _jsx } from 'react/jsx-runtime';
/*#__PURE__*/ _jsx('div', {
	children: '123'
});

// React17
import React from 'react';
/*#__PURE__*/ React.createElement('div', null, '123');
```

编译时由 babel 编译实现，我们来实现运行时，工作量包括：

1. 实现 jsx 方法
2. 实现打包流程
3. 实现调试打包结果的环境

### 实现 jsx 方法

包括：

1. `jsxDEV` 方法（dev 环境）
2. `jsx` 方法（prod 环境）
3. `React.createElement` 方法

jsx 的执行结果是 `ReactElement` 数据结构。

实现 jsx 和 jsxDEV，并在 `react/index.ts` 中导出

```js
import { jsxDEV } from './src/jsx';
export default {
	version: '0.0.0',
	createElement: jsxDEV
};
```

## rollup 打包

rollup 配置如下：

```js
import { getPackageJSON, resolvePkgPath, getBaseRollupPlugins } from './utils';
import generatePackageJson from 'rollup-plugin-generate-package-json';

const { name, module } = getPackageJSON('react');
const pkgPath = resolvePkgPath(name);
const pkgDistPath = resolvePkgPath(name, true);

export default [
	// react包
	{
		input: `${pkgPath}/${module}`,
		output: {
			file: `${pkgDistPath}/index.js`,
			name: 'react',
			format: 'umd'
		},
		plugins: [
			...getBaseRollupPlugins(),
			generatePackageJson({
				inputFolder: pkgPath,
				outputFolder: pkgDistPath,
				baseContents: ({ name, description, version }) => ({
					name,
					description,
					version,
					main: 'index.js'
				})
			})
		]
	},
	// jsx-runtime
	{
		input: `${pkgPath}/src/jsx.ts`,
		output: [
			// jsx-runtime
			{
				file: `${pkgDistPath}/jsx-runtime.js`,
				name: 'jsx-runtime',
				format: 'umd'
			},
			// jsx-dev-runtime
			{
				file: `${pkgDistPath}/jsx-dev-runtime.js`,
				name: 'jsx-dev-runtime',
				format: 'umd'
			}
		],
		plugins: getBaseRollupPlugins()
	}
];
```

添加打包的命令：

```
"build:dev": "rimraf dist && rollup --bundleConfigAsCjs --config scripts/rollup/react.config.js",
```

### 调试

打包完成后，进入 `dist/node_modules/react`，执行 `pnpm link --global`。
然后使用 `create-react-app` 创建一个新项目，在项目中执行 `pnpm link react --global`，即可引用刚才打包生成的 react。

这种调试方式的优点：可以**模拟实际**项目引用 React 的情况
缺点：对于我们当前开发的 mini-react 来说，略显繁琐。对于开发过程，**无法做到热更新**，新的改动必须重新打包才能在测试项目中看到效果。

## Reconciler 架构

react 框架的特点：

1. 消费 JSX
2. 没有编译优化
3. 开放通用 API 供不同宿主环境使用

`ReactElement` 如果作为核心模块操作的数据结构，存在的问题：

1. 无法表达节点之间的关系
2. 字段有限，不好拓展（比如：无法表达状态）

所以需要一种新的数据结构，他的特点：

1. 介于 `ReactElement` 与真实 UI 节点之间
2. 能够表达节点之间的关系
3. 方便拓展（不仅作为数据存储单元，也能作为工作单元）

这就是 **`FiberNode`**（**虚拟 DOM 在 React 中的实现**）

> 目前我们知道的节点类型有：JSX、ReactElement、FiberNode、DOMElement

### Reconciler 的工作方式

以 **DFS（深度优先遍历）** 的顺序遍历 ReactElement，这意味着：

1. 如果有子节点，遍历子节点
2. 如果没有子节点，遍历兄弟节点

这是个递归的过程，存在**递、归两个阶段**：

- "递"对应 `beginWork`：对于同一个节点，比较其 ReactElement 与 fiberNode，生成子 fiberNode。并根据比较的结果生成不同标记（插入、删除、移动......）。
  1. 对于 `mount` 的组件，他会创建新的子 Fiber 节点
  2. 对于 `update` 的组件，会通过 diff 算法比较新旧两个 fiberNode，将比较的结果生成新 Fiber 节点
- "归"对应 `completeWork`：
  1. `update` 时，更新 props
  2. `mount` 时，为 Fiber 节点生成对应的 DOM 节点；将子孙 DOM 节点插入刚生成的 DOM 节点中，生成一颗 DOM 树；处理 props；生成 effectList，保存有副作用的 fiber

**双缓冲技术**：当所有 ReactElement 比较完后，会生成一棵 fiberNode 树，一共会存在两棵 fiberNode 树：

- `current`：与视图中真实 UI 对应的 fiberNode 树
- `workInProgress`：触发更新后，正在 reconciler 中计算的 fiberNode 树

## 如何触发更新

### Update 和 UpdateQueue

触发更新的方式有很多：

- `ReactDOM.render`
- `ReactDOM.createRoot().render()`
- `this.setState`
- `this.forceUpdate`
- `useState`
- `useReducer`

我们需要实现一套统一的更新机制，兼容上述触发更新的方式，并方便后续扩展（优先级机制...）
更新机制的组成部分：

- `Update` —— 代表更新的数据结构
- `UpdateQueue` —— 消费 `Update` 的数据结构

`fiber.UpdateQueue` 中存储了该节点相关的 `Update`（存放在 `UpdateQueue.shared.pending` 中）

> 一个 Fiber 节点通常会存在多个 `Update`，例如多个 `useState` 同时存在等情况

### 接入更新机制

需要考虑的事情：

- 更新可能发生于任意组件，而**更新流程是从根节点递归的**
- 需要一个**统一的根节点保存通用信息**

`ReactDOM.createRoot(document.getElementById('root'))` 会执行 `createContainer`，做的事情是：

- 创建 `hostRootFiber`
- 创建 `FiberRootNode`
- 建立两者之间的联系

它们之间的关系如下：
![fiberRootNode&hostRootFiber](https://wechatapppro-1252524126.file.myqcloud.com/appjiz2zqrn2142/image/b_u_622f2474a891b_tuQ1ZmhR/lb1kqa1h0lrm.png)

```js
export function createContainer(container: Container) {
	// 创建 hostRootFiber
	const hostRootFiber = new FiberNode(HostRoot, {}, null);
	// 创建 FiberRootNode（会建立 FiberRootNode 与 hostRootFiber 之间的关系）
	const root = new FiberRootNode(container, hostRootFiber);
	hostRootFiber.updateQueue = createUpdateQueue();
	// 返回 FiberRootNode
	return root;
}
```

后续 `xxx.render(<App />)` 会执行 `updateContainer`，做的事情是：

- 根据组件创建 `update`
- 将 `update` 添加到 `hostRootFiber.updateQueue` 中
- 将 `xxx.render(<App />)` 方法接入到调度，后续再接入到递归流程

```js
export function updateContainer(
	element: ReactElementType | null,
	root: FiberRootNode
) {
	const hostRootFiber = root.current;
	// 根据 element 创建 update，element即render()中的入参 <App/>
	const update = createUpdate<ReactElementType | null>(element);
	// 将 update 添加到 hostRootFiber.updateQueue 中
	enqueueUpdate(
		hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>,
		update
	);

	// 【*关键*】将 render() 方法接入到递归流程
	scheduleUpdateOnFiber(hostRootFiber);

	// 返回 element
	return element;
}
```

在 `scheduleUpdateOnFiber`方法中，调度功能先跳过，我们需要先找到 `fiberRootNode`，然后执行 `renderRoot(root)` 进入递归流程；在 `renderRoot(root)` 需要先创建一个 `workInProgress Fiber`，再执行 `workLoop()`.

```js
export function scheduleUpdateOnFiber(fiber: FiberNode) {
	// TODO 调度功能

	// 对于ReactDOM.createRoot().render() 传入的fiber是hostRootFiber，但是对于setState传入的fiber是classComponent对应的fiber，render阶段是从rootFiber开始向下遍历，此时必须先回到hostRootFiber
	// 获取 fiberRootNode
	const root = markUpdateFromFiberToRoot(fiber);
	renderRoot(root);
}
// 从fiber到root，返回 fiberRootNode
function markUpdateFromFiberToRoot(fiber: FiberNode) {
	let node = fiber;
	let parent = node.return;
	while (parent !== null) {
		node = parent;
		parent = node.return;
	}
	if (node.tag === HostRoot) {
		return node.stateNode;
	}
	return null;
}
function renderRoot(root: FiberRootNode) {
	// 初始化
	prepareFreshStack(root);

	// 递归流程
	do {
		try {
			workLoop();
			break;
		} catch (e) {
			console.warn('workLoop发生错误', e);
			workInProgress = null;
		}
	} while (true);
}
// 初始化需要创建一个 workInProgress Fiber
function prepareFreshStack(root: FiberRootNode) {
	// 创建 workInProgress
	workInProgress = createWorkInProgress(root.current, {});
}
```

## 初探 mount 流程

为开发环境增加 `__DEV__` 标识

```
pnpm i -d -w @rollup/plugin-replace
```

### beginWork

`beginWork` 做的事情:

1. 通过对比子组件的 `current fiberNode` 和 `ReactElement`，生成 `workInProgress fiberNode`
2. 标记与结构变化相关的 `flags`：`Placement`、`ChildDeletion` （不会标记 `Update`）

### completeWork
