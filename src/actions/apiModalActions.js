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

//-----------COMMENTED OUT FOR DEV
// TODO: connect to new API endpoint
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

/* export function fetchModals() {
  const modalArray = [
    {
      survey_template_id: "21345",
      initial_content_state: "preview",
      display_delay_template_type: 5,
      preview_body_text: "Preview Text 1",
      preview_header: "Preview Header 1",
      preview_accept_button_text: "Accept",
      preview_later_button_text: "Maybe Later",
      preview_reject_button_text: "No Thanks",
      preview_position: null,
      preview_size: null,
      preview_background_color: null,
      full_text: "Full Text1",
      full_header: "Full Header 1",
      full_position: null,
      full_size: null,
      full_background_color: null,
      survey_id: "dd842d3c-04b0-4842-b076-63446439b3a6",
      sheet_id: null,
      minimized_icon: "maximize",
      minimized_text: "TNRIS Survey",
    },
    {
      survey_template_id: "2134sdf5",
      initial_content_state: "preview",
      display_delay_template_type: 10,
      preview_body_text: "Preview Text 2",
      preview_header: "Preview Header 2",
      preview_accept_button_text: "Accept",
      preview_later_button_text: "Maybe Later",
      preview_reject_button_text: "No Thanks",
      preview_position: 'center',
      preview_size: null,
      preview_background_color: null,
      full_text: "Full Text 2",
      full_header: "Full Header 2",
      full_position: 'center',
      full_size: 'full-screen',
      full_background_color: '#ccccccc5',
      survey_id: null,
      sheet_id: null,
      minimized_icon: "maximize",
      minimized_text: "TNRIS Survey",
    },
  ];
  return (dispatch, getState) => {
    dispatch(fetchModalsBegin());
    dispatch(fetchModalsSuccess(modalArray));
    return null;
  };
} */
