// @flow

const GET = 'GET';
const PUT = 'PUT';
const POST = 'POST';
const DELETE = 'DELETE';
const FETCH_TIMEOUT = 60 * 1000;

const defaultSettings = {
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  token: 'bearer'
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
    RESTService.applicationId = settings.applicationId || '';
  };

  static saveToken = (token) => {
    RESTService.token = token;
  };

  f = (path, method = GET, data = null, options = null) => {
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
        reject(new Error('Request timed out'));
      }, FETCH_TIMEOUT);

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
    const { headers, token } = RESTService.settings;

    const requestHeaders = {
      'X-CLIENT-TYPE': 'user_mobile',
      'X-APPLICATION-ID': RESTService.applicationId,
      ...headers,
      ...this.getTokenHeader(token)
    };

    return { headers: requestHeaders };
  };

  getTokenHeader = (type) => {
    switch (type.toUpperCase()) {
      case 'bearer':
        return { Authorization: `Bearer ${RESTService.token}`, };
      case 'x-token':
        return { 'X-USER-TOKEN': `${RESTService.token}`, };
      default:
        return {};
    }
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

  get = (path, data = null, options = null) => this.f(path, GET, data, options);

  post = (path, data, options = null) => this.f(path, POST, data, options);

  put = (path, data, options = null) => this.f(path, PUT, data, options);

  delete = (path, options = null) => this.f(path, DELETE, null, options);
}
