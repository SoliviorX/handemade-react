import { ReactElementType } from 'shared/ReactTypes';
import { FiberNode } from './fiber';
import { UpdateQueue, processUpdateQueue } from './updateQueue';
import { HostComponent, HostRoot, HostText } from './workTags';
import { mountChildFibers, reconcileChildFibers } from './childFibers';

/**
 * 递归中的递阶段
 * 主要工作是：比较子节点 ReactElement 和子节点 current fiberNode，产生各种副作用标记，并创建子节点 wip FiberNode节点
 * + 对于mount的组件，他会创建新的子Fiber节点
 * + 对于update的组件，会通过diff算法比较新旧两个fiberNode，将比较的结果生成新Fiber节点
 */
export const beginWork = (wip: FiberNode) => {
	switch (wip.tag) {
		/**
		 * HostRoot的beginWork工作流程：
		 * 1. 计算状态的最新值
		 * 2. 创造子 fiberNode
		 */
		case HostRoot:
			return updateHostRoot(wip);
		/**
		 * HostComponent的beginWork工作流程：
		 * 1. 创造子 fiberNode
		 */
		case HostComponent:
			return updateHostComponent(wip);
		/**
		 * HostText没有beginWork工作流程：
		 * 1. 没有子节点，return null
		 */
		case HostText:
			return null;
		default:
			if (__DEV__) {
				console.warn('beginWork未实现的fiber类型');
			}
			break;
	}
};

function updateHostRoot(wip: FiberNode) {
	const baseState = wip.memoizedState;
	const updateQueue = wip.updateQueue as UpdateQueue<Element>;
	const pending = updateQueue.shared.pending; // 将要消费的Update
	updateQueue.shared.pending = null;
	// 1. 计算状态的最新值
	const { memoizedState } = processUpdateQueue(baseState, pending); // 对于根组件（	<App /> ）来说，memoizedState 即 <App />（详见 updateQueue.ts 中消费 update 的逻辑）
	wip.memoizedState = memoizedState;
	/**
	 * memoizedState 就是 ReactElement：
	 * 1. 对于函数组件，action(baseState)的结果是 JSX，即 ReactElement
	 * 2. 对于 class 组件，createUpdate(element) 的参数是 ReactElement，所以memoizedState也就是传入的 ReactElement
	 */
	const nextChildren = wip.memoizedState; // nextChildren 即子 ReactElement，即 <App />
	// 2. 返回子 fiberNode
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

function updateHostComponent(wip: FiberNode) {
	const nextProps = wip.pendingProps;
	// 对于 ReactElement 来说，props.children 即子 ReactElement
	const nextChildren = nextProps.children;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

function reconcileChildren(wip: FiberNode, children?: ReactElementType) {
	const current = wip.alternate;
	if (current !== null) {
		// update
		wip.child = reconcileChildFibers(wip, current?.child, children);
	} else {
		// mount
		wip.child = mountChildFibers(wip, null, children);
	}
}
