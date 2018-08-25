export const isObject = maybeObject =>
  typeof maybeObject === 'object' &&
  !Array.isArray(maybeObject) &&
  maybeObject !== null;

export const isFunction = maybeFunction => {
  return typeof maybeFunction === 'function';
};

export const isArray = maybeArray => {
  return Array.isArray(maybeArray);
};

export const isMap = data => {
  return data instanceof Map
};
