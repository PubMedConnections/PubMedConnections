import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import App from './App';
import Home from './pages/Home'
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <BrowserRouter>
    {/* <Home /> */}
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
