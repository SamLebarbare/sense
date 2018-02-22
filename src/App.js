import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import logo from "./logo.svg";
import "./App.css";

class Touch extends React.PureComponent {
  constructor(args) {
    super(...args);
    this.play = this.play.bind(this);
  }

  get audio() {
    return this.context.audio;
  }

  get time() {
    return this.context.audio.currentTime;
  }

  get row() {
    return this.props.order.split("-")[0];
  }

  get column() {
    return this.props.order.split("-")[1];
  }

  get note() {
    const la = 432 * Math.pow(2, this.column - 5);
    return la * Math.pow(2, this.row / 12);
  }

  createOsc() {
    const osc = this.audio.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(this.note, this.time);
    osc.connect(this.audio.destination);
    return osc;
  }

  static contextTypes = {
    audio: PropTypes.object
  };

  play() {
    if (!this.props.isPlaying) {
      const osc = this.createOsc();
      osc.start(this.time);
      this.props.dispatch({
        type: "START_PLAY_TOUCH",
        order: this.props.order
      });
      osc.stop(this.time + 1);
      osc.onended = () => {
        this.props.dispatch({
          type: "END_PLAY_TOUCH",
          order: this.props.order
        });
      };
    }
  }

  render() {
    const { order } = this.props;
    const g = 22 + Number(this.column) * Number(this.row) * 6;
    const grid = {
      gridColumn: this.column,
      gridRow: this.row,
      backgroundColor: `rgba(20, ${g}, 18, 0.200)`
    };

    if (this.props.isPlaying) {
      grid.backgroundColor = `rgba(20, ${g}, 18, 0.575)`;
    }

    return <div style={grid} onClick={this.play} />;
  }
}

class Synth extends React.PureComponent {
  constructor(args) {
    super(...args);
  }

  static childContextTypes = {
    audio: PropTypes.object
  };

  getChildContext() {
    return { audio: this.props.audioCtx };
  }

  componentDidMount() {
    this.mainGain = this.props.audioCtx.createGain();
    this.mainGain.gain.setValueAtTime(0.5, this.props.audioCtx.currentTime);
    this.mainGain.connect(this.props.audioCtx.destination);
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">SensE</h1>
        </header>
        <div className="grid">
          {this.props.touchIds.map(k => {
            const ConnectedTouch = connect(state => {
              const touch = state.touches[k];
              return { order: k, isPlaying: touch.isPlaying };
            })(Touch);
            return <ConnectedTouch key={k} />;
          })}
        </div>
      </div>
    );
  }
}

const ConnectedSynth = connect(state => {
  return { touchIds: state.touchIds };
})(Synth);

class App extends React.PureComponent {
  constructor(args) {
    super(...args);
  }

  static childContextTypes = {
    audio: PropTypes.object
  };

  getChildContext() {
    return { audio: this.props.audioCtx };
  }

  componentDidMount() {
    this.mainGain = this.props.audioCtx.createGain();
    this.mainGain.gain.setValueAtTime(0.5, this.props.audioCtx.currentTime);
    this.mainGain.connect(this.props.audioCtx.destination);
  }

  render() {
    return <ConnectedSynth audioCtx={this.props.audioCtx} />;
  }
}

export default App;
