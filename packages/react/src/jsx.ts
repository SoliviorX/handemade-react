/**
 * 1. react17 以前会用 React.createElement 执行运行时；react17 以后会用 jsx方法执行运行时；
 * 2. 编译时由babel编译实现，我们来实现运行时，工作量包括：
    + 实现jsx方法
    + 实现打包流程
    + 实现调试打包结果的环境
 */

import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import {
	Type,
	Key,
	Ref,
	Props,
	ReactElement,
	ElementType
} from 'shared/ReactTypes';

// ReactElement 是 jsx 执行的返回结果
const ReactElement = function (
	type: Type,
	key: Key,
	ref: Ref,
	props: Props
): ReactElement {
	const element = {
		$$typeof: REACT_ELEMENT_TYPE,
		type,
		key,
		ref,
		props,
		__mark: 'solivior' // 为了将自己的react与官方的react区分开，增加一个标识
	};
	return element;
};

export const jsx = (type: ElementType, config: any, ...maybeChildren: any) => {
	let key: Key = null;
	const props: Props = {};
	let ref: Ref = null;

	// 处理 jsx 的第二个参数 config
	for (const prop in config) {
		const val = config[prop];
		if (prop === 'key') {
			if (val !== undefined) {
				// 将它变成字符串
				key = '' + val;
			}
			continue;
		}
		if (prop === 'ref') {
			if (val !== undefined) {
				ref = val;
			}
			continue;
		}
		if ({}.hasOwnProperty.call(config, prop)) {
			props[prop] = val;
		}
	}

	// 处理 jsx 的第三个参数 children 数组
	const maybeChildrenLength = maybeChildren.length;
	if (maybeChildrenLength) {
		if (maybeChildrenLength === 1) {
			props.children = maybeChildren[0];
		} else {
			props.children = maybeChildren;
		}
	}

	return ReactElement(type, key, ref, props);
};

// jsxDEV 是开发环境的jsx方法，在官方版本中jsxDEV会做一些其他的检查，这里我们直接将它等价于jsx
export const jsxDEV = jsx;
