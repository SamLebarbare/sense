import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import { createStore } from "redux";
import { Provider } from "react-redux";

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const touchIds = [];
const touches = {};
for (let a = 1; a <= 7; a++) {
  for (let b = 1; b <= 7; b++) {
    touchIds.push(`${a}-${b}`);
    touches[`${a}-${b}`] = { order: `${a}-${b}`, isPlaying: false };
  }
}

const initialState = {
  touchIds,
  touches
};

const store = createStore((state = initialState, action) => {
  switch (action.type) {
    case "START_PLAY_TOUCH": {
      const newState = Object.assign({}, state);
      newState.touches[action.order].isPlaying = true;
      return newState;
    }
    case "END_PLAY_TOUCH": {
      const newState = Object.assign({}, state);
      newState.touches[action.order].isPlaying = false;
      return newState;
    }
    default:
      return state;
  }
});

ReactDOM.render(
  <Provider store={store}>
    <App audioCtx={audioCtx} />
  </Provider>,
  document.getElementById("root")
);
registerServiceWorker();
