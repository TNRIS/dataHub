
import {
  SET_COLOR_THEME
} from '../constants/colorThemeActionTypes';

export const setColorTheme = (theme) => {
  if (typeof(Storage) !== void(0)) {
    localStorage.setItem('data_theme', theme);
  }
  return (dispatch) => {
    dispatch({
      type: SET_COLOR_THEME,
      payload: {theme: theme}
    })
  }
};
