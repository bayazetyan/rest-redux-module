# Readme

![](.gitbook/assets/logo.png)

This tool is used to manage the application state. It makes the application state more predictable and more powerful.

## Documentation

[REST Service](./#rest)

[Redux Module](./#redux-module)

### Install

```text
yarn add rest-redux-actions
```

or

```text
npm install --save rest-redux-actions
```

## Getting Started

For example you can use this files structure

```text
├── src/  
|   ├── reducers  
|   |   ├── products-reducer.js  
|   ├── containers  
|   |   ├── ProductsContainer.js  
|   ├── pages  
|   |   ├── Products.js
|   ├── services  
|   |   ├── api
|   |   |   ├── ProductsAPI.js
└── App.js
```

**App.js** The first you need initialize global settings, add this into your app.js file

```javascript
import RESTService from 'rest-redux-actions';

RESTService.init({  
  headers: {}, // Your App headers here default {'Accept': 'application/json', 'Content-Type': 'application/json'}
  baseUrl: '', // Your App base url here
  apiUrl: '', //  Your App API url here
  applicationId: 'APP_ID', // Your App application id name (optional), default null,
  fetchTimeout: 60 * 1000, // Request time out default 1m
  timeoutMessage: 'Request timed out',
  token: '' // The authentication token name
});
```

> For save token you can use this static method
>
> ```javascript
> RESTSerivece.saveToken('---token---');
> ```

**ProductsAPI.js**

```javascript
import RESTService from 'rest-redux-actions';

const rest = new RESTService();

export const getProducts = () => {  
  const uri = 'products';  

  return rest.get(uri).then(response => response.json());  
};
```

**products-reducer.js**

```javascript
import { ReduxModule } from 'rest-redux-actions';
import { getProducts } from '../services/api/ProductsAPI';

const settings = {  
  prefix: 'PRODUCTS',  // set actions prefix
  responseMap: {  // If your API used alternative response structure you can manipulate change responseMap object or use alternativeResponse method in action creator
    message: 'message',  
    status: 'status',  
    error: 'error',
 },
 defaultState: { // default state
    data: []
 }
};

const productModule = new ReduxModule(settings);

const fetchProductsAction = productModule.createGetAction({   
  apiCall: getAllProducts,   
});

export actions = {
  fetchProducts: fetchProductsAction
}

export default productModule.createReducer();
```

**ProductsContainer.js**

```javascript
import { connect } from 'react-redux';  
import Products from '../pages/Products';  
import { actions } from '../reducers/products-reducer';    
import { bindComplexActionCreators } from 'rest-redux-actions';  

const mapStatToProps = (state) => {
  return { ...state.products }
}; 

const mapDispatchToProps = (dispatch) => ({  
  ...bindComplexActionCreators(actions, dispatch),
});  

export default connect(mapStatToProps, mapDispatchToProps)(Product);
```

**Products.js**

```javascript
import React, { PureComponent } from 'react';

export default Products extends PureComponent {
  componentDidMoint() {
    this.props.getProducts();
  }

  render () {
    console.log(this.props.data)
    // log
    //{
    //    status: 2 // 0 - error, 1 - pending, 2 - success
    //    payload: [], // your data,
    //    error: null // error text
    //}
    return (
        <div>
         ...some ui elements
        </div>
    )
  }
}
```

## REST

## Redux Module

