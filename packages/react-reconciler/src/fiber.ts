import { Props, Key, Ref } from 'shared/ReactTypes';
import { WorkTag } from './workTags';
import { Flags, NoFlags } from './fiberFlags';

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
	alternate: FiberNode | null;
	flags: Flags;

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

		this.alternate = null; // current.alternate 指向 workInProgress 对应的fiberNode；workInProgress.alternate 指向 current对应的 FiberNode
		this.flags = NoFlags; // 副作用，例如Placement、Update、Deletion
	}
}
