import {
  SUBMIT_CONTACT_BEGIN,
  SUBMIT_CONTACT_SUCCESS,
  SUBMIT_CONTACT_FAILURE
} from '../constants/contactActionTypes';

const initialState = {
  submitting: false,
  error: null
};

export default function contactReducer(state = initialState, action) {
  switch(action.type) {

    case SUBMIT_CONTACT_BEGIN:
      return {
        submitting: true,
        error: null
      };

    case SUBMIT_CONTACT_SUCCESS:
      return {
        submitting: false,
        error: null
      };

    case SUBMIT_CONTACT_FAILURE:
      return {
        submitting: false,
        error: action.payload.error
      };

    default:
      // ALWAYS have a default case in a reducer
      return state;
  }
}
