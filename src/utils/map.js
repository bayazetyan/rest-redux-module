// @flow
import {
  isArray,
  isObject,
  deepClone,
} from '../utils/misc';

export const createMap = (data: any, idKeys: string[], override: boolean = false): Result => {
  const map = {};
  const hasPayload = !!data.payload;
  const isPending = data.status && data.status === 1;

  const payload = hasPayload ? deepClone(data.payload) : isPending ? {} : deepClone(data);

  if (!idKeys || !idKeys.length) {
    return hasPayload || isPending ? { ...data, payload } : payload;
  }

  if (isObject(payload)) {
    idKeys.reduce((prev, next, i) => {
      if (!payload[next]) {
        if (i === idKeys.length - 1) {
          return prev[next] = payload;
        } else {
          return prev[next] = {}
        }
      }  else if (payload[next]){
        return prev[next] = {}
      } else {
        return prev[next] = payload;
      }
    }, map);
  } else if (isArray(payload)) {

    payload && payload.length && payload.forEach(item => {
      idKeys.reduce((prev, next, index, iterator) => {

        if (!item[next] && !prev[next] && index < iterator.length - 1) {
          return prev[next] = {};
        } else if (prev[next] && index < iterator.length - 1) {
          return prev[next];
        } else {
          const key = item[next] || next;

           if (prev && prev[key]) {
            if ( Array.isArray(prev[key])) {
              prev[key] = [ ...prev[key], item ]
            } else {
              if (override) {
                prev[key] = item
              } else {
                prev[key] = [ prev[key], item ]
              }
            }
          } else {
             prev[key] = item
          }
        }
      }, map);
    });
  } else if (!isPending) {
    idKeys.reduce((prev, next, i) => {
      const isFinished = idKeys.length === i + 1;

      if (!prev[next]) {
        prev[next] = isFinished ? payload :{};
        return prev[next];
      } else {
        prev[next] = payload;
      }
    }, map);
  }

  return hasPayload || isPending ? { ...data, payload: map } : map;
};

export const getNestedData = (obj: Object, keys: string[]) => {
  return keys.reduce((prev, next) => {
    if (prev && prev[next]) {
      return prev[next]
    } else if (prev && !prev[next]) {
      return prev
    }
  } , obj)
};
