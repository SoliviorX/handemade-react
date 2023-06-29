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

jsx 的执行结果是 ReactElement 数据结构。
