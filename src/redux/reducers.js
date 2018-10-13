// @flow
import { createMap, cloneMap } from '../utils/map';
import { isMap, isArray, isObject } from '../utils/misk';

export const getReducers = (
  state: Object,
  action: Action,
  settings: ActionSettings
): Object => {
  const { idKey, key, useMap = false }  = settings;
  const data = idKey ? createMap(action.payload, idKey, useMap) : action.payload;

  if (!data) {
    return state
  }

  if (!isArray(action.payload) && !isObject(action.payload)) {
    return {
      ...state,
      [key]: data
    }
  } else {
    return {
      ...state,
      [key]: {
        ...state[key],
        ...data
      }
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
  } else if (isObject(state[key].payload)) {
    return {
      ...state,
      [key]: {
        ...state[key],
        ...action.payload,
      }
    }
  }

  return {
    ...state,
    [key]: action.payload
  }
};

export const updateReducers = (
  state: Object,
  action: Action,
  settings: ActionSettings
): Object => {
  const { idKey, key } = settings;
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
  } else if (isObject(state[key].payload)) {
    return {
      ...state,
      [key]: {
        ...state[key],
        ...action.payload,
      }
    }
  }

  return {
    ...state,
    [key]: action.payload
  }
};

export const deleteReducers = (
  state: Object,
  action: Action,
  settings: ActionSettings
): Object => {
  const { idKey, key } = settings;
  const itemId = action.payload;

  if (isMap(state[key])) {
    const data = state[key];
    const cloneData = cloneMap(data);

    cloneData.delete(itemId);

    return {
      ...state,
      [key]: cloneData
    }
  } else if (isMap(state[key].payload)) {
    const data = state[key].payload;
    const cloneData = cloneMap(data);

    cloneData.delete(itemId);

    return {
      ...state,
      [key]: {
        ...state[key],
        payload: cloneData
      }
    }
  } else if (isArray(state[key])) {
    const cloneData = [ ...state[key] ];
    const updatedData = cloneData.filter(item => item[idKey] !== itemId);

    return {
      ...state,
      [key]: updatedData
    }
  } else if (state[key].payload && isArray(state[key].payload)) {
    const cloneData = [ ...state[key].payload ];
    const updatedData = cloneData.filter(item => item[idKey] !== itemId);

    return {
      ...state,
      [key]: {
        ...state[key],
        payload: updatedData
      }
    }
  }

  return state
};

export const clearReducers = (
  state: Object,
  action: Action,
  settings: ActionSettings
) => {
  const { key }  = settings;

  return {
    ...state,
    [key]: action.payload
  }
};
