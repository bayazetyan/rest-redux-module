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
    actionPayload,
  } = getReducerProps(idKeys, action, hasPayload);

  const stateData = state[key] || {};
  const data = createMap(actionPayload, nestedKeys);

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

  if (nestedKeys) {
    stateData = getNestedData(stateData, nestedKeys);
  }

  let cloneStateData = deepClone(stateData);
  const pendingStatus = actionPayload.status && actionPayload.status === 1;
  const cloneActionPayload = pendingStatus ? null : deepClone(actionPayload.payload || actionPayload);

  if (isObject(stateData) && cloneActionPayload) {
    if (nestedKeys && nestedKeys.length) {
      const mergePayload = [...Object.values(stateData), cloneActionPayload];
      cloneStateData = createMap(mergePayload, nestedKeys, true);
    }

    updatedStateData.payload = cloneStateData;

    return updateState(updatedStateData);
  } else if (isArray(stateData) && cloneActionPayload) {
    cloneStateData.push(cloneActionPayload);

    updatedStateData.payload = createMap(cloneStateData, nestedKeys);

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

  const keys = !nestedKeys || nestedKeys.length === 1 ? null : nestedKeys.slice(0, -1);
  let stateData = state[key].payload || state[key];

  if (nestedKeys) {
    stateData = getNestedData(stateData, nestedKeys);
  }

  let cloneStateData = deepClone(stateData);
  const pendingStatus = actionPayload.status && actionPayload.status === 1;
  const cloneActionPayload = pendingStatus ? null : deepClone(actionPayload.payload || actionPayload);

  if (isObject(stateData) && cloneActionPayload) {
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
    updatedStateData.payload = keys ? createMap(cloneStateData, keys) : cloneStateData;

    return updateState(updatedStateData);
  } else if (isArray(stateData) && cloneActionPayload) {

    if (nestedKeys && nestedKeys.length) {
      nestedKeys.reduce((prev, next) => {
        const payloadData = cloneActionPayload[next];

        stateData.forEach((item, index) => {
          if (item[next] === payloadData && item[next] !== void(0) && payloadData !== void(0)) {
            cloneStateData[index] = { ...cloneStateData[index], ...cloneActionPayload };
          }
        })
      }, cloneStateData);
    } else {
      cloneStateData = { ...cloneStateData, ...cloneActionPayload}
    }

    updatedStateData.payload = keys ? createMap(cloneStateData, keys) : cloneStateData;

    return updateState(updatedStateData);
  } else if (!pendingStatus) {
    updatedStateData.payload = createMap(cloneActionPayload, nestedKeys);
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
  const keys = nestedKeys.length === 1 ? null : nestedKeys.slice(0,-1);

  if (nestedKeys) {
    stateData = getNestedData(stateData, nestedKeys);
  }

  let cloneStateData = deepClone(stateData);
  const pendingStatus = actionPayload.status && actionPayload.status === 1;
  const cloneActionPayload = pendingStatus ? null : deepClone(actionPayload.payload || actionPayload);

  if (isObject(stateData) && cloneActionPayload) {
    if (nestedKeys && nestedKeys.length) {
      nestedKeys.forEach(key => {
        if (cloneStateData[cloneActionPayload] && actionPayload === cloneStateData[cloneActionPayload][key]) {
          delete cloneStateData[cloneActionPayload]
        }
      });
    }

    updatedStateData.payload = createMap(cloneStateData, keys);

    return updateState(updatedStateData);
  } else if (isArray(stateData) && cloneActionPayload) {
    if (nestedKeys && nestedKeys.length) {
      nestedKeys.forEach(key => {
        cloneStateData = cloneStateData.filter(item => {
          if (item[key] !== cloneActionPayload) {
            return item
          }
        })
      });
    } else if (!pendingStatus) {
      cloneStateData = [...cloneStateData, ...cloneActionPayload]
    } else {
      updatedStateData.payload = cloneStateData;
    }

    updatedStateData.payload = createMap(cloneStateData, keys);

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
