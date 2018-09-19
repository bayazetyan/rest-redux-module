import * as Actions from './actionTypes'
import { handleActions } from './handleActions';
import { isFunction, isArray } from '../utils/misk';

import {
  getReducers,
  addReducers,
  clearReducers,
  deleteReducers,
  updateReducers,
} from './reducers';

const resultKey = 'data';
const pendingResult = { status: 1, error: null };
const successResult = { status: 2, error: null };

const defaultResponseMap = {
  message: 'message',
  status: 'status',
  data: 'data',
};

export default class ReduxModule {
  constructor(props: ModuleProps) {
    const {
      prefix,
      defaultState,
      responseMap = {},
    } = props;

    this.prefix = prefix;

    // Actions groups
    this.getActions = [];
    this.addActions = [];
    this.updateActions = [];
    this.deleteActions = [];
    this.clearActions = [];

    this.defaultState = defaultState;
    this.responseMap = {...defaultResponseMap, ...responseMap};
  }

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

  createAction = (props: ActionProps, type: string): Function => {
    const { name, key, idKey, apiCall, withoutResponse } = props;

    this[`${key}withoutResponse`] = !apiCall || withoutResponse;

    const actionName = name || type;
    this.getActionGroup(type).push({
      idKey,
      actionName,
      withoutResponse,
      key: key || resultKey
    });

    return (dispatch, ...args) => {
      const getArguments = Actions.CLEAR === type ? [this.defaultState[key]] : args;

      const newArguments = [ dispatch, props, getArguments, actionName ];
      return this.apiCallAction.apply(undefined, newArguments);
    };
  };

  createGetAction = (props: ActionProps): Function => this.createAction(props, Actions.GET);

  createAddAction = (props: ActionProps): Function => this.createAction(props, Actions.CREATE);

  createUpdateAction = (props: ActionProps): Function => this.createAction(props, Actions.UPDATE);

  createDeleteAction = (props: ActionProps): Function => this.createAction(props, Actions.DELETE);

  createClearAction = (props: ActionProps): Function => this.createAction(props, Actions.CLEAR);

  apiCallAction = (
    dispatch: Dispatch,
    props: ActionProps,
    apiCallArguments: any[],
    actionName: string
  ): Action | Promise<Action> => {
    const { apiCall, alternativeResponse, alternativeRequest } = props;
    const { data, message, status } = this.responseMap;

    const actionType = `${actionName}_${this.prefix}`;

    if (isFunction(alternativeRequest)) {
      return alternativeRequest(dispatch, apiCallArguments);
    }

    if (!apiCall) {
      this.localAction(dispatch, actionType, apiCallArguments, props)
    } else {
      dispatch({ type: actionType, payload: pendingResult });

      return apiCall(...apiCallArguments)
        .then(response => {
          if (!isArray(response) &&
            response[status] !== void(0) &&
            (response[status] === 'failure' || response[status] !== 0)
          ) {
            dispatch({
              type: actionType,
              payload: {
                status: 0,
                error: response[message] || response.error
              }
            });
          }

          if (isFunction(alternativeResponse)) {
            dispatch({
              type: actionType,
              payload: {
                ...successResult,
                payload: alternativeResponse(response)
              }
            });
          } else if (response[data]) {
            dispatch({
              type: actionType,
              payload: {
                ...successResult,
                payload: response[data]
              }
            });
          }

          return response;
        }).catch(response => {
          dispatch({
            type: actionType,
            payload:  {
              status: 0,
              error: response[message] || response.error,
            }
          });

          return response;
      });
    }
  };

  localAction = (
    dispatch: Dispatch,
    actionType: string,
    actionArguments: Array,
    props: ActionProps
  ): Action => {
    const { prepareData } = props;
    const data = !!prepareData ? prepareData(actionArguments[0]) : actionArguments[0];

    return dispatch({
      type: actionType,
      payload: data
    });
  };

  combineActions = (actionSettings: ActionSettings[], type: string) => {
    const reducer = {};

    actionSettings.forEach(settings => {
      if (!settings.withoutResponse) {
        reducer[`${settings.actionName}_${this.prefix}`] = (state, action) => {
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

  dataReducer = () => {
    return {
      ...this.combineActions(this.getActions, Actions.GET),
      ...this.combineActions(this.addActions, Actions.CREATE),
      ...this.combineActions(this.clearActions, Actions.CLEAR),
      ...this.combineActions(this.updateActions, Actions.UPDATE),
      ...this.combineActions(this.deleteActions, Actions.DELETE),
    }
  };

  generateDefaultState = () => {
    const defaultState = {};

    if (this.defaultState) {
      Object.keys(this.defaultState).forEach(key => {
        if (this[`${key}withoutResponse`]) {
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

  createReducer = () => {
    return handleActions(this.dataReducer(), this.generateDefaultState());
  };
}
