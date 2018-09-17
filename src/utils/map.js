// @flow

import {isMap} from "./misk";

export const createMap = (data: Action | Array, idKey, useMap: ?boolean): Result => {
  const map = useMap ? new Map() : {};
  const list = data.payload || data;

  list && list.length && list.forEach(item => {
    if (useMap)
      map.set(item[idKey], item);
    else
      map[item[idKey]] = item;
  });

  return !data.payload ? map : { ...data, payload: map };
};

export const cloneMap = (data: Map | Object, useMap: ?boolean) => {
  return useMap ? new Map(data) : { ...data };
};

