import {
  SUBMIT_CONTACT_BEGIN,
  SUBMIT_CONTACT_SUCCESS,
  SUBMIT_CONTACT_FAILURE
} from '../constants/contactActionTypes';


// --- retrieval lifecycle actions ---
export const submitContactBegin = () => ({
  type: SUBMIT_CONTACT_BEGIN
});

export const submitContactSuccess = () => ({
  type: SUBMIT_CONTACT_SUCCESS
});

export const submitContactFailure = (error) => ({
  type: SUBMIT_CONTACT_FAILURE,
  payload: { error }
});

// --- submit contact information to contact-app actions ---
//

// Handle HTTP errors since fetch won't.
function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

export function submitContactTnrisForm(formInfo) {
  // if in development mode, use local api build for forms; otherwise, use prod deployed api
  const contactUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:8000/api/v1/contact/submit/' : 'https://api.tnris.org/api/v1/contact/submit/';
  return (dispatch, getState) => {
    dispatch(submitContactBegin());
    const payload = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify(formInfo)
    };
    fetch(contactUrl, payload)
    .then(handleErrors)
    .then(res => res.json())
    .then(json => {
      if (json.status === "success") {
        dispatch(submitContactSuccess());
      }
      else if (json.status === "error") {
        dispatch(submitContactFailure(json.message));
      }
    })
    .catch(error => dispatch(submitContactFailure(error)));
  };
}
