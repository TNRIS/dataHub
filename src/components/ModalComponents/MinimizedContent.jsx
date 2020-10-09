import React from "react";

const MinimizedContent = (props) => {
  return (
    <React.Fragment>
      <div
        onClick={() => props.setContentStateFn("preview")}
        style={{
          zIndex: "5000",
          textAlign: "center",
          position: "fixed",
          bottom: "30px",
          right: "30px",
        }}
      >
        <button
          className="scrolltop mdc-fab mdc-fab--extended"
          aria-label="Open survey container"
          title="Open survey container"
          style={{ background: 'white' }}
        >
          <span className="mdc-fab__icon material-icons">{props.minimized_icon}</span>
          <span className="mdc-fab__label">{props.minimized_text}</span>
        </button>
      </div>
    </React.Fragment>
  );
};

export default MinimizedContent;
