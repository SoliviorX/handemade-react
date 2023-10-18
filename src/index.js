import React from "./react";
import ReactDOM from "./react-dom";

// const root = ReactDOM.createRoot(document.getElementById("root"));
// let element = <div>hello,simple react</div>;
// root.render(element);

// ReactDOM.render(
//   <div style={{ color: "blue" }} key={111} className="multiChild">
//     hello,simple react
//     <span>child 1</span>
//     <span>child 2</span>
//   </div>,
//   document.getElementById("root")
// );

function MyFunctionComponent(props) {
  return (
    <div className="test-class" style={{ color: "red" }}>
      Simple React App
      <span>{props.xx}</span>
      <span>xx2</span>
    </div>
  );
}

ReactDOM.render(
  <MyFunctionComponent xx="xx1" />,
  document.getElementById("root")
);
