//@flow

import * as Actions from './actionTypes'
import { handleActions } from './handleActions';
import { isFunction } from '../utils/misk';

import {
  getReducers,
  addReducers,
  clearReducers,
  deleteReducers,
  updateReducers,
} from './reducers';

import {
  RESULT_KEY,
  PENDING_RESULT,
  SUCCESS_RESULT,
  DEFAULT_RESPONSE_MAP,
} from '../constants';

export default class ReduxModule {
  static globalSettings = {};

  static init = (settings = {}) => {
    ReduxModule.globalSettings = settings;
  };

  constructor(props: ModuleProps) {
    const {
      prefix,
      defaultState,
      responseMap = {},
    } = props;

    this.prefix = prefix;

    // Action groups
    this.getActions = [];
    this.addActions = [];
    this.updateActions = [];
    this.deleteActions = [];
    this.clearActions = [];

    this.defaultState = defaultState;

    this.responseMap = responseMap;
  }

  _getResponseMap = () => {
    return {
      ...DEFAULT_RESPONSE_MAP,
      ...ReduxModule.globalSettings.responseMap,
      ...this.responseMap,
    }
  };

  _createActionFullName = (actionName: string): string => {
    const pendingAction = `${actionName}_PENDING`;
    const errorAction = `${actionName}_ERROR`;
    const successAction = `${actionName}_SUCCESS`;

    return `${successAction}|${pendingAction}|${errorAction}`;
  };

  _createAction = (props: ActionProps, type: string): Function => {
    const {
      key,
      name,
      idKey,
      apiCall,
      withoutStatus = false,
      returnResponse = false,
      withoutResponse = false,
    } = props;

    const actionName = name || type;

    if (key && !this[`has_${key}`]) {
      this[`has_${key}`] = true;
      this[`${key}withoutStatus`] = !apiCall || withoutStatus || withoutResponse;
    }

    this.getActionGroup(type).push({
      idKey,
      actionName,
      withoutStatus,
      returnResponse,
      withoutResponse,
      key: key || RESULT_KEY,
    });

    return (dispatch, ...args) => {
      const getArguments = Actions.CLEAR === type ? [this.defaultState[key]] : args;

      const newArguments = [ dispatch, props, getArguments, actionName ];
      return this.apiCallAction.apply(undefined, newArguments);
    };
  };

  getActionGroup = (type: string): Array => {
    switch (type) {
      case Actions.CREATE:
        return this.addActions;
      case Actions.UPDATE:
        return this.updateActions;
      case Actions.CLEAR:
        return this.clearActions;
      case Actions.DELETE:
        return this.deleteActions;
      default:
        return this.getActions;
    }
  };

  getResponseData = (response: any, returnResponse: boolean): any => {
    const { data } = this._getResponseMap();

    try {
      return returnResponse ? response : response[data];
    } catch (e) {
      return response
    }
  };

  getReducers = () => {
    return {
      ...this.combineActions(this.getActions, Actions.GET),
      ...this.combineActions(this.addActions, Actions.CREATE),
      ...this.combineActions(this.clearActions, Actions.CLEAR),
      ...this.combineActions(this.updateActions, Actions.UPDATE),
      ...this.combineActions(this.deleteActions, Actions.DELETE),
    }
  };

  combineActions = (actionSettings: ActionSettings[], type: string) => {
    const reducer = {};

    actionSettings.forEach(settings => {
      if (!settings.withoutResponse) {
        const actionType = `${settings.actionName}_${this.prefix}`;

        reducer[this._createActionFullName(actionType)] = (state, action) => {

          if (type === Actions.GET) {
            return getReducers(state, action, settings)
          } else if (type === Actions.CREATE) {
            return addReducers(state, action, settings);
          } else if (type === Actions.UPDATE) {
            return updateReducers(state, action, settings);
          } else if (type === Actions.DELETE) {
            return deleteReducers(state, action, settings);
          } else if (type === Actions.CLEAR) {
            return clearReducers(state, action, settings);
          } else {
            return state
          }
        }
      }
    });

    return reducer;
  };

  apiCallAction = (
    dispatch: Dispatch,
    props: ActionProps,
    apiCallArguments: any[],
    actionName: string
  ): Action | Promise<Action> => {
    const {
      apiCall,
      callBack,
      withoutStatus,
      returnResponse,
      localUpdate,
      alternativeRequest,
      alternativeResponse,
    } = props;

    const { message, status, successStatusValue, errors } = this._getResponseMap();

    const actionType = `${actionName}_${this.prefix}`;

    if (isFunction(alternativeRequest)) {
      return alternativeRequest(dispatch, apiCallArguments, actionType);
    }

    if (!apiCall) {
      this.mainAction(dispatch, actionType, apiCallArguments, props)
    } else {
      if (!withoutStatus) {
        dispatch({ type: `${actionType}_PENDING`, payload: PENDING_RESULT });
      }

      return apiCall(...apiCallArguments)
        .then(response => {
          if ((response[status] !== void(0) && response[status] !== successStatusValue) || response[errors]) {
            dispatch({
              type: `${actionType}_ERROR`,
              payload: {
                status: 0,
                error: response[message] || response[errors] || response.error
              }
            });
          } else {
            const hasAlternativeResponse = isFunction(alternativeResponse);
            const responseData = hasAlternativeResponse
              ? alternativeResponse(response)
              : this.getResponseData(response, returnResponse);

            const payloadData = localUpdate ? apiCallArguments[0] : responseData;

            const payload = withoutStatus
              ? payloadData
              : { ...SUCCESS_RESULT, payload: payloadData };

            dispatch({
              payload,
              type: `${actionType}_SUCCESS`,
            });
          }

          if (isFunction(callBack)) {
            callBack(response, dispatch);
          }

          return response;
        }).catch(response => {
          dispatch({
            type: `${actionType}_ERROR`,
            payload:  {
              status: 0,
              error: response[message] || response[errors] || response.error,
            }
          });

          return response;
      });
    }
  };

  mainAction = (
    dispatch: Dispatch,
    actionType: string,
    actionArguments: Array,
    props: ActionProps
  ): Action => {
    const { prepareData } = props;
    const data = !!prepareData ? prepareData(actionArguments[0]) : actionArguments[0];

    return dispatch({
      type: `${actionType}_SUCCESS`,
      payload: data
    });
  };

  // Actions

  createAction = (props: ActionProps): Function => this._createAction(props, Actions.GET);

  createAddAction = (props: ActionProps): Function => this._createAction(props, Actions.CREATE);

  createUpdateAction = (props: ActionProps): Function => this._createAction(props, Actions.UPDATE);

  createDeleteAction = (props: ActionProps): Function => this._createAction(props, Actions.DELETE);

  createClearAction = (props: ActionProps): Function => this._createAction(props, Actions.CLEAR);

  // Create reducer

  createDefaultState = () => {
    const defaultState = {};

    if (this.defaultState) {
      Object.keys(this.defaultState).forEach(key => {
        if (this[`${key}withoutStatus`]) {
          defaultState[key] = this.defaultState[key]
        } else {
          defaultState[key] = {
            payload: this.defaultState[key],
          }
        }
      });
    }

    return defaultState;
  };

  createReducer = (): Function => {
    const reducers = this.getReducers();
    const defaultState = this.createDefaultState();

    return handleActions(reducers, defaultState);
  };
}
