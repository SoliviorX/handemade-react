import { FiberNode } from './fiber';

/**
 * 递归中的递阶段
 * 主要工作是：比较 ReactElement 和 fiberNode，产生各种副作用标记，并创建子Fiber节点
 * + 对于mount的组件，他会创建新的子Fiber节点
 * + 对于update的组件，会通过diff算法比较新旧两个fiberNode，将比较的结果生成新Fiber节点
 */
export const beginWork = (fiber: FiberNode) => {
	return null;
};
