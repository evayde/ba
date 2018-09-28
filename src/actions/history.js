import { transform } from "./analysis";

export const ADD_HISTORY_ENTRY = 'ADD_HISTORY_ENTRY';

const addHistoryEntry = (vocableId, entry) => {
  return {
    type: ADD_HISTORY_ENTRY,
    vocableId,
    entry
  }
}

export const practice = (vocableId, entry) => {
  return dispatch => {
    dispatch(addHistoryEntry(vocableId, entry));
    dispatch(transform(vocableId, entry));
  }
}
