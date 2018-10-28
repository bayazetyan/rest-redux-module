import { ReduxModule } from '../src';
import { dispatch } from './testUtils';

test('create Action without apiCall', () => {
  const settings = {
    prefix: 'TEST',
  };

  const module = new ReduxModule(settings);
  const data = { /* some data for action */ };

  const action = module.createAction({
    key: 'result',
    name: 'WITHOUT_API_CALL',
  });

  const actionsResult = {
    type: 'WITHOUT_API_CALL_TEST_SUCCESS',
    payload: data,
  };

  expect(action(dispatch, data)).toEqual(actionsResult);
});

test('throws an error if prefix is not defined', () => {
 expect(() => {
   const settings = {};
   const module = new ReduxModule(settings);

   const action = module.createAction({
     key: 'result',
     name: 'WITHOUT_API_CALL',
   });

   action(dispatch, data)

 }).toThrow('The "prefix" value is required');
});
