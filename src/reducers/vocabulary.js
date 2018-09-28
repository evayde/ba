import { LOAD_CARDS } from '../actions/vocabulary.js';

const INIT_STATE = {
  vocables: []
}

const vocabulary = (state = INIT_STATE, action) => {
  switch (action.type) {
    case LOAD_CARDS:
      return {
        ...state,
        vocables: action.vocables
      };
    default:
      return state;
  }
};

export default vocabulary;
