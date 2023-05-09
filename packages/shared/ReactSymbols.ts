// 判断当前环境是否支持 Symbol：Symbol是构造函数；Symbol.for(key)通过key找到对应的symbol值，如果没找到则通过该key创建一个symbol值。
const supportSymbol = typeof Symbol === 'function' && Symbol.for;

export const REACT_ELEMENT_TYPE = supportSymbol
	? Symbol.for('react.element')
	: 0xeac7; // 不支持 Symbol 则将reactElementType设为一个数字
