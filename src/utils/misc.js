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

export const isPromise = (value: any) => {
  return Boolean(value && typeof value.then === 'function');
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

export const isEmpty = (obj: Object) => {
  return obj && (Object.entries(obj).length === 0 && obj.constructor === Object);
};

export const getActionPayload = (action: Action) => {
  return action.payload;
};

export const getActionStatusData = (action: Action) => {
  const actionData = getActionPayload(action);

  if (actionData.payload) {
    return { status: actionData.status, error: actionData.error };
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

export const deepClone = (data: Object | Array<*>) => {
  return JSON.parse(JSON.stringify(data));
};

export const getReducerProps = (keys: Array<string>, action: Action, hasPayload: boolean) => ({
  key: keys[0],
  actionPayload: getActionPayload(action),
  nestedKeys: keys.length > 1 ? keys.slice(1) : null,
  actionStatus: getActionStatusData(action, hasPayload),
});
