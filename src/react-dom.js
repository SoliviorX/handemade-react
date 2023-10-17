import { REACT_ELEMENT } from "./utils";

function render(VNode, containerDOM) {
  mount(VNode, containerDOM);
}
function mount(VNode, containerDOM) {
  /**
   * 1. 将虚拟DOM转化成真实DOM
   * 2. 将得到的真实DOM挂载到containerDOM上
   */
  let newDOM = createDOM(VNode);
  newDOM && containerDOM.appendChild(newDOM);
}
function createDOM(VNode) {
  const { type, props } = VNode;
  let dom;
  // 1. 创建元素
  if (type && VNode.$$typeof === REACT_ELEMENT) {
    dom = document.createElement(type);
  }
  // 2. 处理子元素
  if (props) {
    // 2.1 如果只有一个子元素，且该元素不是一个文本节点
    if (typeof props.children === "object" && props.children.type) {
      mount(props.children, dom);
    } else if (Array.isArray(props.children)) {
      // 2.2 如果有多个子元素
      mountArray(props.children, dom);
    } else if (typeof props.children === "string") {
      // 2.3 如果只有一个子节点，且该节点是普通文本
      dom.appendChild(document.createTextNode(props.children));
    }
  }
  // 3. 处理属性值
  setPropsForDOM(dom, props);
  return dom;
}
function setPropsForDOM(dom, VNodeProps = {}) {
  if (!dom) return;
  for (let key in VNodeProps) {
    if (key === "children") continue;
    if (/^on[A-Z].*/.test(key)) {
      // TODO: 事件处理
    } else if (key === "style") {
      Object.keys(VNodeProps[key]).forEach((styleName) => {
        dom.style[styleName] = VNodeProps[key][styleName];
      });
    } else {
      // dom上的属性名称和jsx的属性名称基本一致,例如dom.className；
      // 如果要写成 setAttribute(key, VNodeProps[key])的形式，还需重新设置key
      // 不过VNodeProps中存在而dom上不存在的属性，则无法设置
      dom[key] = VNodeProps[key];
    }
  }
}
function mountArray(children, parent) {
  if (!Array.isArray(children)) return;
  for (let i = 0; i < children.length; i++) {
    if (typeof children[i] === "string") {
      parent.appendChild(document.createTextNode(children[i]));
    } else {
      mount(children[i], parent);
    }
  }
}
const ReactDOM = {
  render,
};
export default ReactDOM;
