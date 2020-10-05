import React from 'react'

const MinimizedContent = (props) => {
    return (
      <React.Fragment>
        <div
          onClick={() => props.setContentStateFn("preview")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyItems: "center",
            cursor: 'pointer'
          }}
        >
          <span className={"material-icons mdc-fab__icon"}>
            {props.minimized_icon}
          </span>
          {props.minimized_text ? <strong>{props.minimized_text}</strong> : null}
        </div>
      </React.Fragment>
    );
  };

  export default MinimizedContent