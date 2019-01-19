// @flow
import { createMap, cloneMap } from '../utils/map';
import { isMap, isArray, isObject, getActionStatusData, getActionPayload } from '../utils/misk';

export const getReducers = (
  state: Object,
  action: Action,
  settings: ActionSettings
): Object => {
  const {
    key,
    idKey,
    apiCall,
    useMap = false,
    withoutStatus = false,
  }  = settings;

  const actionData = getActionPayload(action);
  const data = idKey ? createMap(actionData, idKey, useMap) : actionData;

  if (!data) {
    return state
  }

  if (isObject(action.payload) && !withoutStatus) {
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

export const addReducers = (
  state: Object,
  action: Action,
  settings: ActionSettings
): Object => {
  const actionData = getActionPayload(action);
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
        actionData
      ]
    }
  } else if (state[key].payload && isArray(state[key].payload)) {
    const { payload, ...stateData } = actionData;
    return {
      ...state,
      [key]: {
        ...state[key],
        ...stateData,
        payload: [
          ...state[key].payload,
          payload
        ]
      }
    }
  } else if (isObject(state[key].payload)) {
    const { payload, ...stateData } = state[key];

    if (idKey) {
      return {
        ...state,
        [key]: {
          ...stateData,
          payload: {
            ...payload,
            [actionData[idKey]]: actionData,
          },
        }
      }
    } else {
      return {
        ...state,
        [key]: {
          ...stateData,
          payload: {
            ...payload,
            ...actionData,
          },
        }
      }
    }
  }

  return {
    ...state,
    [key]: actionData
  }
};

export const updateReducers = (
  state: Object,
  action: Action,
  settings: ActionSettings
): Object => {
  const { idKey, key } = settings;

  if (isMap(state[key])) {
    const item = action.payload;
    const data = state[key].payload;
    const cloneData = cloneMap(data);

    cloneData.set(item[idKey], item);

    return {
      ...state,
      [key]: cloneData
    }
  } else if (isMap(state[key].payload)) {
    const item = action.payload.payload;
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

    cloneData[updatedElementIndex] = { ...cloneData[updatedElementIndex], ...action.payload };

    return {
      ...state,
      [key]: cloneData
    }
  } else if (state[key].payload && isArray(state[key].payload)) {
    const cloneData = [ ...state[key].payload ];

    if (action.payload.payload) {
      const updatedElementIndex = cloneData.findIndex(item => item[idKey] === action.payload.payload[idKey]);

      cloneData[updatedElementIndex] = action.payload.payload;
    }

    return {
      ...state,
      [key]: {
        ...state[key],
        ...action.payload,
        payload: cloneData
      }
    }
  } else if (isObject(state[key].payload)) {
    const { payload, ...stateData } = state[key];

    if (idKey) {
      return {
        ...state,
        [key]: {
          ...stateData,
          ...getActionStatusData(action),
          payload: {
            ...payload,
            [action.payload[idKey]]: getActionPayload(action).payload,
          }
        }
      }
    } else {
      return {
        ...state,
        [key]: {
          ...stateData,
          ...getActionStatusData(action),
          payload: {
            ...payload,
            ...getActionPayload(action).payload,
          }
        }
      }
    }
  }

  if (idKey) {
    return {
      ...state,
      [key]: {
        ...state[key],
        [action.payload[idKey]]: action.payload,
      }
    }
  } else {
    return {
      ...state,
      [key]: action.payload
    }
  }
};

export const deleteReducers = (
  state: Object,
  action: Action,
  settings: ActionSettings
): Object => {
  const { idKey, key } = settings;

  if (isMap(state[key])) {
    const itemId = action.payload;
    const data = state[key];
    const cloneData = cloneMap(data);

    cloneData.delete(itemId);

    return {
      ...state,
      [key]: cloneData
    }
  } else if (isMap(state[key].payload)) {
    const itemId = action.payload.payload;
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
    const itemId = action.payload;
    const cloneData = [ ...state[key] ];
    const updatedData = cloneData.filter(item => item[idKey] !== itemId);

    return {
      ...state,
      [key]: updatedData
    }
  } else if (state[key].payload && isArray(state[key].payload)) {
    const itemId = action.payload.payload;

    const cloneData = [ ...state[key].payload ];
    const updatedData = cloneData.filter(item => item[idKey] !== itemId);

    return {
      ...state,
      [key]: {
        ...state[key],
        ...action.payload,
        payload: updatedData,
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
