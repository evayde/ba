import { ADD_ANALYSIS } from '../actions/analysis.js';

const INIT_STATE = { };

const analysis = (state = INIT_STATE, action) => {
  switch (action.type) {
    case ADD_ANALYSIS:
      if (!state[action.vocableId]) {
        state[action.vocableId] = {
          score: 0
        };
      }

      state[action.vocableId].score += action.score;
      return { ...state };
    default: 
      return state;
  }
}

export default analysis;
