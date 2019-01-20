// @flow

import { createMap } from '../utils/map';

import {
  isArray,
  isObject,
  updateState,
  getActionPayload,
  getActionStatusData,
} from '../utils/misc';

export const getReducers = (state: Object, action: Action, settings: ActionSettings): Object => {
  const {
    key,
    idKeys,
    withoutStatus = false,
  } = settings;

  const actionData = getActionPayload(action);
  const hasPayload = !!state[key].payload;
  const data = idKeys && idKeys.length ? createMap(actionData, idKeys, hasPayload) : actionData;

  if (!data) {
    return state
  }

  if (isObject(actionData) && !withoutStatus) {
    return {
      ...state,
      [key]: {
        ...state[key],
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
  const { idKeys, key, hasPayload } = settings;

  const actionData = getActionPayload(action);
  const stateData = state[key].payload || state[key];
  const actionStatus = getActionStatusData(action, hasPayload);

  const updatedData = {
    key,
    state,
    hasPayload,
    actionStatus,
    payload: actionData
  };

  if (isObject(stateData)) {
    let cloneData = { ...stateData };

    if (idKeys && idKeys.length) {
      idKeys.reduce((prev, next) => {
        cloneData[actionData[next]] = actionData
      }, stateData);
    } else {
      cloneData = { ...cloneData,  ...actionData}
    }

    updatedData.payload = cloneData;

    return updateState(updatedData);
  } else if (isArray(stateData)) {
    let cloneData = [...stateData ];
    cloneData.push(actionData);

    updatedData.payload = cloneData;

    return updateState(updatedData);
  }

  return updateState(updatedData);
};

export const updateReducers = (state: Object, action: Action, settings: ActionSettings): Object => {
  const { idKeys, key, hasPayload } = settings;

  const actionData = getActionPayload(action);
  const stateData = state[key].payload || state[key];
  const actionStatus = getActionStatusData(action, hasPayload);

  const updatedData = {
    key,
    state,
    hasPayload,
    actionStatus,
    payload: actionData
  };

  if (isObject(stateData)) {
    let cloneData = { ...stateData };

    if (idKeys && idKeys.length) {
      let key = '';

      idKeys.reduce((prev, next, index) => {
        const isFinished = idKeys.length === index + 1;

        if (!key && actionData[next]) {
          key = next;
        }

        if (actionData[next] && isFinished) {
          prev[actionData[next]] = {...prev[actionData[next]], ...actionData}
        } else if (!actionData[next] && isFinished) {
          // delete IdKey in updated object
          delete actionData[key];

          prev[next] = {...prev[next], ...actionData}
        }

        return prev[next] || prev[actionData[next]];
      }, cloneData);

    } else {
      cloneData = { ...cloneData,  ...actionData}
    }
    updatedData.payload = cloneData;

    return updateState(updatedData);
  } else if (isArray(stateData)) {
    let cloneData = [...stateData ];

    if (idKeys && idKeys.length) {
      idKeys.reduce((prev, next) => {
        const key = actionData[next];
        stateData.forEach((item, index) => {
          if (item[next] === key) {
            cloneData[index] = { ...cloneData[index], ...actionData };
          }
        })
      }, stateData);
    } else {
      cloneData = { ...cloneData,  ...actionData}
    }

    updatedData.payload = cloneData;

    return updateState(updatedData);
  }

  return updateState(updatedData);
};

export const deleteReducers = (state: Object, action: Action, settings: ActionSettings): Object => {
  const { idKeys, key, hasPayload } = settings;

  const actionData = getActionPayload(action);
  const stateData = state[key].payload || state[key];
  const actionStatus = getActionStatusData(action, hasPayload);

  const updatedData = {
    key,
    state,
    hasPayload,
    actionStatus,
    payload: actionData
  };

  if (isObject(stateData)) {
    let cloneData = { ...stateData };

    if (idKeys && idKeys.length) {
      idKeys.reduce((prev, next) => {
        if (actionData === cloneData[actionData][next]) {
          delete cloneData[actionData]
        }
      }, stateData);
    }

    updatedData.payload = cloneData;

    return updateState(updatedData);
  } else if (isArray(stateData)) {
    let cloneData = [...stateData ];

    if (idKeys && idKeys.length) {
      idKeys.reduce((prev, next) => {
        const key = actionData;

        cloneData = cloneData.filter(item => {
          if (item[next] !== key) {
            return item
          }
        })
      }, stateData);
    } else {
      cloneData = { ...cloneData,  ...actionData}
    }

    updatedData.payload = cloneData;

    return updateState(updatedData);
  }

  return state;
};

export const clearReducers = (state: Object, action: Action, settings: ActionSettings) => ({
  ...state,
  [settings.key]: getActionPayload(action),
});
