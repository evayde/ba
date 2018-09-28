const MY_KEY = 'ba_store';

export const saveState = (state) => {
  let stringifiedState = JSON.stringify(state);
  localStorage.setItem(MY_KEY, stringifiedState);
}
export const loadState = () => {
  let json = localStorage.getItem(MY_KEY) || '{}';
  let state = JSON.parse(json);

  if (state) {
    return state;
  } else {
    return undefined;  // To use the defaults in the reducers
  }
}