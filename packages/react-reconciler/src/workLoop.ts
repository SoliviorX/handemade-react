import { beginWork } from './beginWork';
import { completeWork } from './completeWork';
import { FiberNode, FiberRootNode, createWorkInProgress } from './fiber';
import { HostRoot } from './workTags';

let workInProgress: FiberNode | null = null;

function prepareFreshStack(root: FiberRootNode) {
	// 创建 workInProgress
	workInProgress = createWorkInProgress(root.current, {});
}

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

	do {
		try {
			workLoop();
			break;
		} catch (e) {
			if (__DEV__) {
				console.warn('workLoop发生错误', e);
			}
			workInProgress = null;
		}
	} while (true);

	const finishedWork = root.current.alternate;
	root.finishedWork = finishedWork;

	// 根据 wip fiberNode 树和 树中的 flags 执行渲染操作
	// commitRoot(root)
}

function workLoop() {
	while (workInProgress !== null) {
		performUnitOfWork(workInProgress);
	}
}

function performUnitOfWork(fiber: FiberNode) {
	const next = beginWork(fiber);
	fiber.memoizedProps = fiber.pendingProps;
	// 1. 如果没有子节点，则执行当前节点的"归"阶段；执行completeWork(fiber)，并判断是否有sibling
	if (next === null) {
		completeUnitOfWork(fiber);
	} else {
		// 2. 如果有子节点，则继续往下执行子节点的“递”阶段
		workInProgress = next;
	}
}

function completeUnitOfWork(fiber: FiberNode) {
	let node: FiberNode | null = fiber;
	// 递归中的归阶段：循环执行，直到 node === null
	do {
		completeWork(node);
		const sibling = node.sibling;
		// 1. 如果存在兄弟节点，会进入其兄弟Fiber的“递”阶段。
		if (sibling !== null) {
			workInProgress = sibling;
			return; // return 会中止当前“归”阶段的循环，进入兄弟节点的“递”阶段
		}
		// 2. 如果不存在兄弟Fiber，会进入父级Fiber的“归”阶段。
		node = node.return;
		workInProgress = node;
	} while (node !== null);
}
