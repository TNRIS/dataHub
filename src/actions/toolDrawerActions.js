
import {
  CLOSE_TOOL_DRAWER,
  OPEN_TOOL_DRAWER,
  SET_DISMISSIBLE_DRAWER,
  SET_MODAL_DRAWER
} from '../constants/toolDrawerActionTypes';

export const closeToolDrawer = () => {
  return (dispatch) => {
    dispatch({
      type: CLOSE_TOOL_DRAWER
    })
  }
};

export const openToolDrawer = () => {
  return (dispatch) => {
    dispatch({
      type: OPEN_TOOL_DRAWER
    })
  }
};

export const setDismissibleDrawer = () => {
  return (dispatch) => {
    dispatch({
      type: SET_DISMISSIBLE_DRAWER
    })
  }
};

export const setModalDrawer = () => {
  return (dispatch) => {
    dispatch({
      type: SET_MODAL_DRAWER
    })
  }
};
