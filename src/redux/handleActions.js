// @flow

const combineReducers = (handlers: { [key: string]: Function }): Function =>
  (prevState: Object, value: Action) => Object.keys(handlers)
    .reduce((newState: Object, key: string) => {
        if (key === value.type) {
          return handlers[key](newState, value)
        }
        return newState
      }, prevState
    );

export const handleActions = (
  handlers: { [key: string]: Function },
  defaultState: Object
): () => Reducer => {
  const reducer = combineReducers(handlers);

  return (...args) => {
    const state = args[0] || defaultState;
    const action = args[1];

    return reducer(state, action);
  };
};
