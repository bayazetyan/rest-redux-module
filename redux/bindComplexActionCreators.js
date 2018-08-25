// @flow

const ERROR_TEXT_START = 'bindActionCreators expected an object or a function, instead received';
const ERROR_TEXT_END = 'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?';

const getErrorText = (actionCreators: {[key: string]: Function}) => {
  const actionCreatorsType = actionCreators === null ? 'null' : typeof actionCreators;

  return `${ERROR_TEXT_START} ${actionCreatorsType} ${ERROR_TEXT_END}`;
};

const bindActionCreator = (actionCreator: Function, dispatch: Dispatch): Function => {
  return (...args: [number]) => {
    const newArguments = [ dispatch, ...args ];

    return actionCreator.apply(undefined, newArguments);
  };
};

export const bindComplexActionCreators = (actionCreators: Function, dispatch: Function): { [key: string]: Function } => {

  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch);
  }

  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error(getErrorText(actionCreators));
  }

  let keys = Object.keys(actionCreators);
  let boundActionCreators = {};

  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    let actionCreator = actionCreators[key];

    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
    }
  }

  return boundActionCreators;
};
