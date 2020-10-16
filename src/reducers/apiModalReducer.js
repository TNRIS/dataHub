import {
  FETCH_MODALS_BEGIN,
  FETCH_MODALS_SUCCESS,
  FETCH_MODALS_FAILURE,
} from "../constants/apiModalActionTypes";

const initialState = {
  modals: [],
  loading: false,
  error: null,
};

const modalReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_MODALS_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_MODALS_SUCCESS:
      return {
        ...state,
        loading: false,
        modals: action.payload.modals,
      };
    case FETCH_MODALS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        modals: [],
      };
    default:
      return state;
  }
};

export default modalReducer;
