// @flow

export const generateException = (message: string): string => {
  throw new Error(message);
};
