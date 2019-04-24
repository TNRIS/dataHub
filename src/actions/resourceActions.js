export const FETCH_RESOURCES_BEGIN   = 'FETCH_RESOURCES_BEGIN';
export const FETCH_RESOURCES_SUCCESS = 'FETCH_RESOURCES_SUCCESS';
export const FETCH_RESOURCES_FAILURE = 'FETCH_RESOURCES_FAILURE';

export const fetchResourcesBegin = () => ({
  type: FETCH_RESOURCES_BEGIN
});

export const fetchResourcesSuccess = (resources) => ({
  type: FETCH_RESOURCES_SUCCESS,
  payload: { resources }
});

export const fetchResourcesFailure = (error) => ({
  type: FETCH_RESOURCES_FAILURE,
  payload: { error }
});

// Handle HTTP errors since fetch won't.
function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

export function fetchResources() {
  return dispatch => {
    dispatch(fetchResourcesBegin());
    return fetch('/api/v1/resources')
      .then(handleErrors)
      .then(res => res.json())
      .then(json => {
        dispatch(fetchResourcesSuccess(json.results));
        return json.results;
      })
      .catch(error => dispatch(fetchResourcesFailure(error)));
  };
}
