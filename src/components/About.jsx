import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import BackButtonContainer from "../containers/BackButtonContainer";
import { GeneralContactForm } from "./GeneralContactForm";

export default function About() {
  const [scrollTo, setScrollTo] = useState();

  useEffect(() => {
    const path = window.location.href;
    const scrollToPath = path.slice(path.indexOf("#") + 1);
    if (scrollToPath) {
      setScrollTo(scrollToPath);
      const element = document.getElementById(scrollToPath);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  useEffect(() => {
    if (window.location.href.includes("#")) {
      const p = window.location.href;
      const base = p.slice(0, p.indexOf("#") + 1);
      window.location.href = base + scrollTo;
      const element = document.getElementById(scrollTo);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [scrollTo]);

  return (
    <React.Fragment>
      <div className="header-component mdc-top-app-bar mdc-top-app-bar--fixed">
        <div className="mdc-top-app-bar__row">
          <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
            <span className={"mdc-top-app-bar__title"}>About TNRIS</span>
          </section>
          <section
            className="mdc-top-app-bar__section mdc-top-app-bar__section--align-end"
            role="toolbar"
          >
            <BackButtonContainer />
          </section>
        </div>
      </div>
      {/* Body */}
      <div id="about-page-wrapper">
        <div id="contact">
          <GeneralContactForm />
        </div>
      </div>
    </React.Fragment>
  );
}
