import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MDCTextField } from "@material/textfield";
import { MDCFloatingLabel } from "@material/floating-label";
import { MDCLineRipple } from "@material/line-ripple";
import { MDCRipple } from "@material/ripple";
import { MDCSelect } from "@material/select";
import ReCAPTCHA from "react-google-recaptcha";
import { useEffect } from "react";
import { catalogActions, contactActions, urlTrackerActions } from "../actions";

const TextField = ({
  name,
  label,
  value,
  onChange,
  required,
  type = "text",
}) => (
  <div id={`ct-${name}`} className="mdc-text-field mdc-text-field--outlined">
    <input
      id={`ct-${name}-input`}
      className="mdc-text-field__input"
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
    />
    <label className="mdc-floating-label" htmlFor={`ct-${name}-input`}>
      {label}
    </label>
    <div className="mdc-line-ripple"></div>
  </div>
);
const TextArea = ({
  name,
  label,
  value,
  onChange,
  required,
  rows = 8,
  columns = 20,
}) => (
  <div id="ct-question" className={"mdc-text-field mdc-text-field--textarea"}>
    <textarea
      id="ct-question-input"
      className={"mdc-text-field__input"}
      rows={rows}
      columns={columns}
      required={required}
      onChange={onChange}
      value={value}
      name={name}
    />
    <label
      className="mdc-floating-label mdc-floating-label--float-above"
      htmlFor="ct-question-input"
    >
      {label}
    </label>
  </div>
);
const SelectField = ({ name, label, value, options, onChange, required }) => (
  <div
    className={
      "mdc-select mdc-select--required mdc-ripple-upgraded mdc-select--invalid"
    }
  >
    <select
      className={"mdc-select__native-control"}
      value={value}
      name={name}
      onChange={onChange}
      required={required}
    >
      <option value={""}></option>
      {options.length > 0
        ? options.map((v, i) => (
            <option value={v} key={v + i}>
              {v}
            </option>
          ))
        : null}
    </select>
    <label className="mdc-floating-label">{label}</label>
    <div className="mdc-line-ripple"></div>
  </div>
);

const industriesList = [
  "Agriculture",
  "Cartography",
  "Conservation",
  "Construction",
  "Consulting",
  "Education",
  "Emergency Management",
  "Environmental",
  "Forestry",
  "Government",
  "Insurance",
  "Law Enforcement",
  "Oil and Gas",
  "Public Health",
  "Retail",
  "Utilities",
  "Urban Planning",
];

export function GeneralContactForm() {
  const [formFields, setFormFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    organization: "",
    industry: "",
    question: "",
  });
  const [recaptcha, setRecaptcha] = useState("");
  const [recaptchaError, setRecaptchaError] = useState("");
  const [displayState, setDisplayState] = useState("form");

  const errorStatus = useSelector((state) => state.contact.error);
  const submitStatus = useSelector((state) => state.contact.submitting);
  const previousUrl = useSelector((state) => state.urlTracker.previousUrl);
  const catalogFilterUrl = useSelector(
    (state) => state.urlTracker.catalogFilterUrl
  );
  const selectedCollection = useSelector(
    (state) => state.collections.selectCollection
  );
  const currentView = useSelector((state) => state.catalog.view);

  const dispatch = useDispatch();
  //attach MDC Web Components to query selectors on load
  useEffect(() => {
    dispatch(catalogActions.setViewAbout());
    document.querySelectorAll(".mdc-floating-label").forEach((mdl) => {
      new MDCFloatingLabel(mdl);
    });
    document.querySelectorAll(".mdc-line-ripple").forEach((mlr) => {
      new MDCLineRipple(mlr);
    });
    document.querySelectorAll(".mdc-text-field").forEach((mtf) => {
      new MDCTextField(mtf);
    });
    new MDCSelect(document.querySelector(".mdc-select"));
    new MDCRipple(document.querySelector("#contact-tnris-submit"));
  }, [dispatch]);

  //handleFieldChange by key value
  const handleFieldChange = (event) => {
    event.persist();

    setFormFields((formFields) => ({
      ...formFields,
      [event.target.name]: event.target.value,
    }));
  };
  //handleRecaptchaChange
  const recaptchaChange = (value) => {
    setRecaptcha((recaptcha) => value);
  };

  const submitForm = (event) => {
    event.preventDefault();

    if (recaptcha !== "") {
      setDisplayState((displayState) => "submitting");
      setRecaptchaError((recaptchaError) => "");

      const formInfo = {
        Name: formFields.firstName + " " + formFields.lastName,
        Email: formFields.email,
        Phone: formFields.phoneNumber,
        Address: formFields.address,
        Organization: formFields.organization,
        Industry: formFields.industry,
        question_or_comments: formFields.question,
        form_id: "contact",
        recaptcha: recaptcha,
      };
      dispatch(contactActions.submitContactTnrisForm(formInfo));
    } else {
      setRecaptchaError(
        (recaptchaError) => "Please confirm you are not a robot to proceed."
      );
    }
  };

  return (
    <div id="general-contact-form-wrapper">
      {
        //ERROR STATE UI
        errorStatus !== null && submitStatus === false && (
          <div>
            <div className="order-tnris-data-message contact-tnris-form-error">
              <h2 className={"mdc-typography mdc-typography--headline6"}>
                Submission Error
              </h2>
              <p className="mdc-typography--body2">
                <br />
                Unfortunately, we have encountered an error. Please wait a
                moment, refresh the page, and try again.
                <br />
                <br />
                {errorStatus.toString()}
              </p>
              <div className="mdc-touch-target-wrapper general-contact-button-wrapper">
                <div
                  onClick={() => {
                    if (
                      currentView === "orderCart" &&
                      previousUrl.startsWith("/collection")
                    ) {
                      dispatch(catalogActions.setViewCollection());
                      dispatch(urlTrackerActions.setUrl(previousUrl));
                      dispatch(
                        catalogActions.selectCollection(selectedCollection)
                      );
                    } else {
                      dispatch(catalogActions.setViewCatalog());
                      dispatch(urlTrackerActions.setUrl(catalogFilterUrl));
                    }
                  }}
                >
                  <button className="mdc-button mdc-button--outlined button">
                    <div className="mdc-button__ripple"></div>
                    <span className="mdc-button__label">Return to Home</span>
                    <div className="mdc-button__touch"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
      {
        //SUCCESS STATE UI
        errorStatus === null &&
          submitStatus === false &&
          displayState === "submitting" && (
            <div className="order-tnris-data-message contact-tnris-form-success">
              <h2 className={"mdc-typography mdc-typography--headline6"}>
                Inquiry Submitted Successfully
              </h2>
              <p className="mdc-typography--body2">
                <br />
                Thank you for submitting your inquiry. We review submissions in
                a timely manner and will contact you via the email address
                submitted with this form.
              </p>
              <div className="mdc-touch-target-wrapper general-contact-button-wrapper">
                <div
                  onClick={() => {
                    if (
                      currentView === "orderCart" &&
                      previousUrl.startsWith("/collection")
                    ) {
                      dispatch(catalogActions.setViewCollection());
                      dispatch(urlTrackerActions.setUrl(previousUrl));
                      dispatch(
                        catalogActions.selectCollection(selectedCollection)
                      );
                    } else {
                      dispatch(catalogActions.setViewCatalog());
                      dispatch(urlTrackerActions.setUrl(catalogFilterUrl));
                    }
                  }}
                >
                  <button className="mdc-button mdc-button--outlined button">
                    <div className="mdc-button__ripple"></div>
                    <span className="mdc-button__label">Return to Home</span>
                    <div className="mdc-button__touch"></div>
                  </button>
                </div>
              </div>
            </div>
          )
      }
      {
        //DEFAULT, FORM STATE UI
        errorStatus === null && displayState === "form" && (
          <form
            className={"contact-tnris-form-component"}
            onSubmit={submitForm}
          >
            <h2 className={"mdc-typography mdc-typography--headline6"}>
              General Contact
            </h2>
            <TextField
              name="firstName"
              label="First Name"
              value={formFields.firstName}
              onChange={(e) => handleFieldChange(e)}
              required={true}
            />
            <TextField
              name="lastName"
              label="Last Name"
              value={formFields.lastName}
              onChange={(e) => handleFieldChange(e)}
              required={true}
            />
            <TextField
              type="email"
              name="email"
              label="Email"
              value={formFields.email}
              onChange={(e) => handleFieldChange(e)}
              required={true}
            />
            <TextField
              type="tel"
              name="phoneNumber"
              label="Phone Number"
              value={formFields.phoneNumber}
              onChange={(e) => handleFieldChange(e)}
              required={true}
            />
            <TextField
              name="address"
              label="Address"
              value={formFields.address}
              onChange={(e) => handleFieldChange(e)}
              required={false}
            />
            <SelectField
              name="industry"
              label="Industry"
              required={true}
              value={formFields.industry}
              options={industriesList}
              onChange={(e) => handleFieldChange(e)}
            />
            <TextField
              name="organization"
              label="Organization"
              value={formFields.organization}
              onChange={(e) => handleFieldChange(e)}
              required={true}
            />

            <TextArea
              name={"question"}
              label="Question or Comment"
              value={formFields.question}
              onChange={(e) => handleFieldChange(e)}
              required={true}
            />
            <ReCAPTCHA
              className="recaptcha-container"
              sitekey="6Lf8GP8SAAAAAFx2H53RtfDO18x7S1q_0pGNdmbd"
              onChange={recaptchaChange}
            />
            {recaptchaError && (
              <p className="order-tnris-data-message invalid-prompt">
                {recaptchaError}
              </p>
            )}

            <br />

            <div className="submit-button">
              <input
                type="submit"
                value="Submit"
                id="contact-tnris-submit"
                className="mdc-button mdc-button--raised"
              />
            </div>
          </form>
        )
      }
    </div>
  );
}
