// @flow

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
  static applicationId;
  static settings = defaultSettings;

  static init = (settings: Object = {}): void => {
    RESTService.settings = { ...RESTService.settings, ...settings };
    RESTService.apiUrl = settings.apiUrl || '';
    RESTService.baseUrl = settings.baseUrl || '';
  };

  static saveToken = (token): void => {
    RESTService.token = token;
  };

  _fetch = (
    path: string,
    method: string = GET,
    data: ?Object = null,
    options: ?Object = null
  ): Promise => {
    let requestUrl = `${RESTService.baseUrl}${RESTService.apiUrl}${path}`;
    let didTimeOut = false;
    let body = null;

    if (data) {
      if (method === GET || RESTService.settings.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
        const urlWithParams = this.urlWithParams(data);

        requestUrl += `?${urlWithParams}`;
      } else if (RESTService.settings.headers['Content-Type'] === 'application/json') {
        body = JSON.stringify(data);
      }
    }

    const requestOptions = this.mergeOptions(method, body, options);

    return new Promise(function(resolve, reject) {
      const timeout = setTimeout(() => {
        didTimeOut = true;
        reject(new Error(RESTService.settings.timeoutMessage));
      }, RESTService.settings.fetchTimeout);

      if ((typeof __REMOTEDEV__ !== 'undefined' || process.env.NODE_ENV === 'development')
        && RESTService.settings.logger)
      {
        console.group(`${requestUrl} - ${method}`);
        console.log(
          '%c Request Headers: \t',
          'color: #FC4044; font-size: 11px; font-weight: bold;',
          requestOptions.headers
        );

        if (data)
          console.log(
            '%c Request Body: \t',
            'color: #00cc4b; font-size: 11px; font-weight: bold;',
            data
          );

        console.groupEnd();
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

  getHeaders = (): Object => {
    const { headers, tokenType, applicationId } = RESTService.settings;

    const requestHeaders = {
      ...defaultHeaders,
      ...headers,
      ...this.getToken(tokenType),
    };

    if (applicationId) {
      requestHeaders[applicationId] = RESTService.applicationId;
    }

    return { headers: requestHeaders };
  };

  getToken = (tokenType: string): {[key: string]: string} | Object => {
    return tokenType ? {
      [tokenType]: RESTService.token
    } : {};
  };

  urlWithParams = (data: {[key: string]: any}): string => {
    let url = '';

    Object.keys(data).forEach(key => {
      if (Array.isArray(key))
        url += `${this.parseArray(key, data[key])}&`;
      else
        url += `${key}=${data[key]}&`;
    });

    return url.substring(0, url.length - 1);
  };

  parseArray = (values: string[], paramName: string): string => {
    const data = values.map(value => `${paramName}[]=${value}`);

    return data.join('&');
  };

  mergeOptions = (method: string, body: ?string | ?Object, opt: ?Object = {}): Object => {
    const options = {
      method,
      ...RESTService.settings.options,
      ...opt,
      ...this.getHeaders(),
    };

    if (body)
      options.body = body;

    return options;
  };

  get = (
    path: string,
    data: ?Object = null,
    options: ?Object = null
  ) => this._fetch(path, GET, data, options);

  post = (
    path: string,
    data: ?Object,
    options: ?Object = null
  ) => this._fetch(path, POST, data, options);

  put = (
    path: string,
    data: ?Object,
    options: ?Object = null
  ) => this._fetch(path, PUT, data, options);

  delete = (
    path: string,
    data: ?Object,
    options: ?Object = null
  ) => this._fetch(path, DELETE, data, options);
}
