import { Props, Key, Ref } from 'shared/ReactTypes';
import { WorkTag } from './workTags';
import { Flags, NoFlags } from './fiberFlags';

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
	alternate: FiberNode | null;
	flags: Flags;

	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		this.tag = tag;
		this.key = key;
		// HostComponent 的 DOM
		this.stateNode = null;
		// FunctionComponnet 的函数
		this.type = null;

		// 父 fiberNode
		this.return = null;
		// 右边的同级 fiberNode
		this.sibling = null;
		// 子 fiberNode
		this.child = null;
		// 所处同级 fiberNode 的索引
		this.index = 0;
		this.ref = null;

		this.pendingProps = pendingProps;
		this.memoizedProps = null;

		this.alternate = null;
		this.flags = NoFlags;
	}
}
