import {
  FETCH_RESOURCES_BEGIN,
  FETCH_RESOURCES_SUCCESS,
  FETCH_RESOURCES_FAILURE
} from '../actions/resourceActions';

const initialState = {
  items: [],
  loading: false,
  error: null
};

export default function resourceReducer(state = initialState, action) {
  switch(action.type) {
    case FETCH_RESOURCES_BEGIN:
      // Mark the state as "loading" so we can show a spinner or something
      // Also, reset any errors. We're starting fresh.
      return {
        ...state,
        loading: true,
        error: null
      };

    case FETCH_RESOURCES_SUCCESS:
      // All done: set loading "false".
      // Also, replace the items with the ones from the server
      return {
        ...state,
        loading: false,
        items: action.payload.resources
      };

    case FETCH_RESOURCES_FAILURE:
      // The request failed, but it did stop, so set loading to "false".
      // Save the error, and we can display it somewhere
      // Since it failed, we don't have items to display anymore, so set it empty.
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        items: []
      };

    default:
      // ALWAYS have a default case in a reducer
      return state;
  }
}
