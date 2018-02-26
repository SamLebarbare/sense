import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import logo from "./logo.svg";
import "./App.css";

class Potard extends React.PureComponent {
  render() {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="40mm"
        height="40mm"
        viewBox="0 0 141.73228 141.73228"
        id="svg2"
        transform={`rotate(${-1 * (120 - this.props.value)})`}
      >
        <defs id="defs4" />
        <g id="layer1" transform="translate(0,-910.62991)">
          <g id="g8079" transform="translate(-94.954339,103.54064)">
            <g
              style={{ fill: "#000000", fillOpacity: 1 }}
              transform="matrix(0.14137034,0,0,0.13631957,124.0442,733.31563)"
              id="g8072"
            >
              <circle
                style={{ opacity: 0.80699978, fill: "#000000", fillOpacity: 1 }}
                id="path8070"
                cx="155.05588"
                cy="863.97125"
                r="50"
              />
            </g>
            <g
              style={{ opacity: 1, fill: "#454837", fillOpacity: 1 }}
              id="g8075"
              transform="translate(11.616754,14.647211)"
            >
              <circle
                r="50"
                cy="863.97125"
                cx="155.05588"
                id="circle8077"
                style={{ opacity: 0.80699978, fill: "#454837", fillOpacity: 1 }}
              />
            </g>
          </g>
        </g>
      </svg>
    );
  }
}

const delay = (ctx, input, options) => {
  const leftDelay = ctx.createDelay();
  const rightDelay = ctx.createDelay();
  const feedback = ctx.createGain();
  const dryMix = ctx.createGain();
  const wetMix = ctx.createGain();
  const output = ctx.createGain();
  const merger = ctx.createChannelMerger(2);

  if (!options) {
    options = {
      time: 3 / 8,
      feedback: 0.5,
      wet: 1,
      dry: 1
    };
  }

  leftDelay.delayTime.value = options.time;
  rightDelay.delayTime.value = options.time;

  feedback.gain.value = options.feedback;
  dryMix.gain.value = options.dry;
  wetMix.gain.value = options.wet;

  input.connect(dryMix);
  input.connect(feedback);

  feedback.connect(leftDelay);
  leftDelay.connect(rightDelay);
  rightDelay.connect(feedback);

  leftDelay.connect(merger, 0, 0);
  rightDelay.connect(merger, 0, 1);
  merger.connect(wetMix);

  dryMix.connect(output);
  wetMix.connect(output);

  return output;
};

const runningOsc = {};
class Touch extends React.PureComponent {
  constructor(args) {
    super(...args);
    this.play = this.play.bind(this);
    this.stop = this.stop.bind(this);
    this.touch = this.touch.bind(this);
    this.untouch = this.untouch.bind(this);
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
    osc.type = this.props.type;
    osc.frequency.setValueAtTime(this.note, this.time);
    const delayed = delay(this.audio, osc);
    delayed.connect(this.props.output);
    return osc;
  }

  static contextTypes = {
    audio: PropTypes.object
  };

  touch() {
    this.props.dispatch({
      type: "START_PLAY"
    });
    this.play(true);
  }

  untouch() {
    this.props.dispatch({
      type: "END_PLAY"
    });
    this.stop();
  }

  play(force) {
    if (this.props.isPlaying || force === true) {
      this.props.dispatch({
        type: "START_PLAY_TOUCH",
        order: this.props.order
      });
      runningOsc[this.props.order] = this.createOsc();
      runningOsc[this.props.order].start(this.time);
    }
  }

  stop() {
    if (runningOsc[this.props.order]) {
      runningOsc[this.props.order].onended = () => {
        this.props.dispatch({
          type: "END_PLAY_TOUCH",
          order: this.props.order
        });
      };
      runningOsc[this.props.order].stop(this.time);
      delete runningOsc[this.props.order];
    }
  }

  render() {
    const { order } = this.props;
    const g = Number(this.column) * Number(this.row) * 6;
    let transform = "rotate3d(1, 0, 0, 20deg) ";
    transform += `scale3d(1,1,${this.row * 2}) `;
    transform += `translate3d(0px, ${-2 + this.row}px, -${10 * this.row}px)`;
    const grid = {
      gridColumn: this.column,
      gridRow: this.row,
      userSelect: "none",
      backgroundColor: `rgba(${g}, 19, 106, 0.200)`,
      transform: transform,
      transformStyle: "preserve-3d"
    };

    if (this.props.isPlayingTouch) {
      grid.backgroundColor = `rgba(${g}, 19, 106, 0.575)`;
    }
    return (
      <div
        style={grid}
        onMouseDown={this.touch}
        onMouseEnter={this.play}
        onMouseUp={this.untouch}
        onMouseLeave={this.stop}
      />
    );
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

  componentWillMount() {
    this.mainGain = this.props.audioCtx.createGain();
    this.mainGain.gain.setValueAtTime(0.2, this.props.audioCtx.currentTime);
    this.mainGain.connect(this.props.audioCtx.destination);
  }

  render() {
    const playStyle = {};
    if (this.props.isPlaying) {
      //playStyle.animation = "neon1 1.5s ease-in-out infinite alternate";
    }
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </header>
        <div className="grid" style={playStyle}>
          {this.props.touchIds.map(k => {
            const ConnectedTouch = connect(state => {
              const touch = state.touches[k];
              return {
                order: k,
                isPlayingTouch: touch.isPlaying,
                isPlaying: state.isPlaying
              };
            })(Touch);
            return (
              <ConnectedTouch key={k} type="sawtooth" output={this.mainGain} />
            );
          })}
        </div>
      </div>
    );
  }
}

const ConnectedSynth = connect(state => {
  return { touchIds: state.touchIds, isPlaying: state.isPlaying };
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
