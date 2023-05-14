import { Action } from 'shared/ReactTypes';

export interface Update<State> {
	action: Action<State>;
}

export interface UpdateQueue<State> {
	shared: {
		pending: Update<State> | null;
	};
}

// 创建 update 实例
export const createUpdate = <State>(action: Action<State>): Update<State> => {
	return {
		action
	};
};

// 创建 UpdateQueue 实例
export const createUpdateQueue = <State>() => {
	return {
		shared: {
			pending: null
		}
	} as UpdateQueue<State>;
};

// 往 UpdateQueue 里增加 update
export const enqueueUpdate = <State>(
	updateQueue: UpdateQueue<State>,
	update: Update<State>
) => {
	updateQueue.shared.pending = update;
};

// 在 updateQueue 中消费 update
export const processUpdateQueue = <State>(
	baseState: State,
	pendingUpdate: Update<State> | null
): { memoizedState: State } => {
	const result: ReturnType<typeof processUpdateQueue<State>> = {
		// 设置一个初始值
		memoizedState: baseState
	};

	// 如果待执行的update（pendingUpdate）存在
	if (pendingUpdate !== null) {
		const action = pendingUpdate.action;
		if (action instanceof Function) {
			// baseState = 1; update = (x) => 4 * x ------> memoizedState = 4
			result.memoizedState = action(baseState);
		} else {
			// baseState = 1; update = 2 ------> memoizedState = 2
			result.memoizedState = action;
		}
	}

	return result;
};
