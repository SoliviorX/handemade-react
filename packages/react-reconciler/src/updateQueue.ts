import { Action } from 'shared/ReactTypes';

export interface Update<State> {
	// action需要接受这两种形式：this.setState(newState)、this.setState(()=>{return newState})，action可以是一个值，或者返回新值的函数
	action: Action<State>;
}

export interface UpdateQueue<State> {
	shared: {
		pending: Update<State> | null;
	};
}

// 创建 Update 实例
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

// 往 UpdateQueue 里增加 Update
export const enqueueUpdate = <State>(
	updateQueue: UpdateQueue<State>,
	update: Update<State>
) => {
	updateQueue.shared.pending = update;
};

/**
 * 在 UpdateQueue 中消费 Update
 * @param baseState 初始状态
 * @param pendingUpdate 将要消费的Update
 */
export const processUpdateQueue = <State>(
	baseState: State,
	pendingUpdate: Update<State> | null
): { memoizedState: State } => {
	const result: ReturnType<typeof processUpdateQueue<State>> = {
		memoizedState: baseState
	};
	if (pendingUpdate !== null) {
		const action = pendingUpdate.action;
		if (action instanceof Function) {
			// 1. 当 action 是函数时
			result.memoizedState = action(baseState);
		} else {
			// 2. 当 action 是数值时
			result.memoizedState = action;
		}
	}

	return result;
};
