import {
  CLOSE_TOOL_DRAWER,
  OPEN_TOOL_DRAWER,
  SET_DISMISSIBLE_DRAWER,
  SET_MODAL_DRAWER
} from '../constants/toolDrawerActionTypes';

const initialState = {
  toolDrawerStatus: 'open',
  toolDrawerVariant: 'dismissible'
}

export default function toolDrawerReducer(state = initialState, action) {
  switch(action.type) {
    case CLOSE_TOOL_DRAWER:
      // Set toolDrawerStatus in the state to closed so that we may close the drawer
      return {
        ...state,
        toolDrawerStatus: 'closed'
      };

    case OPEN_TOOL_DRAWER:
      // Set toolDrawerStatus in the state to open so that we may open the drawer
      return {
        ...state,
        toolDrawerStatus: 'open'
      };

    case SET_DISMISSIBLE_DRAWER:
      // Set toolDrawerVariant in the state to dismissible
      return {
        ...state,
        toolDrawerVariant: 'dismissible'
      };

    case SET_MODAL_DRAWER:
      // Set toolDrawerVariant in the state to modal
      return {
        ...state,
        toolDrawerVariant: 'modal'
      };

    default:
      // ALWAYS have a default case in a reducer
      return state;
  }
}
