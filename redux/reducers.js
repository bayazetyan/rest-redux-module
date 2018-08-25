// @flow
import {createMap, cloneMap} from '../utils/map';
import {isMap, isArray} from '../utils/misk';

export const getReducers = (
  state: Object,
  action: Action,
  settings: ActionSettings
): Object => {
  const { idKey, key, useMap = false}  = settings;
  const data = idKey ? createMap(action.payload, idKey, useMap) : action.payload;

  if (!data) {
    return state
  }

  return {
    ...state,
    [key]: {
      ...state[key],
      ...data
    }
  }
};

export const addReducers = (
  state: Object,
  action: Action,
  settings: ActionSettings
): Object => {
  const { idKey, key } = settings;
  const item = action.payload.payload || action.payload;

  if (isMap(state[key])) {
    const data = state[key];
    const cloneData = cloneMap(data);

    cloneData.set(item[idKey], item);

    return {
      ...state,
      [key]: cloneData
    }
  } else if (isMap(state[key].payload)) {
    const data = state[key].payload;
    const cloneData = cloneMap(data);

    cloneData.set(item[idKey], item);

    return {
      ...state,
      [key]: {
        ...state[key],
        ...action.payload,
        payload: cloneData
      }
    }
  } else if (isArray(state[key])) {
    console.log('LOG ::::::> action <::::::',action)
    console.log('LOG ::::::> state[key] <::::::',state[key])
    return {
      ...state,
      [key]: [
        ...state[key],
        action.payload
      ]
    }
  } else if (state[key].payload && isArray(state[key].payload)) {
    return {
      ...state,
      [key]: {
        ...state[key],
        ...action.payload,
        payload: [
          ...state[key].payload,
          action.payload.payload
        ]
      }
    }
  }

  return state
};

export const updateReducers = (
  state: Object,
  action: Action,
  settings: ActionSettings
): Object => {
  const {idKey, key, withoutResponse } = settings;
  console.log('LOG ::::::> action <::::::',action)
  const item = action.payload.payload || action.payload;

  if (isMap(state[key])) {
    const data = state[key].payload;
    const cloneData = cloneMap(data);

    cloneData.set(item[idKey], item);

    return {
      ...state,
      [key]: cloneData
    }
  } else if (isMap(state[key].payload)) {
    const data = state[key].payload;
    const cloneData = cloneMap(data);

    cloneData.set(item[idKey], item);

    return {
      ...state,
      [key]: {
        ...state[key],
        ...action.payload,
        payload: cloneData
      }
    }
  } else if (isArray(state[key])) {
    const cloneData = [ ...state[key] ];
    const updatedElementIndex = cloneData.findIndex(item => item[idKey] === action.payload[idKey]);

    cloneData[updatedElementIndex] = action.payload;

    return {
      ...state,
      [key]: cloneData
    }
  } else if (state[key].payload && isArray(state[key].payload)) {
    const cloneData = [ ...state[key].payload ];
    const updatedElementIndex = cloneData.findIndex(item => item[idKey] === action.payload.payload[idKey]);

    cloneData[updatedElementIndex] = action.payload.payload;

    return {
      ...state,
      [key]: {
        ...state[key],
        ...action.payload,
        payload: cloneData
      }
    }
  }

  return state
};

export const deleteReducers = (
  state: Object,
  action: Action,
  settings: ActionSettings
): Object => {
  const {idKey, key} = settings;
  const item = action.payload.payload || action.payload;

  if (isMap(state[key])) {
    const data = state[key].payload;
    const cloneData = cloneMap(data);

    cloneData.delete(item[idKey]);

    return {
      ...state,
      [key]: cloneData
    }
  } else if (isMap(state[key].payload)) {
    const data = state[key].payload;
    const cloneData = cloneMap(data);

    cloneData.delete(item[idKey], item);

    return {
      ...state,
      [key]: {
        ...state[key],
        ...action.payload,
        payload: cloneData
      }
    }
  } else if (isArray(state[key])) {
    const cloneData = [ ...state[key] ];
    const updatedData = cloneData.filter(item => item[idKey] !== action.payload[idKey]);

    return {
      ...state,
      [key]: updatedData
    }
  } else if (state[key].payload && isArray(state[key].payload)) {
    const cloneData = [ ...state[key].payload ];
    const updatedData = cloneData.filter(item => item[idKey] !== action.payload.payload[idKey]);

    return {
      ...state,
      [key]: {
        ...state[key],
        ...action.payload,
        payload: updatedData
      }
    }
  }

  return state
};

export const clearReducers = (state: Object, action: Action, settings: ActionSettings) => {
  const { key }  = settings;

  return {
    ...state,
    [key]: action.payload
  }
};
