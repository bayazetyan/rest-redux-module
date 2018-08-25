// @flow

export const needToShowIndicator = (status: number): boolean => {
  switch (status) {
    case 1:
      return true;
    default:
      return false;
  }
};
