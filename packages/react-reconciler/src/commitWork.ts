import { Container, appendChildToContainer } from 'hostConfig';
import { FiberNode, FiberRootNode } from './fiber';
import {
	ChildDeletion,
	MutationMask,
	NoFlags,
	Placement,
	Update
} from './fiberFlags';
import { HostComponent, HostRoot, HostText } from './workTags';

let nextEffect: FiberNode | null = null;
export const commitMutationEffect = (finishedWork: FiberNode) => {
	nextEffect = finishedWork;

	while (nextEffect !== null) {
		// DFS 深度优先遍历，对所有存在副作用的节点执行 commitMutationEffectsOnFiber
		const child: FiberNode | null = nextEffect.child;

		// 1. 当subtreeFlags中存在副作用，且子节点存在时，继续往下遍历
		if (
			(nextEffect.subtreeFlags & MutationMask) !== NoFlags &&
			child !== null
		) {
			nextEffect = child;
		} else {
			// 2. 当subtreeFlags中不存在副作用，或者不存在子节点时，先遍历兄弟节点，再往上遍历
			up: while (nextEffect !== null) {
				commitMutationEffectsOnFiber(nextEffect);
				// 2.1 如果存在sibling，则跳出当前的up，执行sibling的向下循环
				const sibling: FiberNode | null = nextEffect.sibling;
				if (sibling !== null) {
					nextEffect = sibling;
					break up; // 跳出当前的 up 循环
				}
				// 2.2 当不存在sibling时，往上遍历
				nextEffect = nextEffect.return;
			}
		}
	}
};

const commitMutationEffectsOnFiber = (finishedWork: FiberNode) => {
	const flags = finishedWork.flags;
	if ((flags & Placement) !== NoFlags) {
		commitPlacement(finishedWork);
		finishedWork.flags &= ~Placement; // 将 Placement 从它的 flags 中移除
	}
	if ((flags & Update) !== NoFlags) {
		commitUpdate(finishedWork);
		finishedWork.flags &= ~Update;
	}
	if ((flags & ChildDeletion) !== NoFlags) {
		commitChildDeletion(finishedWork);
		finishedWork.flags &= ~ChildDeletion;
	}
};

const commitPlacement = (finishedWork: FiberNode) => {
	if (__DEV__) {
		console.warn('执行Placement操作', finishedWork);
	}
	// 1. 寻找 parent DOM
	const hostParent = getHostParent(finishedWork);
	// 2. 寻找 finishedWork 对应的 DOM，并将该DOM append 到父节点中
	appendPlacementNodeIntoContainer(finishedWork, hostParent);
};

const commitUpdate = (finishedWork: FiberNode) => {
	// TODO
};

const commitChildDeletion = (finishedWork: FiberNode) => {
	// TODO
};

function getHostParent(fiber: FiberNode): Container {
	let parent = fiber.return;
	while (parent) {
		const parentTag = parent.tag;
		// 只有 HostComponent 和 HostRoot 才能作为父节点  DOM
		if (parentTag === HostComponent) {
			return parent.stateNode as Container;
		}
		if (parentTag === HostRoot) {
			return (parent.stateNode as FiberRootNode).container;
		}
		parent = parent.return;
	}
	if (__DEV__) {
		console.warn('未找到 host parent');
	}
}

function appendPlacementNodeIntoContainer(
	finishedWork: FiberNode,
	hostParent: Container
) {
	// 插入的节点必须是host节点，不能是组件/函数等类型
	// 1. 如果插入的节点是 HostComponent 或 HostText，则直接插入
	if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
		appendChildToContainer(finishedWork.stateNode, hostParent);
		return;
	}
	// 2. 否则插入其子节点和子节点的sibling节点
	const child = finishedWork.child;
	if (child !== null) {
		appendPlacementNodeIntoContainer(child, hostParent);
		let sibling = child.sibling;
		while (sibling !== null) {
			appendPlacementNodeIntoContainer(sibling, hostParent);
			sibling = sibling.sibling;
		}
	}
}
