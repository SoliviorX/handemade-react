/**
 * fiberNode 的类型
 */
export type WorkTag =
	| typeof FunctionComponent
	| typeof HostRoot
	| typeof HostComponent
	| typeof HostText;

export const FunctionComponent = 0;
// ReactDOM.render(xxx) 对应的节点类型
export const HostRoot = 3;
// 普通元素节点的类型
export const HostComponent = 5;
// 文本节点的类型
export const HostText = 6;
