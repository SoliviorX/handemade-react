import {
	appendInitialChild,
	createInstance,
	createTextInstance
} from 'hostConfig';
import { FiberNode } from './fiber';
import { HostComponent, HostRoot, HostText } from './workTags';
import { NoFlags } from './fiberFlags';

/**
 * 递归中的归，主要工作是：
 * 1. update时，更新props
 * 2. mount时，为Fiber节点生成对应的DOM节点；将子孙DOM节点插入刚生成的DOM节点中，生成一颗DOM树；处理props；生成 effectList，保存有副作用的fiber
 *
 * 需要解决的问题：
 * 1. 对于Host类型fiberNode：构建离屏DOM树
 * 2. 标记Update flag（TODO）
 */
export const completeWork = (wip: FiberNode) => {
	const newProps = wip.pendingProps;
	const current = wip.alternate;

	switch (wip.tag) {
		case HostComponent:
			if (current !== null && wip.stateNode) {
				// update 流程
			} else {
				// mount
				// 1. 构建DOM
				const instance = createInstance(wip.type, newProps);
				// 2. 将DOM插入到DOM树中
				appendAllChildren(instance, wip);
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		case HostText:
			if (current !== null && wip.stateNode) {
				// update 流程
			} else {
				// mount
				// 1. 构建DOM
				const instance = createTextInstance(newProps.content);
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		case HostRoot:
			bubbleProperties(wip);
			return null;
		default:
			if (__DEV__) {
				console.warn('未处理的completeWoork情况', wip);
			}
			break;
	}

	return;
};

function appendAllChildren(parent: FiberNode, wip: FiberNode) {
	let node = wip.child;
	while (node !== null) {
		// 【***】node必须是原生html标签或者文本才执行插入操作，否则继续往下及对兄弟节点进行递归
		if (node.tag === HostComponent || node.tag === HostText) {
			appendInitialChild(parent, node?.child);
		} else if (node.child !== null) {
			// 1. 当有子节点时，继续往下递归
			node.child.return = node;
			node = node.child;
			continue;
		}
		// 2. 终止条件：node 等于传入的 wip 时，直接 return
		if (node === wip) {
			return;
		}
		// 3. 处理兄弟节点
		// 3.1 当sibling不存在时
		while (node.sibling === null) {
			// 3.1.1 如果没有父节点，或者父节点为传入的wip，直接return
			if (node.return === null || node.return === wip) {
				return;
			}
			// 3.1.2 否则继续往上递归
			node = node?.return;
		}
		// 3.2 如果sibling存在，则建立sibling与node.return之间的联系，将node赋值为sibling，进入下一轮while循环
		node.sibling.return = node.return;
		node = node.sibling;
	}
}
/**
 * completeWork中的优化策略：
 * 利用completeWork向上遍历（归）的流程，将子fiberNode的flags冒泡到父fiberNode；
 * 当wip.subtreeFlags中存在副作用时才去查找子节点的副作用
 */
function bubbleProperties(wip: FiberNode) {
	let subtreeFlags = NoFlags;
	let child = wip.child;
	while (child !== null) {
		// 将 child 子节点的 flags 合并到 subtreeFlags
		subtreeFlags |= child.subtreeFlags;
		// 将 child 自己的 flags 合并到 subtreeFlags
		subtreeFlags |= child.flags;

		child.return = wip;
		// 将 child 赋值为 child.sibling，进入下一次循环，将 sibling 自身及其子节点的 flags，并合并到 subtreeFlags 中
		child = child.sibling;
	}
	wip.subtreeFlags |= subtreeFlags;
}
