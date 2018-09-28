export const LOAD_CARDS = 'LOAD_CARDS';

import { practice } from './history.js';

const loadCards = (vocables) => {
  return {
    type: LOAD_CARDS,
    vocables
  }
}

export const loadVocabulary = () => {
  return async dispatch => {
    const response = await fetch('/database/vocabulary.json');
    const vocables = await response.json();

    dispatch(loadCards(vocables));
  }
}

export const practiceVocable = (vocableId, givenAnswer, type, hints) => {
  let date = Date.now();

  return async (dispatch, getState) => {
    let vocable = getState().vocabulary.vocables.find(v => v.id === vocableId);
    let correct = givenAnswer.toLowerCase() === vocable.en.text.toLowerCase();
    let distance = !correct ? levenshtein(vocable.en.text.toLowerCase(), givenAnswer.toLowerCase()) : 0;
    let wrongIndex = [];

    if (distance >= 1) {
      for (let i = 0; i < givenAnswer.length; i++) {
        if ((vocable.en.text[i] || '').toLowerCase() !== givenAnswer[i].toLowerCase()) {
          wrongIndex.push(i);
        }
      }
    }

    dispatch(practice(vocableId, { givenAnswer, date, correct, hints, distance, wrongIndex, type }));
  }
}

// helpers

// https://gist.github.com/andrei-m/982927
export const levenshtein = (a, b) => {
  if (a.length === 0) return b.length; 
  if (b.length === 0) return a.length; 

  let matrix = [];

  // increment along the first column of each row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // increment each column in the first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) == a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j-1] + 1, // substitution
                       Math.min(matrix[i][j - 1] + 1, // insertion
                       matrix[i-1][j] + 1)); // deletion
      }
    }
  }

  return matrix[b.length][a.length];
}
