import { beginWork } from './beginWork';
import { completeWork } from './completeWork';
import { FiberNode } from './fiber';

let workInProgress: FiberNode | null = null;

function prepareFreshStack(fiber: FiberNode) {
	workInProgress = fiber;
}

function renderRoot(root: FiberNode) {
	// 初始化
	prepareFreshStack(root);

	do {
		try {
			workLoop();
			break;
		} catch (e) {
			console.warn('workLoop发生错误', e);
			workInProgress = null;
		}
	} while (true);
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
