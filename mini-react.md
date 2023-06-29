使用 Monorepo 项目结构：在同一个仓库中协同管理不同独立的库
选择 pnpm 实现 monorepo，pnpm 相比其他打包工具的优势：

- 依赖安装快
- 更规范，处理幽灵依赖问题（没有在 `packages.json` 中显式声明却被安装的依赖，在代码里可以 require 进来）
