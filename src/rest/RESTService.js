// @flow
import { deleteForbiddenSymbols } from '../utils/misc';

const GET = 'GET';
const PUT = 'PUT';
const POST = 'POST';
const DELETE = 'DELETE';

const defaultHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

const defaultSettings = {
  fetchTimeout: 60 * 1000,
  timeoutMessage: 'Request timed out',
  logger: false,
  options: {},
};

export default class RESTService {
  static token;
  static apiUrl;
  static baseUrl;
  static settings = defaultSettings;

  static init = (settings: Object = {}): void => {
    RESTService.settings = { ...RESTService.settings, ...settings };

    RESTService.apiUrl = settings.apiUrl || '';
    RESTService.baseUrl = settings.baseUrl || '';
  };

  static updateSettings = (settings: Object) => {
    const { options, headers, ...otherSettings } = settings;

    const {
      options: defaultOptions,
      headers: defaultHeaders,
      ...defaultSettings
    } = RESTService.settings;

    RESTService.settings = {
      ...defaultSettings,
      ...otherSettings,
      headers: { ...defaultHeaders, ...headers },
      options: { ...defaultOptions, ...options },
    };
  };

  static saveToken = (token: string): void => {
    RESTService.token = token;
  };

  _fetch = (
    path: string,
    method: string = GET,
    data: ?Object,
    opt: ?Object
  ): Promise => {
    const { host: baseUrl, ...options } = opt;
    const host = baseUrl || RESTService.baseUrl;

    let requestUrl = `${host}${RESTService.apiUrl}${path}`;
    let didTimeOut = false;
    let body = null;

    const requestOptions = this.mergeOptions(method, options);

    if (data) {
      if (method === GET || requestOptions.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
        const urlWithParams = this.urlWithParams(data);

        requestUrl += `?${urlWithParams}`;
      } else if (requestOptions.headers['Content-Type'] === 'application/json'
        || requestOptions.headers['Content-Type'] === 'text/json'
      ) {
        body = JSON.stringify(data);
      } else {
        body = data;
      }
    }

    if (body)
      requestOptions.body = body;

    return new Promise(function(resolve, reject) {
      const timeout = setTimeout(() => {
        didTimeOut = true;
        reject(new Error(RESTService.settings.timeoutMessage));
      }, RESTService.settings.fetchTimeout);

      try {
        if ((typeof __REMOTEDEV__ !== 'undefined' || process.env.NODE_ENV === 'development')
          && RESTService.settings.logger)
        {
          console.group(`${requestUrl} - ${method}`);
          console.log(
            '%c Request Headers: \t',
            'color: #FC4044; font-size: 11px; font-weight: bold;',
            requestOptions.headers
          );

          if (data) {
            console.log(
              '%c Request Body: \t',
              'color: #00cc4b; font-size: 11px; font-weight: bold;',
              data
            );
          }

          console.groupEnd();
        }

      } catch (e) {
        console.log(e);
      }

      fetch(requestUrl, requestOptions)
        .then(function(response) {
          clearTimeout(timeout);
          if (!didTimeOut) {
            resolve(response);
          }
        }).catch(function(err) {
          if (didTimeOut) return;
          reject(err);
        });
    });
  };

  getHeaders = (customHeaders: ?Object = {}): Object => {
    const { headers, tokenType } = RESTService.settings;

    const requestHeaders = {
      ...defaultHeaders,
      ...headers,
      ...customHeaders,
      ...this.getToken(tokenType),
    };

    return { headers: requestHeaders };
  };

  getToken = (tokenType: string): {[key: string]: string} | Object => {
    return !!RESTService.token ? {
      [tokenType]: RESTService.token
    } : {};
  };

  urlWithParams = (data: {[key: string]: any}): string => {
    let url = '';

    Object.keys(data).forEach(key => {
      if (Array.isArray(data[key]))
        url += `${this.parseArray(data[key], key)}&`;
      else
        url += `${key}=${deleteForbiddenSymbols(data[key])}&`;
    });

    return url.substring(0, url.length - 1);
  };

  parseArray = (values: string[], paramName: string): string => {
    const data = values.map(value => `${paramName}[]=${deleteForbiddenSymbols(value)}`);

    return data.join('&');
  };

  mergeOptions = (method: string, opt: ?Object): Object => {

    if (opt !== null) {
      const { headers, ...options } = opt;

      return {
        method,
        ...RESTService.settings.options,
        ...this.getHeaders(headers),
        ...options,
      }
    } else {
      return {
        method,
        ...RESTService.settings.options,
        ...this.getHeaders(),
      }
    }
  };

  get = (
    path: string,
    data: ?Object = null,
    options: ?Object = {}
  ) => this._fetch(path, GET, data, options);

  post = (
    path: string,
    data: ?Object,
    options: ?Object = {}
  ) => this._fetch(path, POST, data, options);

  put = (
    path: string,
    data: ?Object,
    options: ?Object = {}
  ) => this._fetch(path, PUT, data, options);

  delete = (
    path: string,
    data: ?Object,
    options: ?Object = {}
  ) => this._fetch(path, DELETE, data, options);
}
