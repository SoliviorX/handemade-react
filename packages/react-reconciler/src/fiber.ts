import { Props, Key, Ref, ReactElementType } from 'shared/ReactTypes';
import { FunctionComponent, HostComponent, WorkTag } from './workTags';
import { Flags, NoFlags } from './fiberFlags';
import { Container } from 'hostConfig';

/**
 * current fiber 和 wip fiber 中的 alternate 字段：
 * 当 react 的状态发生更新时，当前页面所对应的 fiber 树称为 current Fiber，同时 react 会根据新的状态构建一颗新的 fiber 树，称为 workInProgress Fiber。current Fiber 中每个 fiber 节点通过 alternate 字段，指向 workInProgress Fiber 中对应的 fiber 节点。同样 workInProgress Fiber 中的 fiber
节点的 alternate 字段也会指向 current Fiber 中对应的 fiber 节点。
 */

export class FiberNode {
	type: any;
	tag: WorkTag;
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
		this.tag = tag;
		this.key = key;
		this.stateNode = null; // HostComponent 的 DOM
		this.type = null; // FunctionComponnet 的函数

		// 构成树状结构
		this.return = null; // 父 fiberNode
		this.sibling = null; // 右边的同级 fiberNode
		this.child = null; // 子 fiberNode
		this.index = 0; // 所处同级 fiberNode 的索引

		this.ref = null;

		// 作为工作单元
		this.pendingProps = pendingProps;
		this.memoizedProps = null;
		this.memoizedState = null;
		this.updateQueue = null;

		// 副作用
		this.flags = NoFlags;

		this.alternate = null;
	}
}

export class FiberRootNode {
	// container 的类型不能直接设为 DomElement，因为只有根节点（ReactDOM.createRoot(rootElement)）才有DomElement
	container: Container;
	current: FiberNode;
	// 更新完成以后的 hostRootFiber
	finishedWork: FiberNode | null;
	constructor(container: Container, hostRootFiber: FiberNode) {
		this.container = container;
		// fiberRootNode.current = hostRootFiber
		this.current = hostRootFiber;
		// hostRootFiber.stateNode = fiberRootNode
		hostRootFiber.stateNode = this;
		this.finishedWork = null;
	}
}

export const createWorkInProgress = (
	current: FiberNode,
	pendingProps: Props
): FiberNode => {
	let wip = current.alternate;

	if (wip === null) {
		// mount
		wip = new FiberNode(current.tag, pendingProps, current.key);
		wip.type = current.type;
		wip.stateNode = current.stateNode;

		wip.alternate = null;
		current.pendingProps = pendingProps;
	} else {
		// update
		wip.type = current.type;
		wip.flags = NoFlags;
	}
	wip.type = current.type;
	wip.updateQueue = current.updateQueue;
	wip.child = current.child;
	wip.memoizedProps = current.memoizedProps;
	wip.memoizedState = current.memoizedState;

	return wip;
};

export function createFiberElement(element: ReactElementType): FiberNode {
	const { type, key, props } = element;
	let fiberTag: WorkTag = FunctionComponent;
	if (typeof type === 'string') {
		// <div/> ——> type: 'div'
		fiberTag = HostComponent;
	} else if (typeof type !== 'function' && __DEV__) {
		console.warn('未定义的type类型');
	}
	const fiber = new FiberNode(fiberTag, props, key);
	fiber.type = type;
	return fiber;
}
