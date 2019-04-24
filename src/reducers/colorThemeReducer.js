import {
  SET_COLOR_THEME
} from '../constants/colorThemeActionTypes';

const initialState = {
  theme: 'light',
  themeOptions: ['light', 'dark']
}

export default function colorThemeReducer(state = initialState, action) {
  switch(action.type) {
    case SET_COLOR_THEME:
      // Set color theme in the state
      return {
        ...state,
        theme: action.payload.theme
      };

      default:
        // ALWAYS have a default case in a reducer
        return state;
  }
}
