// @flow

export const needToShowIndicator = (status: number): boolean => ( status === 1 );

export const combineStatuses = (...args: number[]) => {
  return args.filter(status => status === 1).length ? 1 : 2;
};
