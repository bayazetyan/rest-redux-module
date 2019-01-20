// @flow

import RESTService from './rest/RESTService';

import ReduxModule from './redux/ReduxModule';
import { bindComplexActionCreators } from './redux/bindComplexActionCreators';

import { needToShowIndicator, combineStatuses } from './helpers';
import { isObject } from './utils/misc';

const createConfigs = (configs: Object) => {
  const { restConfigs, reduxConfigs } = configs;

  if (reduxConfigs && isObject(reduxConfigs))
    ReduxModule.init(reduxConfigs);

  if (restConfigs && isObject(restConfigs))
    RESTService.init(restConfigs);
};

export {
  ReduxModule,
  RESTService,
  createConfigs,
  combineStatuses,
  needToShowIndicator,
  bindComplexActionCreators,
};
