const audio = {
  /** @type {AudioContext} */
  _actx: null,
  _inited: false,
  _started: false,
  /** @type {AudioBufferSourceNode[]} */
  _bfs: [],
  init(actx) {
    this._actx = actx || self.AudioContext || self.webkitAudioContext;
    this._inited = true;
  },
  start(actx) {
    if (!this._inited) this.init(actx);
    if (!this._started) this._actx = new this._actx();
    this._started = true;
  },
  decode(arraybuffer) {
    const actx = this.actx;
    return actx.decodeAudioData(arraybuffer);
  },
  mute(length) {
    const actx = this.actx;
    return actx.createBuffer(2, 44100 * length, 44100);
  },
  /**
   * @typedef {Object} AudioParamOptions
   * @property {boolean} [loop=false]
   * @property {boolean} [isOut=true]
   * @property {number} [offset=0]
   * @property {number} [playbackrate=1]
   * @property {number} [gainrate=1]
   *
   * @param {AudioBuffer} res
   * @param {AudioParamOptions} options
   */
  play(
    res,
    {
      loop = false,
      isOut = true,
      offset = 0,
      playbackrate = 1,
      gainrate = 1,
    } = {}
  ) {
    const actx = this.actx;
    const bfs = this._bfs;
    const gain = actx.createGain();
    const bufferSource = actx.createBufferSource();
    bufferSource.buffer = res;
    bufferSource.loop = loop; //循环播放
    bufferSource.connect(gain);
    gain.gain.value = gainrate;
    bufferSource.playbackRate.value = playbackrate;
    if (isOut) gain.connect(actx.destination);
    bufferSource.start(0, offset);
    bfs[bfs.length] = bufferSource;
  },
  stop() {
    const bfs = this._bfs;
    for (const i of bfs) i.stop();
    bfs.length = 0;
  },
  get actx() {
    if (!this._started) this.start();
    return this._actx;
  },
};
class AudioURLParam {
  constructor() {
    const map = JSON.parse(localStorage.getItem("URLMap"));
    if (map) this.URLMap = new Map(map);
    else this.URLMap = new Map();
  }
}
export { audio, AudioURLParam };
