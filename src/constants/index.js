export const ERROR_TEXT_START = 'bindActionCreators expected an object or a function, instead received';
export const ERROR_TEXT_END = 'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?';

export const RESULT_KEY = 'data';
export const PENDING_RESULT = { status: 1, error: null };
export const SUCCESS_RESULT = { status: 2, error: null };
export const DEFAULT_RESPONSE_MAP = {
  successStatusValue: 'success',
  message: 'message',
  errors: 'errors',
  status: 'status',
  data: 'data',
};
