// @flow

export const isObject = (maybeObject: any): boolean =>
  typeof maybeObject === 'object' &&
  !Array.isArray(maybeObject) &&
  maybeObject !== null;

export const isFunction = (maybeFunction): boolean => {
  return typeof maybeFunction === 'function';
};

export const isArray = (maybeArray: any): boolean => {
  return Array.isArray(maybeArray);
};

export const isMap = (data: Object): boolean => {
  return data instanceof Map || data.payload;
};

export const deleteForbiddenSymbols = (value: string) => {
  const regExp = new RegExp(/[&=?[\]/]/g);

  return value ? String(value).replace(regExp, '') : '';
};

export const mapObject = (data: Object, path: string): any => {
  return path && path.split('.').reduce((prev, next) => prev && prev[next], data);
};

export const getActionPayload = (action: Action) => {
  return action.payload;
};

export const getActionStatusData = (action: Action) => {
  const actionData = getActionPayload(action);
  const { payload, ...actionStatusData } = actionData;

  if (payload) {
    return actionStatusData;
  } else {
    return { status: 2, error: null };
  }
};

export const updateState = (options: Object): Object => {
  const {
    key,
    state,
    payload,
    hasPayload,
    actionStatus,
  } = options;

  if (hasPayload) {
    return {
      ...state,
      [key]: {
        ...actionStatus,
        payload,
      }
    }
  } else {
    return {
      ...state,
      [key]: payload
    }
  }
};
