import React from "react";

const MinimizedContent = (props) => {
  return (
    <div
      onClick={() => props.setContentStateFn("preview")}
      className={"modalMinimizedContainer"}
    >
      <button
        className="scrolltop mdc-fab mdc-fab--extended"
        aria-label="Open survey container"
        title="Open survey container"
      >
        <span className="mdc-fab__icon material-icons">
          {props.minimized_icon}
        </span>
        <span className="mdc-fab__label">{props.minimized_text}</span>
      </button>
    </div>
  );
};

export default MinimizedContent;
