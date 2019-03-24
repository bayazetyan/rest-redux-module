// @flow

import { createMap, getNestedData } from '../utils/map';

import {
  isArray,
  isObject,
  deepClone,
  updateState,
  getReducerProps,
  getActionPayload,
} from '../utils/misc';

export const getReducers = (state: Object, action: Action, settings: ActionSettings): Object => {
  const {
    idKeys,
    hasPayload,
    withoutStatus = false,
  } = settings;

  const {
    key,
    nestedKeys,
    actionStatus,
    actionPayload,
  } = getReducerProps(idKeys, action, hasPayload);

  const stateData = state[key] || {};
  const payloadStatus = actionPayload.status && actionPayload.status === 1;

  const data = !payloadStatus ? createMap(actionPayload, stateData, nestedKeys) : actionStatus;

  if (!data) {
    return state;
  }

  if (isObject(actionPayload) && !withoutStatus) {
    return {
      ...state,
      [key]: {
        ...stateData,
        ...data
      }
    }
  } else {
    return {
      ...state,
      [key]: data
    }
  }
};

export const addReducers = (state: Object, action: Action, settings: ActionSettings): Object => {
  const { idKeys, hasPayload } = settings;

  const {
    key,
    nestedKeys,
    actionStatus,
    actionPayload,
  } = getReducerProps(idKeys, action, hasPayload);

  const updatedStateData = {
    key,
    state,
    hasPayload,
    actionStatus,
    payload: actionPayload
  };

  let stateData = state[key] ? state[key].payload || state[key] : {};

  let cloneStateData = deepClone(stateData);
  const nestedStateData = getNestedData(stateData, nestedKeys);

  const pendingStatus = actionPayload.status && actionPayload.status === 1;
  const cloneActionPayload = pendingStatus ? null : deepClone(actionPayload.payload || actionPayload);
  const lastKey = nestedKeys ? nestedKeys[nestedKeys.length - 1] : null;

  if (isObject(nestedStateData) && cloneActionPayload) {
    if (nestedKeys && nestedKeys.length) {
      nestedKeys.reduce((prev, next) => {
        if (prev && prev[next]) {
          prev[next][cloneActionPayload[lastKey]] = cloneActionPayload;
        }
        return prev[next];
      }, cloneStateData);
    } else {
      cloneStateData = cloneActionPayload
    }

    updatedStateData.payload = cloneStateData;

    return updateState(updatedStateData);
  } else if (isArray(nestedStateData) && cloneActionPayload) {

    nestedKeys.reduce((prev, next) => {
      if (prev && (isArray(prev[next]) || isArray(prev))) {
        const data = isArray(prev) ? prev : prev[next];

        const isExists = data.find(i => i[lastKey] === cloneActionPayload[lastKey]);

        if (!isExists) {
          return isArray(prev) ? prev.push(cloneActionPayload) : prev[next].push(cloneActionPayload);
        } else {
          return isArray(prev) ? prev : prev[next];
        }
      }

      return prev[next];
    }, cloneStateData);
    updatedStateData.payload = cloneStateData;

    return updateState(updatedStateData);
  } else if (!pendingStatus) {
    updatedStateData.payload = createMap(cloneActionPayload, nestedKeys);
  } else {
    updatedStateData.payload = cloneStateData;
  }

  return updateState(updatedStateData);
};

export const updateReducers = (state: Object, action: Action, settings: ActionSettings): Object => {
  const { idKeys, hasPayload } = settings;

  const {
    key,
    nestedKeys,
    actionStatus,
    actionPayload,
  } = getReducerProps(idKeys, action, hasPayload);

  const updatedStateData = {
    key,
    state,
    hasPayload,
    actionStatus,
    payload: actionPayload
  };

  let stateData = state[key].payload || state[key];
  const nestedStateData = getNestedData(stateData, nestedKeys);

  let cloneStateData = deepClone(stateData);
  const pendingStatus = actionPayload.status && actionPayload.status === 1;
  const cloneActionPayload = pendingStatus ? null : deepClone(actionPayload.payload || actionPayload);

  if (isObject(nestedStateData) && cloneActionPayload) {
    if (nestedKeys && nestedKeys.length) {
      let nextKey = '';

      nestedKeys.reduce((prev, next, index) => {
        const isFinished = nestedKeys.length === index + 1;

        if (cloneActionPayload && !nextKey && cloneActionPayload[next]) {
          nextKey = next;
        }

        if (cloneActionPayload && cloneActionPayload[next] && isFinished) {
          prev[cloneActionPayload[next]] = {
            ...prev[cloneActionPayload[next]],
            ...cloneActionPayload,
          };

        } else if (cloneActionPayload && !cloneActionPayload[next] && isFinished) {
          // delete IdKey in updated object
          delete cloneActionPayload[key];

          prev[next] = {
            ...prev[next],
            ...cloneActionPayload,
          }
        }

        return prev[next] || (cloneActionPayload && prev[cloneActionPayload[next]]) || prev;
      }, cloneStateData);
    } else {
      cloneStateData = { ...cloneStateData, ...cloneActionPayload};
    }
    updatedStateData.payload = cloneStateData;

    return updateState(updatedStateData);
  } else if (isArray(nestedStateData) && cloneActionPayload) {

    if (nestedKeys && nestedKeys.length) {
      const lastKey = nestedKeys[nestedKeys.length - 1];

      nestedKeys.reduce((prev, next) => {
        if (prev && !prev[next]) {
          return prev = prev.map((item, i) => {
            if (item[lastKey] === cloneActionPayload[lastKey]) {
              return prev[i] = { ...nestedStateData[i], ...cloneActionPayload }
            }
            return item;
          });
        }
        return prev[next]
      }, cloneStateData);
    } else {
      cloneStateData = { ...cloneStateData, ...cloneActionPayload };
    }

    updatedStateData.payload = cloneStateData;

    return updateState(updatedStateData);
  } else if (!pendingStatus) {
    updatedStateData.payload = createMap(cloneActionPayload, stateData, nestedKeys);
  } else {
    updatedStateData.payload = cloneStateData;
  }

  return updateState(updatedStateData);
};

export const deleteReducers = (state: Object, action: Action, settings: ActionSettings): Object => {
  const { idKeys, hasPayload } = settings;

  const {
    key,
    nestedKeys,
    actionStatus,
    actionPayload,
  } = getReducerProps(idKeys, action, hasPayload);

  const updatedStateData = {
    key,
    state,
    hasPayload,
    actionStatus,
    payload: actionPayload
  };

  let stateData = state[key].payload || state[key];
  const nestedStateData = getNestedData(stateData, nestedKeys);

  let cloneStateData = deepClone(stateData);
  const pendingStatus = actionPayload.status && actionPayload.status === 1;
  const cloneActionPayload = pendingStatus ? null : deepClone(actionPayload.payload || actionPayload);

  if (isObject(nestedStateData) && cloneActionPayload) {
    if (nestedKeys && nestedKeys.length) {
      nestedKeys.reduce((prev, next) => {
        if (prev && prev[next]) {
          delete prev[next][cloneActionPayload];
        }
        return prev[next];
      }, cloneStateData);
    }

    updatedStateData.payload = cloneStateData;

    return updateState(updatedStateData);
  } else if (isArray(nestedStateData) && cloneActionPayload) {
    const lastKey = nestedKeys[nestedKeys.length - 1];

    if (nestedKeys && nestedKeys.length) {
      nestedKeys.reduce((prev, next) => {
        if (prev && (prev[next] || isArray(prev))) {
          if (isArray(prev) && nestedKeys.length < 2) {
            cloneStateData = cloneStateData.filter(item => {
              if (item[lastKey] !== cloneActionPayload) {
                return item
              }
            });
            return prev;
          } else {
            if (isArray(prev[next])) {
              return prev[next] = prev[next].filter(item => {
                if (item[lastKey] !== cloneActionPayload) {
                  return item
                }
              });
            }
          }
        }

        return prev[next];
      }, cloneStateData);
    } else if (!pendingStatus) {
      cloneStateData = [...cloneStateData, ...cloneActionPayload]
    }

    updatedStateData.payload = cloneStateData;

    return updateState(updatedStateData);
  }

  return state;
};

export const clearReducers = (state: Object, action: Action, settings: ActionSettings) => {
  const key = settings.idKeys[0];

  return {
    ...state,
    [key]: getActionPayload(action),
  }
};
