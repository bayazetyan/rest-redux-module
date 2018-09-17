// @flow

const GET = 'GET';
const PUT = 'UPDATE';
const POST = 'CREATE';
const DELETE = 'DELETE';

const defaultHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

const defaultSettings = {
  fetchTimeOut: 60 * 1000,
  timeOutMessage: 'Request timed out',
};

export default class RESTService {
  static token;
  static apiUrl;
  static baseUrl;
  static applicationId;
  static settings = defaultSettings;

  static init = (settings = {}) => {
    RESTService.settings = { ...RESTService.settings, ...settings };
    RESTService.apiUrl = settings.apiUrl || '';
    RESTService.baseUrl = settings.baseUrl || '';
  };

  static saveToken = (token) => {
    RESTService.token = token;
  };

  _fetch = (path, method = GET, data = null, options = null) => {
    let requestUrl = `${RESTService.baseUrl}${RESTService.apiUrl}${path}`;
    let didTimeOut = false;
    let body = data;

    if (method === GET && body) {
      const urlWithParams = this.urlWithParams(body);

      requestUrl += `?${urlWithParams}`;
    }

    if (body && method !== GET)
      body = JSON.stringify(data);

    const requestOptions = this.mergeOptions(method, body, options);

    return new Promise(function(resolve, reject) {
      const timeout = setTimeout(() => {
        didTimeOut = true;
        reject(new Error(RESTService.settings.timeOutMessage));
      }, RESTService.settings.fetchTimeOut);

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

  getHeaders = () => {
    const { headers, token, applicationId } = RESTService.settings;

    const requestHeaders = {
      ...defaultHeaders,
      ...headers,
      ...this.getToken(token),
    };

    if (applicationId) {
      requestHeaders[applicationId] = RESTService.applicationId;
    }

    return { headers: requestHeaders };
  };

  getToken = (token) => {
    return token ? {
      [token]: RESTService.token
    } : {};
  };

  urlWithParams = obj => {
    let url = '';

    Object.keys(obj).forEach(key => {
      if (Array.isArray(key))
        url += `${this.parseArray(key, obj[key])}&`;
      else
        url += `${key}=${obj[key]}&`;
    });

    return url.substring(0, url.length - 1);
  };

  parseArray = (values, paramName) => {
    const data = values.map(value => `${paramName}[]=${value}`);
    return data.join('&');
  };

  mergeOptions = (method, body, opt) => {
    const options = {
      method,
      ...opt,
      ...this.getHeaders(),
    };

    if (body && method !== GET)
      options.body = body;

    return options;
  };

  get = (path, data = null, options = null) => this._fetch(path, GET, data, options);

  post = (path, data, options = null) => this._fetch(path, POST, data, options);

  put = (path, data, options = null) => this._fetch(path, PUT, data, options);

  delete = (path, data, options = null) => this._fetch(path, DELETE, data, options);
}
