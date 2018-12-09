import React, { Component } from 'react';
import InputTime from './components/InputTime';
import './App.css';

class App extends Component {

  render() {
    return (
      <div className="App">
        <h1>Date/Time test app</h1>
        <InputTime id="myTime" placeholder={ {hour: "hh", min: "mm"} } />
        <br />
        <input />
        <br /><br />
      </div>
    );
  }
}

export default App;
