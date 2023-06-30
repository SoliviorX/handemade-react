import { Props, Key, Ref } from 'shared/ReactTypes';
import { WorkTag } from './workTags';
import { Flags, NoFlags } from './fiberFlags';
import { Container } from 'hostConfig';

export class FiberNode {
	tag: WorkTag;
	type: any;
	pendingProps: Props;
	key: Key;
	stateNode: any;
	ref: Ref;

	return: FiberNode | null;
	sibling: FiberNode | null;
	child: FiberNode | null;
	index: number;

	memoizedProps: Props | null;
	memoizedState: any;
	alternate: FiberNode | null;
	flags: Flags;
	updateQueue: unknown;

	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		// 实例
		this.tag = tag; // 该 fiberNode 的类型
		this.key = key;
		this.stateNode = null; // fiberNode 对应的真实DOM
		this.type = null; // 函数组件时为函数本身，一般组件时为？？？？？？？？？？？？？？？

		// 构成fiber树
		this.return = null;
		this.sibling = null;
		this.child = null;
		this.index = 0;

		this.ref = null;

		// 作为工作单元
		this.pendingProps = pendingProps; // fiberNode刚开始准备工作时的props
		this.memoizedProps = null; // 工作完确立下来的props
		this.memoizedState = null;
		this.updateQueue = null;

		this.alternate = null; // current.alternate 指向 workInProgress 对应的fiberNode；workInProgress.alternate 指向 current对应的 FiberNode
		this.flags = NoFlags; // 副作用，例如Placement、Update、Deletion
	}
}

export class FiberRootNode {
	// 容器，对于浏览器来说它是一个DOMElement
	container: Container;
	// 指向 hostRootFiber
	current: FiberNode;
	// 指向整个更新完成后的 hostRootFiber
	finishedWork: FiberNode | null;
	constructor(container: Container, hostRootFiber: FiberNode) {
		this.container = container;
		this.current = hostRootFiber;
		hostRootFiber.stateNode = this;
		this.finishedWork = null;
	}
}

// 创建 workInProgress（传入一个 fiberNode，经过一番操作后返回该 fiberNode 的 alternate）
export const createWorkInProgress = (
	current: FiberNode,
	pendingProps: Props
): FiberNode => {
	let wip = current.alternate;
	// mount 时，wip 为 null；update 时，wip 不为 null
	if (wip === null) {
		// 1. mount
		wip = new FiberNode(current.tag, pendingProps, current.key);
		wip.stateNode = current.stateNode;

		wip.alternate = current;
		current.alternate = wip;
	} else {
		// 2. update
		wip.pendingProps = pendingProps;
		wip.flags = NoFlags;
	}
	wip.type = current.type;
	wip.updateQueue = current.updateQueue;
	wip.child = current.child;
	wip.memoizedProps = current.memoizedProps;
	wip.memoizedState = current.memoizedState;

	return wip;
};
