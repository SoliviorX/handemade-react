import React from "./react";
import ReactDOM from "./react-dom";

// const root = ReactDOM.createRoot(document.getElementById("root"));
// let element = <div>hello,simple react</div>;
// root.render(element);

ReactDOM.render(
  <div style={{ color: "blue" }} key={111} className="multiChild">
    hello,simple react
    <span>child 1</span>
    <span>child 2</span>
  </div>,
  document.getElementById("root")
);
