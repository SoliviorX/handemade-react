import { FiberNode } from './fiber';

/**
 * 递归中的归，主要工作是：
 * 1. update时，更新props
 * 2. mount时，为Fiber节点生成对应的DOM节点；将子孙DOM节点插入刚生成的DOM节点中，生成一颗DOM树；处理props；生成 effectList，保存有副作用的fiber
 */
export const completeWork = (fiber: FiberNode) => {
	return;
};
