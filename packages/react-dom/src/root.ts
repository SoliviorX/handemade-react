/**
 * react中 createRoot的使用方式：ReactDOM.createRoot(root).render(<App/>)
 * 1. 返回一个对象，对象中有一个render方法
 */

import { createContainer } from 'react-reconciler/src/fiberReconciler';
import { Container } from './hostConfig';
import { ReactElementType } from 'shared/ReactTypes';
import { updateContainer } from 'react-reconciler/src/fiberReconciler';

export function createRoot(container: Container) {
	const root = createContainer(container);
	return {
		render(element: ReactElementType) {
			updateContainer(element, root);
		}
	};
}
