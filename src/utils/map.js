// @flow
import {
  isArray,
  isObject,
} from '../utils/misc';

export const createMap = (data: Action | Array | Object, idKeys: string[], hasPayload: boolean): Result => {
  const map = {};
  const list = data.payload || data;

  if (isObject(list)) {
    idKeys.reduce((prev, next, i) => {
      if (!list[next]) {
        if (i === idKeys.length - 1) {
          return prev[next] = list;
        } else {
          return prev[next] = {}
        }
      }
    }, map);
  } else if (isArray(list)) {
    list && list.length && list.forEach(item => {
      idKeys.reduce((prev, next) => {
        if (!item[next] && !prev[next]) {
          return prev[next] = {}
        } else if (prev[next]) {
          return prev[next];
        } else {
          if (prev[item[next]]) {

            if ( Array.isArray(prev[item[next]])) {
              prev[item[next]] = [ ...prev[item[next]], item ]
            } else {
              prev[item[next]] = [ prev[item[next]], item ]
            }
          } else {
            prev[item[next]] = item
          }
        }
      }, map);
    });
  }
  console.log('LOG ::::::> !data.payload <::::::',!data.payload)
  return hasPayload ? { ...data, payload: map } : map;
};
