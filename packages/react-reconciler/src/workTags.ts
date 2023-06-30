export type WorkTag =
	| typeof FunctionComponent
	| typeof HostRoot
	| typeof HostComponent
	| typeof HostText;

export const FunctionComponent = 0;
// 根节点
export const HostRoot = 3;
// 原生标签对应的节点
export const HostComponent = 5;
export const HostText = 6;
