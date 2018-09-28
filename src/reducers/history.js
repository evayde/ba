import { ADD_HISTORY_ENTRY } from '../actions/history.js';

const INIT_STATE = {};

const history = (state = INIT_STATE, action) => {
  switch (action.type) {
    case ADD_HISTORY_ENTRY:
      if (!state[action.vocableId]) {
        state[action.vocableId] = [];
      }

      state[action.vocableId].push(action.entry);
      
      return {
        ...state
      }
    default:
      return state;
  }
}

export default history;
