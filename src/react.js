import { REACT_ELEMENT } from "./utils";
import { Component } from "./Component";
function createElement(type, properties = {}, children) {
  const ref = properties.ref || null;
  const key = properties.key || null;
  ["ref", "key", "__self", "__source"].forEach((key) => {
    delete properties[key];
  });
  let props = { ...properties };
  // 如果children的长度大于1（即参数长度大于3），将children转化成数组
  if (arguments.length > 3) {
    props.children = Array.prototype.slice.call(arguments, 2);
  } else {
    props.children = children;
  }
  return {
    $$typeof: REACT_ELEMENT,
    type,
    ref,
    key,
    props,
    _owner: null,
    _store: {},
  };
}

const React = {
  createElement,
  Component,
};

export default React;
