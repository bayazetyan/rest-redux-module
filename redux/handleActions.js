// @flow

const combineReducers = (handlers: { [key: string]: Function }) =>
  (prevState: Object, value: Action) => Object.keys(handlers)
    .reduce((newState: Object, key: string) => {
        if (key === value.type) {
          console.log('LOG ::::::> key <::::::',key)
          console.log('LOG ::::::> value.type <::::::',value.type)
          return handlers[key](newState, value)
        }
        return newState
      }, prevState
    );

export const handleActions = (
  handlers: { [key: string]: Function },
  defaultState: Object
) => {
  const reducer = combineReducers(handlers);

  return (...args) => {
    const state = args[0] || defaultState;
    const action = args[1];

    return reducer(state, action);
  };
};
