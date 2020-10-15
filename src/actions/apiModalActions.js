import {
  FETCH_MODALS_BEGIN,
  FETCH_MODALS_FAILURE,
  FETCH_MODALS_SUCCESS,
} from "../constants/apiModalActionTypes";

// --- retrieval lifecycle actions ---
export const fetchModalsBegin = () => ({
  type: FETCH_MODALS_BEGIN,
});

export const fetchModalsSuccess = (modals) => ({
  type: FETCH_MODALS_SUCCESS,
  payload: { modals },
});

export const fetchModalsFailure = (error) => ({
  type: FETCH_MODALS_FAILURE,
  payload: { error },
});

function handleErrors(response) {
  // Handle HTTP errors since fetch won't.
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

export function fetchModals() {
  return (dispatch, getState) => {
    dispatch(fetchModalsBegin());
    return fetch(
      process.env.REACT_APP_API_URL + "/api/v1/contact/survey?limit=1"
    )
      .then(handleErrors)
      .then((res) => res.json())
      .then((json) => {
        dispatch(fetchModalsSuccess(json.results));
        return json.results;
      })
      .catch((error) => dispatch(fetchModalsFailure(error)));
  };
}