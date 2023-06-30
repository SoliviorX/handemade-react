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
