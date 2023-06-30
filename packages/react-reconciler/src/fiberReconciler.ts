import { Container } from 'hostConfig';
import { FiberNode, FiberRootNode } from './fiber';
import { HostRoot } from './workTags';
import {
	createUpdate,
	createUpdateQueue,
	enqueueUpdate,
	UpdateQueue
} from './updateQueue';
import { ReactElementType } from 'shared/ReactTypes';
import { scheduleUpdateOnFiber } from './workLoop';

// ReactDOM.createRoot() 内部会执行 createContainer
export function createContainer(container: Container) {
	// 创建 hostRootFiber
	const hostRootFiber = new FiberNode(HostRoot, {}, null);
	// 创建 FiberRootNode（会建立 FiberRootNode 与 hostRootFiber 之间的关系）
	const root = new FiberRootNode(container, hostRootFiber);
	hostRootFiber.updateQueue = createUpdateQueue();
	// 返回 FiberRootNode
	return root;
}

// ReactDOM.createRoot().render(<App />) 内部会执行 updateContainer
export function updateContainer(
	element: ReactElementType | null,
	root: FiberRootNode
) {
	const hostRootFiber = root.current;
	// 根据 element 创建 update，element即render()中的入参 <App/>
	const update = createUpdate<ReactElementType | null>(element);
	// 将 update 添加到 hostRootFiber.updateQueue 中
	enqueueUpdate(
		hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>,
		update
	);

	// 【*关键*】将 render() 方法接入到递归流程
	scheduleUpdateOnFiber(hostRootFiber);

	// 返回 element
	return element;
}
