export const ADD_ANALYSIS = 'ADD_ANALYSIS';

const addAnalysisEntry = (vocableId, score) => {
  return {
    type: ADD_ANALYSIS,
    vocableId,
    score
  }
}

export const transform = (vocableId, entry) => {
  let score = 0;
  switch (entry.type) {
    case "mapping":
      score = entry.correct ? .25 : -2;
    break;
    default:
      score = entry.correct ? 1 : -1;
  }

  return dispatch => {
    dispatch(addAnalysisEntry(vocableId, score));
  }
}
