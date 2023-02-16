import simphi from "./js/simphi.js";
import { audio } from "./utils/aup.js";
import {
  full,
  Timer,
  getConstructorName,
  urls,
  isUndefined,
  loadJS,
  frameTimer,
  time2Str,
  orientation,
} from "./js/common.js";
import { uploader, readZip } from "./js/reader.js";
import InterAct from "./utils/interact.js";
self._i = ["Phi\x67ros 模拟器 Mod 版", [1, 4, 22, "b18"], 1611795955, 1675547193];
const $ = (query) => document.getElementById(query);
const $$ = (query) => document.body.querySelector(query);
const $$$ = (query) => document.body.querySelectorAll(query);
const tween = {
  easeInSine: (pos) => 1 - Math.cos((pos * Math.PI) / 2),
  easeOutSine: (pos) => Math.sin((pos * Math.PI) / 2),
  easeOutCubic: (pos) => 1 + (pos - 1) ** 3,
};
document.oncontextmenu = (e) => e.preventDefault(); //qwq
for (const i of $("view-nav").children) {
  i.addEventListener("click", function () {
    for (const j of this.parentElement.children) j.classList.remove("active");
    const doc = $("view-doc");
    const msg = $("view-msg");
    this.classList.add("active");
    if (i.id === "msg") {
      doc.classList.add("hide");
      msg.classList.remove("hide");
    } else {
      if (doc.getAttribute("src") !== `docs/${i.id}.html`) doc.src = `docs/${i.id}.html`;
      msg.classList.add("hide");
      doc.classList.remove("hide");
    }
  });
}
$("cover-dark").addEventListener("click", () => {
  $("cover-dark").classList.add("fade");
  $("cover-view").classList.add("fade");
  $("cover-config").classList.add("fade");
});
$("qwq").addEventListener("click", () => {
  $("cover-dark").classList.remove("fade");
  $("cover-view").classList.remove("fade");
  $("use").click();
});
$("msg-out").addEventListener("click", () => {
  $("cover-dark").classList.remove("fade");
  $("cover-view").classList.remove("fade");
  $("msg").click();
});
$("btn-more").addEventListener("click", () => {
  $("cover-dark").classList.remove("fade");
  $("cover-config").classList.remove("fade");
});
$$$(".md").forEach((d) => {
  d.style.display = "none";
});
$("helpmods").addEventListener("click", () => {
  $$$(".md").forEach((d) => {
    d.style.display = d.style.display === "none" ? "block" : "none";
  });
});
const msgHandler = {
  nodeText: $("msg-out"),
  nodeView: $("view-msg"),
  lastMessage: "",
  msgbox(msg, type, fatal) {
    const msgbox = document.createElement("div");
    msgbox.innerHTML = msg;
    msgbox.setAttribute("type", type);
    msgbox.classList.add("msgbox");
    const btn = document.createElement("a");
    btn.innerText = "忽略";
    btn.style.float = "right";
    btn.onclick = () => {
      msgbox.remove();
      this.sendMessage(this.lastMessage);
    };
    if (fatal) btn.classList.add("disabled");
    msgbox.appendChild(btn);
    this.nodeView.appendChild(msgbox);
  },
  sendMessage(msg, type) {
    const num = this.nodeView.querySelectorAll(".msgbox[type=warn]").length;
    if (type === "error") {
      this.nodeText.className = "error";
      this.nodeText.innerHTML = msg;
    } else {
      this.nodeText.className = num ? "warning" : "accept";
      this.nodeText.innerHTML = msg + (num ? `（发现${num}个问题，点击查看）` : "");
      this.lastMessage = msg;
    }
  },
  sendWarning(msg, isHTML) {
    const msgText = isHTML ? msg : Utils.escapeHTML(msg);
    this.msgbox(msgText, "warn");
    this.sendMessage(this.lastMessage);
  },
  sendError(msg, html, fatal) {
    if (html) {
      const exp =
        /([A-Za-z][A-Za-z+-.]{2,}:\/\/|www\.)[^\s\x00-\x20\x7f-\x9f"]{2,}[^\s\x00-\x20\x7f-\x9f"!'),.:;?\]}]/g;
      const ahtml = html.replace(exp, (match = "") => {
        const url = match.startsWith("www.") ? `//${match}` : match;
        const rpath = match.replace(`${location.origin}/`, "");
        if (match.indexOf(location.origin) > -1)
          return `<a href="#"style="color:#023b8f;text-decoration:underline;">${rpath}</a>`;
        return `<a href="${url}"target="_blank"style="color:#023b8f;text-decoration:underline;">${rpath}</a>`;
      });
      this.msgbox(ahtml, "error", fatal);
    }
    this.sendMessage(msg, "error");
    return false;
  },
};
//
const stat = new simphi.Stat();
const jdm = new simphi.JudgementMatrix();
const app = new simphi.Renderer($("stage")); //test
const { canvas, ctx, canvasos, ctxos } = app;
const selectbg = $("select-bg");
const btnPlay = $("btn-play");
const btnPause = $("btn-pause");
const selectbgm = $("select-bgm");
const selectchart = $("select-chart");

$("select-note-scale").addEventListener("change", (evt) => {
  app.setNoteScale(evt.target.value);
});
$("select-aspect-ratio").addEventListener("change", (evt) => {
  stage.resize(evt.target.value);
});
$("select-background-dim").addEventListener("change", (evt) => {
  app.brightness = Number(evt.target.value);
});
$("highLight").addEventListener("change", (evt) => {
  app.multiHint = evt.target.checked;
});
$("highLight").dispatchEvent(new Event("change"));
const selectflip = $("select-flip");
selectflip.addEventListener("change", (evt) => {
  app.mirrorView(evt.target.value);
});
const selectspeed = $("select-speed");
selectspeed.addEventListener("change", (evt) => {
  app.speed = (parseFloat(evt.target.value || "1") || 1) * app.getModsTimingModifier();
});
const scfg = function () {
  const arr = [];
  if (icwCfg[5]) arr[arr.length] = "Reversed";
  switch (selectflip.value) {
    case "1":
      arr[arr.length] = "FlipX";
      break;
    case "2":
      arr[arr.length] = "FlipY";
      break;
    case "3":
      arr[arr.length] = "FlipX&Y";
      break;
    default:
  }
  if (selectspeed.value) arr[arr.length] = selectspeed.value + "x";
  if (isPaused) arr[arr.length] = "Paused";
  if (arr.length === 0) return "";
  return ` (${arr.join(" ")})`;
};
const inputName = $("input-name");
const inputArtist = $("input-artist");
const inputCharter = $("input-charter");
const inputIllustrator = $("input-illustrator");
const selectDifficulty = $("select-difficulty");
const selectLevel = $("select-level");
let levelText = "";
const updateLevelText = (type) => {
  const table = {
    SP: [0, 0],
    EZ: [1, 7],
    HD: [3, 12],
    IN: [6, 15],
    AT: [13, 16],
  };
  let diffStr = selectDifficulty.value || "SP";
  let levelNum = selectLevel.value | 0;
  if (type === 0) {
    const diff = table[diffStr];
    if (levelNum < diff[0]) levelNum = diff[0];
    if (levelNum > diff[1]) levelNum = diff[1];
    selectLevel.value = levelNum;
    selectLevel.value = selectLevel.value;
  } else if (type === 1) {
    const keys = Object.keys(table);
    if (table[diffStr][1] < levelNum)
      for (let i = 0; i < keys.length; i++) {
        if (table[keys[i]][1] < levelNum) continue;
        diffStr = keys[i];
        break;
      }
    else if (table[diffStr][0] > levelNum) {
      for (let i = keys.length - 1; i >= 0; i--) {
        if (table[keys[i]][0] > levelNum) continue;
        diffStr = keys[i];
        break;
      }
    }
    selectDifficulty.value = diffStr;
    selectDifficulty.value = selectDifficulty.value;
  }
  const diffString = selectDifficulty.value || "SP";
  const levelString = selectLevel.value || "?";
  levelText = [diffString, levelString].join("  Lv.");
  if (app.mods.size > 0) {
    levelText += " &";
    for (const m of [...app.mods].sort().reverse()) {
      levelText += " " + m.toUpperCase();
    }
  }
};
updateLevelText();
selectDifficulty.addEventListener("change", updateLevelText.bind(null, 0));
selectLevel.addEventListener("change", updateLevelText.bind(null, 1));
$("select-volume").addEventListener("change", (evt) => {
  const volume = Number(evt.target.value);
  app.musicVolume = Math.min(1, 1 / volume);
  app.soundVolume = Math.min(1, volume);
  btnPause.click();
  btnPause.click();
});
const inputOffset = $("input-offset");
const showPoint = $("showPoint");
const showAcc = $("showAcc");
const showStat = $("showStat");
const lineColor = $("lineColor");
$("autoplay").addEventListener("change", (evt) => {
  app.playMode = evt.target.checked ? 1 : 0;
});
$("replay").addEventListener("change", (evt) => {
  app.playMode = evt.target.checked ? 4 : 0;
});
for (const m of ["ez", "ht", "fo", "hr", "dt", "hd", "eb", "rl", "nf", "fl", "sk", "is"]) {
  $("mod-" + m)?.addEventListener("change", (e) => {
    if (!app.mods.has(m) && e.target.checked) {
      app.mods.add(m);
    } else if (app.mods.has(m) && !e.target.checked) {
      app.mods.delete(m);
    }
    app.applyJDMModifier(jdm);
    app.speed = selectspeed.value * app.getModsTimingModifier();
    updateLevelText();
  });
}
$("autoplay").dispatchEvent(new Event("change"));
const showTransition = $("showTransition");
$("lowRes").addEventListener("change", (evt) => {
  app.setLowResFactor(evt.target.checked ? 0.5 : 1);
});
const bgs = new Map();
const bgsBlur = new Map();
const bgms = new Map();
const charts = new Map();
const chartsMD5 = new Map();
const chartLineData = []; //line.csv
const chartInfoData = []; //info.csv
async function checkSupport() {
  /** @param {Error} error */
  const sysError = (error, message) => {
    const type = getConstructorName(error);
    // if (message==='Script error.') return;
    let message2 = String(error);
    let detail = String(error);
    if (error instanceof Error) {
      const stack = error.stack || "Stack not available";
      if (error.name === type) message2 = error.message;
      else message2 = `${error.name}: ${error.message}`;
      const idx = stack.indexOf(message2) + 1;
      if (idx) detail = `${message2}\n${stack.slice(idx + message2.length)}`;
      else detail = `${message2}\n    ${stack.split("\n").join("\n    ")}`; //Safari
    }
    if (message) message2 = message;
    const errMessage = `[${type}] ${message2.split("\n")[0]}`;
    const errDetail = `[${type}] ${detail}`;
    msgHandler.sendError(errMessage, Utils.escapeHTML(errDetail));
  };
  self.addEventListener("error", (e) => sysError(e.error, e.message));
  self.addEventListener("unhandledrejection", (e) => sysError(e.reason));
  const loadPlugin = async (name, urls, check) => {
    if (!check()) return true;
    const errmsg1 = `错误：${name}组件加载失败（点击查看详情）`;
    const errmsg2 = `${name}组件加载失败，请检查您的网络连接然后重试：`;
    const errmsg3 = `${name}组件加载失败，请检查浏览器兼容性`;
    msgHandler.sendMessage(`加载${name}组件...`);
    if (!(await loadJS(urls).catch((e) => msgHandler.sendError(errmsg1, e.message.replace(/.+/, errmsg2), true))))
      return false;
    if (!check()) return true;
    return msgHandler.sendError(errmsg1, errmsg3, true);
  };
  await Utils.addFont("Titillium Web", { alt: "Custom" });
  //兼容性检测
  msgHandler.sendMessage("检查浏览器兼容性...");
  const isMobile =
    navigator.standalone !== undefined || (navigator.platform.indexOf("Linux") > -1 && navigator.maxTouchPoints === 5);
  if (isMobile) $("uploader-select").style.display = "none";
  if (navigator.userAgent.indexOf("MiuiBrowser") > -1) {
    //实测 v17.1.8 问题仍然存在，v17.4.80113 问题已修复
    const version = navigator.userAgent.match(/MiuiBrowser\/(\d+\.\d+)/);
    const text = "检测到小米浏览器且版本低于17.4，可能存在切后台声音消失的问题";
    if (version && version[1] >= 17.4);
    else msgHandler.sendWarning(text);
  }
  if (!(await loadPlugin("ImageBitmap兼容", urls.bitmap, () => isUndefined("createImageBitmap")))) return -1;
  if (!(await loadPlugin("StackBlur", urls.blur, () => isUndefined("StackBlur")))) return -2;
  if (!(await loadPlugin("md5", urls.md5, () => isUndefined("md5")))) return -3;
  msgHandler.sendMessage("加载声音组件...");
  const oggCompatible = !!new Audio().canPlayType("audio/ogg");
  if (!(await loadPlugin("ogg格式兼容", "./oggmented-bundle.js", () => !oggCompatible && isUndefined("oggmented"))))
    return -4;
  audio.init(oggCompatible ? self.AudioContext || self.webkitAudioContext : oggmented.OggmentedAudioContext); //兼容Safari
  const orientSupported = await orientation.checkSupport();
  if (!orientSupported) {
    $("lockOri").checked = false;
    $("lockOri").parentElement.classList.add("disabled");
  }
}
//qwq
selectbg.onchange = () => {
  app.bgImage = bgs.get(selectbg.value);
  app.bgImageBlur = bgsBlur.get(selectbg.value);
  stage.resize();
};
//自动填写歌曲信息
selectchart.addEventListener("change", adjustInfo);

function adjustInfo() {
  for (const i of chartInfoData) {
    if (selectchart.value === i.Chart) {
      if (i.Name) inputName.value = i.Name;
      if (i.Musician) inputArtist.value = i.Musician; //Alternative
      if (i.Composer) inputArtist.value = i.Composer; //Alternative
      if (i.Artist) inputArtist.value = i.Artist;
      if (i.Level) {
        levelText = i.Level;
        const p = levelText
          .toLocaleUpperCase()
          .split("LV.")
          .map((a) => a.trim());
        if (p[0]) selectDifficulty.value = p[0];
        if (p[1]) selectLevel.value = p[1];
      }
      if (i.Illustrator) inputIllustrator.value = i.Illustrator;
      if (i.Designer) inputCharter.value = i.Designer;
      if (i.Charter) inputCharter.value = i.Charter;
      if (bgms.has(i.Music)) selectbgm.value = i.Music;
      if (bgs.has(i.Image)) {
        selectbg.value = i.Image;
        selectbg.dispatchEvent(new Event("change"));
      }
      if (isFinite((i.AspectRatio = parseFloat(i.AspectRatio)))) {
        $("select-aspect-ratio").value = i.AspectRatio;
        stage.resize(i.AspectRatio); //qwq
      }
      if (isFinite((i.ScaleRatio = parseFloat(i.ScaleRatio)))) {
        //Legacy
        $("select-note-scale").value = 8080 / i.ScaleRatio;
        app.setNoteScale(8080 / i.ScaleRatio);
      }
      if (isFinite((i.NoteScale = parseFloat(i.NoteScale)))) {
        $("select-note-scale").value = i.NoteScale;
        app.setNoteScale(i.NoteScale);
      }
      if (isFinite((i.GlobalAlpha = parseFloat(i.GlobalAlpha)))) {
        //Legacy
        $("select-background-dim").value = i.GlobalAlpha;
        app.brightness = Number(i.GlobalAlpha);
      }
      if (isFinite((i.BackgroundDim = parseFloat(i.BackgroundDim)))) {
        $("select-background-dim").value = i.BackgroundDim;
        app.brightness = Number(i.BackgroundDim);
      }
    }
  }
}
const stage = {
  aspectRatio: 0,
  resize(ratio) {
    if (ratio) this.aspectRatio = Number(ratio) || 16 / 9;
    const stageWidth = Math.min(854, document.documentElement.clientWidth * 0.8);
    const stageHeight = stageWidth / this.aspectRatio;
    if (app.isFull) app.stage.style.cssText = ";position:fixed;top:0;left:0;bottom:0;right:0";
    else app.stage.style.cssText = `;width:${stageWidth.toFixed()}px;height:${stageHeight.toFixed()}px`;
  },
};
stage.resize(1.777778); //qwq
self.addEventListener("resize", () => stage.resize());
//uploader
{
  let uploader_done = 0;
  let uploader_total = 0;
  $("uploader-upload").addEventListener("click", uploader.uploadFile);
  $("uploader-file").addEventListener("click", uploader.uploadFile);
  $("uploader-dir").addEventListener("click", uploader.uploadDir);
  /** @type {((_:FileList) => void)} */
  uploader.onchange = (e) => {
    console.log(e.length);
    if (e.length) $("uploader").classList.add("disabled");
  };
  /** @type {((_:ProgressEvent<FileReader>,_:File) => void)} */
  uploader.onprogress = function (evt, i) {
    //显示加载文件进度
    msgHandler.sendMessage(`加载文件：${Math.floor((evt.loaded / evt.total) * 100)}%`);
  };
  /** @type {((_:ProgressEvent<FileReader>,_:File) => void)} */
  uploader.onload = function (evt, i) {
    console.log(evt);
    readZip(
      {
        name: i.name,
        buffer: evt.target.result,
        path: i.webkitRelativePath || i.name,
      },
      {
        createAudioBuffer() {
          return audio.decode(...arguments);
        },
        onloadstart: () => msgHandler.sendMessage("加载zip组件..."),
        onread: (...a) => {
          handleFile(...a).then(() => {
            if (app.hasVideo) {
              msgHandler.sendMessage("提醒：视频可能导致卡顿，如遇请换纯音频重开");
            }
          });
        },
      }
    );
  };
  /**
   * @param {ReaderData} data
   * @param {number} total
   */
  async function handleFile(data, total) {
    uploader_total = total;
    console.log(data);
    switch (data.type) {
      case "line":
        chartLineData.push(...data.data);
        break;
      case "info":
        chartInfoData.push(...data.data);
        break;
      case "media":
        bgms.set(data.name, data.data);
        selectbgm.appendChild(createOption(data.name, data.name));
        break;
      case "audio":
        bgms.set(data.name, data.data);
        selectbgm.appendChild(createOption(data.name, data.name));
        break;
      case "image":
        bgs.set(data.name, data.data);
        bgsBlur.set(data.name, await imgBlur(data.data));
        selectbg.appendChild(createOption(data.name, data.name));
        break;
      case "chart":
        if (data.msg) data.msg.forEach((v) => msgHandler.sendWarning(v));
        if (data.info) chartInfoData.push(data.info);
        if (data.line) chartLineData.push(...data.line);
        charts.set(data.name, data.data);
        chartsMD5.set(data.name, data.md5);
        selectchart.appendChild(createOption(data.name, data.name));
        break;
      default:
        console.error(data.data);
        msgHandler.sendWarning(`不支持的文件：${data.name}`);
    }
    msgHandler.sendMessage(`读取文件：${++uploader_done}/${uploader_total}`);
    if (uploader_done !== uploader_total) return;
    $("uploader").classList.remove("disabled");
    adjustInfo();
    /**
     * @param {string} innerhtml
     * @param {string} value
     */
    function createOption(innerhtml, value) {
      const option = document.createElement("option");
      const isHidden = /(^|\/)\./.test(innerhtml);
      option.innerHTML = isHidden ? "" : innerhtml;
      option.value = value;
      if (isHidden) option.classList.add("hide");
      return option;
    }
  }
}
//[water,demo,democlick]
const icwCfg = [true, false, 3, 0, 0, 0];

$$(".title").addEventListener("click", function () {
  if (!--icwCfg[2]) $(new URLSearchParams(location.search).has("test") ? "demo" : "legacy").classList.remove("hide");
});
//qwq end
const exitFull = () => {
  document.removeEventListener(full.onchange, exitFull);
  hitManager.clear("keyboard"); //esc退出全屏只有onchange事件能检测到
  app.isFull = full.check();
  stage.resize();
};
//hit start
const specialClick = {
  time: [0, 0, 0, 0],
  func: [
    () => {
      btnPause.click();
    },
    () => {
      btnPlay.click();
      btnPlay.click();
    },
    () => {
      showStat.click();
    },
    async () => {
      const isFull = app.isFull;
      try {
        await full.toggle();
        if (!(app.isFull = full.check())) return;
        document.addEventListener(full.onchange, exitFull);
        if (!$("lockOri").checked) return;
        await orientation.lockLandscape();
      } catch (e) {
        console.warn(e); //qwq
        app.isFull = !isFull;
      } finally {
        stage.resize();
      }
    },
  ],
  click(id) {
    const now = performance.now();
    if (now - this.time[id] < 300) this.func[id]();
    this.time[id] = now;
  },
  qwq(offsetX, offsetY) {
    const { lineScale } = app;
    if (offsetX < lineScale * 1.5 && offsetY < lineScale * 1.5) this.click(0);
    if (offsetX > canvasos.width - lineScale * 1.5 && offsetY < lineScale * 1.5) this.click(1);
    if (offsetX < lineScale * 1.5 && offsetY > canvasos.height - lineScale * 1.5) this.click(2);
    if (offsetX > canvasos.width - lineScale * 1.5 && offsetY > canvasos.height - lineScale * 1.5) this.click(3);
    if (timerEnd.second > 0) icwCfg[3] = icwCfg[3] > 0 ? -timerEnd.second : timerEnd.second;
  },
};
const hitManager = new simphi.HitManager();
class JudgeEvent {
  constructor(offsetX, offsetY, type, event) {
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.type = type | 0; //1-Tap,2-Hold/Drag,3-Move
    this.judged = false; //是否被判定
    this.event = event; //flick专用回调
    this.preventBad = false; //是否阻止判定为Bad
  }
}
/**
 * 判定和音符的水平距离
 * @param {JudgeEvent} judgeEvent
 * @param {Note} note
 */
function getJudgeOffset(judgeEvent, note) {
  const { offsetX, offsetY } = judgeEvent;
  const { offsetX: x, offsetY: y, cosr, sinr } = note;
  return Math.abs((offsetX - x) * cosr + (offsetY - y) * sinr) || 0;
}
/**
 * 判定和音符的曼哈顿距离
 * @param {JudgeEvent} judgeEvent
 * @param {Note} note
 */
function getJudgeDistance(judgeEvent, note) {
  const { offsetX, offsetY } = judgeEvent;
  const { offsetX: x, offsetY: y, cosr, sinr } = note;
  return (
    Math.abs((offsetX - x) * cosr + (offsetY - y) * sinr) + Math.abs((offsetX - x) * sinr - (offsetY - y) * cosr) || 0
  );
}

function normalizeCoord(x, y) {
  return [
    ((x * 100) / canvasos.width).toFixed(4), // Compressing
    ((y * 100) / canvasos.height).toFixed(4),
  ];
}

function localizeCoord(u, v) {
  return [(u * canvasos.width) / 100, (v * canvasos.height) / 100];
}

const judgeManager = {
  /**@type {JudgeEvent[]} */
  list: [],
  replay: [],
  prevMode: -1,
  addEvent(notes, realTime) {
    if (this.prevMode === 4 && app.playMode !== 4 && this.replay.length > 0) {
      this.replay = []; // Empty it
    }
    this.prevMode = app.playMode;
    const { list } = this;
    list.length = 0;
    if (app.playMode === 1) {
      const dispTime = Math.min(frameTimer.disp, 0.04);
      for (const i of notes) {
        if (i.scored) continue;
        const deltaTime = i.realTime - realTime;
        if (i.type === 1) {
          if (deltaTime < dispTime) list[list.length] = new JudgeEvent(i.offsetX, i.offsetY, 1);
        } else if (i.type === 2) {
          if (deltaTime < dispTime) list[list.length] = new JudgeEvent(i.offsetX, i.offsetY, 2);
        } else if (i.type === 3) {
          if (i.holdTapTime) list[list.length] = new JudgeEvent(i.offsetX, i.offsetY, 2);
          else if (deltaTime < dispTime) list[list.length] = new JudgeEvent(i.offsetX, i.offsetY, 1);
        } else if (i.type === 4) {
          if (deltaTime < dispTime) list[list.length] = new JudgeEvent(i.offsetX, i.offsetY, 3);
        }
      }
    } else {
      if (app.mods.has("fo")) {
        // Flick over, auto flicking
        const dispTime = Math.min(frameTimer.disp, 0.04);
        for (const i of notes) {
          if (i.scored) continue;
          const deltaTime = i.realTime - realTime;
          if (i.type === 4) {
            if (deltaTime < dispTime) list[list.length] = new JudgeEvent(i.offsetX, i.offsetY, 3);
          }
        }
      }
      if (app.mods.has("nf")) {
        // Auto dragging
        const dispTime = Math.min(frameTimer.disp, 0.04);
        for (const i of notes) {
          if (i.scored) continue;
          const deltaTime = i.realTime - realTime;
          if (i.type === 2) {
            if (deltaTime < dispTime) list[list.length] = new JudgeEvent(i.offsetX, i.offsetY, 2);
          }
        }
      }
      if (app.playMode === 4) {
        // Replay
        for (const r of this.replay) {
          if (r[5]) continue;
          const deltaTime = r[0] - realTime;
          if (deltaTime < 0.001) {
            // Instantly
            let ev = undefined;
            const coord = localizeCoord(r[1], r[2]);
            if (r[4]) {
              ev = new simphi.HitEvent("mouse", 4, ...coord);
            }
            list[list.length] = new JudgeEvent(...coord, r[3], ev);
            console.log(`Created EVENT at ${realTime} expecting ${r[0]}`);
            r.push(1); // Finish bit
          }
        }
      } else {
        if (!isPaused) {
          for (const i of hitManager.list) {
            if (!i.isTapped) {
              list[list.length] = new JudgeEvent(i.offsetX, i.offsetY, 1);
              this.replay.push([realTime.toFixed(4), ...normalizeCoord(i.offsetX, i.offsetY), 1, 0]);
            }
            if (i.isActive) {
              list[list.length] = new JudgeEvent(i.offsetX, i.offsetY, 2);
              this.replay.push([realTime.toFixed(4), ...normalizeCoord(i.offsetX, i.offsetY), 2, 0]);
            }
            if (i.type === "keyboard") {
              // Not fully implemented
              list[list.length] = new JudgeEvent(i.offsetX, i.offsetY, 3);
              this.replay.push([realTime.toFixed(4), ...normalizeCoord(i.offsetX, i.offsetY), 3, 0]);
            }
            if (i.flicking && !i.flicked) {
              list[list.length] = new JudgeEvent(i.offsetX, i.offsetY, 3, i);
              this.replay.push([realTime.toFixed(4), ...normalizeCoord(i.offsetX, i.offsetY), 3, 1]);
            }
          }
        }
      }
    }
  },
  /**
   * 以后扩充Note定义
   * @param {Note[]} notes
   * @param {number} realTime
   * @param {number} width
   */
  execute(notes, realTime, width) {
    const { list } = this;
    for (const note of notes) {
      if (note.scored) continue; //跳过已判分的Note
      const deltaTime = note.realTime - realTime;
      if (deltaTime > jdm.touch) break; //跳过判定范围外的Note
      if (note.type !== 1 && deltaTime > jdm.good) continue;
      if (deltaTime < -jdm.good && note.frameCount > 4 && !note.holdStatus) {
        //超时且不为Hold拖判，判为Miss
        // console.log('Miss', i.name);

        note.status = 2;
        stat.addCombo(2, note.type, app);
        note.scored = true;
      } else if (note.type === 2) {
        //Drag音符
        if (deltaTime > 0) {
          for (const judgeEvent of list) {
            if (judgeEvent.type !== 1) continue; //跳过非Tap判定
            if (getJudgeOffset(judgeEvent, note) > width) continue;
            judgeEvent.preventBad = true;
          }
        }
        if (note.status !== 4) {
          for (const judgeEvent of list) {
            if (judgeEvent.type !== 2) continue; //跳过非Drag判定
            if (getJudgeOffset(judgeEvent, note) > width) continue;
            // console.log('Perfect', i.name);
            note.status = 4;
            break;
          }
        } else if (deltaTime < 0) {
          audio.play(res["HitSong1"], { gainrate: app.soundVolume });
          hitEvents1.push(HitEvent1.perfect(note.projectX, note.projectY));
          stat.addCombo(4, 2, app);
          note.scored = true;
        }
      } else if (note.type === 4) {
        //Flick音符
        if (deltaTime > 0 || note.status !== 4) {
          for (const judgeEvent of list) {
            if (judgeEvent.type !== 1) continue; //跳过非Tap判定
            if (getJudgeOffset(judgeEvent, note) > width) continue;
            judgeEvent.preventBad = true;
          }
        }
        if (note.status !== 4) {
          for (const judgeEvent of list) {
            if (judgeEvent.type === 3) {
              // Process Move
              if (getJudgeOffset(judgeEvent, note) > width) continue;
              let distance = getJudgeDistance(judgeEvent, note);
              let noteJudge = note;
              let nearcomp = false;
              for (const nearNote of note.nearNotes) {
                if (nearNote.status) continue;
                if (nearNote.realTime - realTime > jdm.good) break;
                if (getJudgeOffset(judgeEvent, nearNote) > width) continue;
                const nearDistance = getJudgeDistance(judgeEvent, nearNote);
                if (nearDistance < distance) {
                  distance = nearDistance;
                  noteJudge = nearNote;
                  nearcomp = true;
                }
              }
              //console.log('Perfect', i.name);
              if (!judgeEvent.event) {
                noteJudge.status = 4;
                if (!nearcomp) break;
              } else if (!judgeEvent.event.flicked) {
                noteJudge.status = 4;
                judgeEvent.event.flicked = true;
                if (!nearcomp) break;
              }
            } else if (app.mods.has("fo")) {
              // Treat it as drag
              for (const judgeEvent of list) {
                if (judgeEvent.type !== 2) continue; //跳过非Drag判定
                if (getJudgeOffset(judgeEvent, note) > width) continue;
                // console.log('Perfect', i.name);
                note.status = 4;
                break;
              }
            }
          }
        } else if (deltaTime < 0) {
          audio.play(res["HitSong2"], { gainrate: app.soundVolume });
          hitEvents1.push(HitEvent1.perfect(note.projectX, note.projectY));
          stat.addCombo(4, 4, app);
          note.scored = true;
        }
      } else {
        //Hold音符
        if (note.type === 3 && note.holdTapTime) {
          //是否触发头判
          if ((performance.now() - note.holdTapTime) * note.holdTime >= 1.6e4 * note.realHoldTime) {
            //间隔时间与bpm成反比
            if (note.holdStatus % 4 === 0) hitEvents1.push(HitEvent1.perfect(note.projectX, note.projectY));
            else if (note.holdStatus % 4 === 1) hitEvents1.push(HitEvent1.perfect(note.projectX, note.projectY));
            else if (note.holdStatus % 4 === 3) hitEvents1.push(HitEvent1.good(note.projectX, note.projectY));
            note.holdTapTime = performance.now();
          }
          if (deltaTime + note.realHoldTime < jdm.touch) {
            if (!note.status) stat.addCombo((note.status = note.holdStatus), 3, app);
            if (deltaTime + note.realHoldTime < 0) note.scored = true;
            continue;
          }
          if (!app.mods.has("ez") && !app.mods.has("nf")) {
            note.holdBroken = true; //若1帧内未按住并使其转为false，则判定为Miss
          }
        }
        for (const judgeEvent of list) {
          if (note.holdTapTime) {
            //头判
            if (judgeEvent.type !== 2) continue;
            if (getJudgeOffset(judgeEvent, note) <= width) {
              note.holdBroken = false;
              break;
            }
            continue;
          }
          if (judgeEvent.type !== 1) continue; //跳过非Tap判定
          if (judgeEvent.judged) continue; //跳过已触发的判定
          if (getJudgeOffset(judgeEvent, note) > width) continue;
          let deltaTime2 = deltaTime;
          let distance = getJudgeDistance(judgeEvent, note);
          let noteJudge = note;
          let nearcomp = false;
          for (const nearNote of note.nearNotes) {
            if (nearNote.status) continue;
            if (nearNote.holdTapTime) continue;
            const nearDeltaTime = nearNote.realTime - realTime;
            if (nearDeltaTime > jdm.touch) break;
            if (nearNote.type === 3 && nearDeltaTime > jdm.good) continue;
            if (getJudgeOffset(judgeEvent, nearNote) > width) continue;
            const nearDistance = getJudgeDistance(judgeEvent, nearNote);
            if (nearDistance < distance) {
              deltaTime2 = nearDeltaTime;
              distance = nearDistance;
              noteJudge = nearNote;
              nearcomp = true;
            }
          }
          if (deltaTime2 > jdm.good) {
            if (judgeEvent.preventBad) continue;
            noteJudge.status = 6; //console.log('Bad', i.name);
            noteJudge.badtime = performance.now();
          } else {
            stat.addDisp(Math.max(deltaTime2, (-1 - noteJudge.frameCount) * 0.04 || 0));
            audio.play(res["HitSong0"], { gainrate: app.soundVolume });
            if (deltaTime2 > jdm.perfect) {
              noteJudge.holdStatus = 7; //console.log('Good(Early)', i.name);
              hitEvents1.push(HitEvent1.good(noteJudge.projectX, noteJudge.projectY));
              hitEvents2.push(HitEvent2.early(noteJudge.projectX, noteJudge.projectY));
            } else if (deltaTime2 > jdm.rainbow) {
              noteJudge.holdStatus = 5; //console.log('Perfect(Early)', i.name);
              hitEvents1.push(HitEvent1.perfect(noteJudge.projectX, noteJudge.projectY));
              hitEvents2.push(HitEvent2.early(noteJudge.projectX, noteJudge.projectY));
            } else if (deltaTime2 > -jdm.rainbow || noteJudge.frameCount < 1) {
              noteJudge.holdStatus = 4; //console.log('Perfect(Max)', i.name);
              hitEvents1.push(HitEvent1.perfect(noteJudge.projectX, noteJudge.projectY));
            } else if (deltaTime2 > -jdm.perfect || noteJudge.frameCount < 2) {
              noteJudge.holdStatus = 1; //console.log('Perfect(Late)', i.name);
              hitEvents1.push(HitEvent1.perfect(noteJudge.projectX, noteJudge.projectY));
              hitEvents2.push(HitEvent2.late(noteJudge.projectX, noteJudge.projectY));
            } else {
              noteJudge.holdStatus = 3; //console.log('Good(Late)', i.name);
              hitEvents1.push(HitEvent1.good(noteJudge.projectX, noteJudge.projectY));
              hitEvents2.push(HitEvent2.late(noteJudge.projectX, noteJudge.projectY));
            }
            if (noteJudge.type === 1) noteJudge.status = noteJudge.holdStatus;
          }
          if (noteJudge.status) {
            stat.addCombo(noteJudge.status, 1, app);
            noteJudge.scored = true;
          } else {
            noteJudge.holdTapTime = performance.now();
            noteJudge.holdBroken = false;
          }
          judgeEvent.judged = true;
          noteJudge.statOffset = deltaTime2; //qwq也许是统计偏移量？
          if (!nearcomp) break;
        }
        if (!isPaused && note.holdTapTime && note.holdBroken) {
          note.status = 2; //console.log('Miss', i.name);
          stat.addCombo(2, 3, app);
          note.scored = true;
        }
      }
    }
  },
};

// Import and export replays
function dlReplay() {
  const st = JSON.stringify({
    meta: {
      map: selectchart.value,
      canonicalTitle: `${inputName.value || inputName.placeholder} [${selectLevel.value} Lv.${
        selectDifficulty.value
      }] (${inputArtist.value || inputArtist.placeholder} // ${inputCharter.value || inputCharter.placeholder})`,
      bgm: selectbgm.value,
      bg: selectbg.value,
      flip: selectflip.value,
      level: selectLevel.value,
      difficulty: selectDifficulty.value,
      speed: selectspeed.value,
      mods: [...app.mods],
      score: Math.round(stat.getScoreNum(app)),
      acc: (Math.round(stat.accNum * 10000) / 100).toFixed(2),
      maxCombo: stat.maxcombo,
    },
    ops: judgeManager.replay.map((r) => {
      return [r[0], r[1], r[2], r[3]].join(",");
    }),
  });
  var element = document.createElement("a");
  element.href = "data:application/x-sim-phi-replay;charset=utf-8," + encodeURIComponent(st);
  element.download =
    (inputName.value || inputName.placeholder) + " " + levelText + " " + Math.round(stat.getScoreNum(app)) + ".phr";

  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function importReplay(data) {
  const { meta, ops } = JSON.parse(data);
  if (!selectchart.innerHTML.includes(meta.map)) {
    msgHandler.sendError(
      "你没有对应的谱面! 你需要下面这首曲子的谱面：<br/>" + meta.canonicalTitle + "<br/>(谱面 ID: " + meta.map + ")"
    );
    return;
  }
  selectchart.value = meta.map;
  selectbgm.value = meta.bgm;
  selectbg.value = meta.bg;
  selectflip.value = meta.flip;
  selectLevel.value = meta.level;
  selectDifficulty.value = meta.difficulty;
  selectspeed.value = meta.speed;
  app.mods.clear();
  $$$("input[id^=mod-]").forEach((e) => {
    e.checked = false;
  });
  for (const m of meta.mods) {
    app.mods.add(m);
    const event = new Event("change");
    const e = $("mod-" + m);
    e.checked = true;
    $("mod-" + m).dispatchEvent(event);
  }
  $("replay").checked = true;
  $("autoplay").checked = false;
  app.playMode = 4; // Replay
  msgHandler.sendMessage(`已加载回放 分数：${meta.score} 最大连击：${meta.maxCombo} 准确率：${meta.acc}`);
  judgeManager.replay = ops.map((s) => {
    return s.split(",").map((i, a) => {
      return a === 3 ? parseInt(i) : parseFloat(i);
    });
  });
  judgeManager.prevMode = 1; // Simulate one
  $("btn-play").click();
}

$("btn-export-replay").addEventListener("click", () => {
  if (judgeManager.replay.length > 0) {
    dlReplay();
    msgHandler.sendMessage("回放已导出");
  } else {
    msgHandler.sendError("没有可导出的回放数据");
  }
});

$("btn-import-replay").addEventListener("click", () => {
  const ele = document.createElement("input");
  ele.type = "file";
  ele.accept = ".phr";
  ele.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        importReplay(reader.result);
      });
      reader.readAsText(file, "UTF-8");
    }
  });
  ele.click();
});

class HitEvents extends Array {
  /**	@param {(value)=>boolean} predicate */
  defilter(predicate) {
    let i = this.length;
    while (i--) {
      if (predicate(this[i])) this.splice(i, 1);
    }
    return this;
  }
  anim(func) {
    for (const i of this) func(i);
  }
  add(v) {
    this[this.length] = v;
  }
  clear() {
    this.length = 0;
  }
}
const hitEvents0 = new HitEvents(); //存放点击特效
const hitEvents1 = new HitEvents(); //存放点击特效
const hitEvents2 = new HitEvents(); //存放点击特效
class HitEvent0 {
  constructor(offsetX, offsetY, n1, n2) {
    this.offsetX = Number(offsetX);
    this.offsetY = Number(offsetY);
    this.color = String(n1);
    this.text = String(n2);
    this.time = 0;
  }
  static tap(offsetX, offsetY) {
    //console.log('Tap', offsetX, offsetY);
    return new HitEvent0(offsetX, offsetY, "cyan", "");
  }
  static hold(offsetX, offsetY) {
    //console.log('Hold', offsetX, offsetY);
    return new HitEvent0(offsetX, offsetY, "lime", "");
  }
  static move(offsetX, offsetY) {
    //console.log('Move', offsetX, offsetY);
    return new HitEvent0(offsetX, offsetY, "violet", "");
  }
}
class HitEvent1 {
  constructor(offsetX, offsetY, n1, n2, n3) {
    this.offsetX = Number(offsetX) || 0;
    this.offsetY = Number(offsetY) || 0;
    this.time = performance.now();
    this.duration = 500;
    this.images = res["HitFX"][n1]; //以后做缺少检测
    this.color = String(n3);
    this.rand = Array(Number(n2) || 0)
      .fill()
      .map(() => [Math.random() * 80 + 185, Math.random() * 2 * Math.PI]);
  }
  static perfect(offsetX, offsetY) {
    return new HitEvent1(offsetX, offsetY, "rgba(255,236,160,0.8823529)", 4, "#ffeca0");
  }
  static good(offsetX, offsetY) {
    return new HitEvent1(offsetX, offsetY, "rgba(180,225,255,0.9215686)", 3, "#b4e1ff");
  }
}
class HitEvent2 {
  constructor(offsetX, offsetY, n1, n2) {
    this.offsetX = Number(offsetX) || 0;
    this.offsetY = Number(offsetY) || 0;
    this.time = performance.now();
    this.duration = 250;
    this.color = String(n1);
    this.text = String(n2);
  }
  static early(offsetX, offsetY) {
    //console.log('Tap', offsetX, offsetY);
    return new HitEvent2(offsetX, offsetY, "#03aaf9", "Early");
  }
  static late(offsetX, offsetY) {
    //console.log('Hold', offsetX, offsetY);
    return new HitEvent2(offsetX, offsetY, "#ff4612", "Late");
  }
}
const interact = new InterAct(canvas);
//适配PC鼠标
interact.setMouseEvent({
  mousedownCallback(evt) {
    const idx = evt.button;
    const { x, y } = getPos(evt);
    if (idx === 1) hitManager.activate("mouse", 4, x, y);
    else if (idx === 2) hitManager.activate("mouse", 2, x, y);
    else hitManager.activate("mouse", 1 << idx, x, y);
    specialClick.qwq(x, y);
  },
  mousemoveCallback(evt) {
    const idx = evt.buttons;
    const { x, y } = getPos(evt);
    for (let i = 1; i < 32; i <<= 1) {
      // 同时按住多个键时，只有最后一个键的move事件会触发
      if (idx & i) hitManager.moving("mouse", i, x, y);
      else hitManager.deactivate("mouse", i);
    }
  },
  mouseupCallback(evt) {
    const idx = evt.button;
    if (idx === 1) hitManager.deactivate("mouse", 4);
    else if (idx === 2) hitManager.deactivate("mouse", 2);
    else hitManager.deactivate("mouse", 1 << idx);
  },
});
//适配键盘(喵喵喵?)
interact.setKeyboardEvent({
  keydownCallback(evt) {
    if (btnPlay.value !== "停止") return;
    if (evt.key === "Shift") btnPause.click();
    else if (
      hitManager.list.find((i) => i.type === "keyboard" && i.id === evt.code) //按住一个键时，会触发多次keydown事件
    );
    else hitManager.activate("keyboard", evt.code, NaN, NaN);
  },
  keyupCallback(evt) {
    if (btnPlay.value !== "停止") return;
    if (evt.key !== "Shift") hitManager.deactivate("keyboard", evt.code);
  },
});
self.addEventListener("blur", () => hitManager.clear("keyboard"));
//适配移动设备
interact.setTouchEvent({
  touchstartCallback(evt) {
    for (const i of evt.changedTouches) {
      const { x, y } = getPos(i);
      hitManager.activate("touch", i.identifier, x, y);
      specialClick.qwq(x, y);
    }
  },
  touchmoveCallback(evt) {
    for (const i of evt.changedTouches) {
      const { x, y } = getPos(i);
      hitManager.moving("touch", i.identifier, x, y);
    }
  },
  touchendCallback(evt) {
    for (const i of evt.changedTouches) {
      hitManager.deactivate("touch", i.identifier);
    }
  },
  touchcancelCallback(evt) {
    // if (!isPaused) btnPause.click();
    for (const i of evt.changedTouches) {
      hitManager.deactivate("touch", i.identifier);
    }
  },
});
/** @param {MouseEvent|Touch} obj */
function getPos(obj) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((obj.clientX - rect.left) / canvas.offsetWidth) * canvas.width - (canvas.width - canvasos.width) / 2,
    y: ((obj.clientY - rect.top) / canvas.offsetHeight) * canvas.height,
  };
}
//hit end
const res = {}; //存放资源
//初始化
document.addEventListener("DOMContentLoaded", async function qwq() {
  document.removeEventListener("DOMContentLoaded", qwq);
  canvas.classList.add("fade");
  let loadedNum = 0;
  let errorNum = 0;
  msgHandler.sendMessage("初始化...");
  if (await checkSupport()) return;
  const res0 = {};
  (() => {
    const dat = `{"image":{"JudgeLine":"//i2.hdslb.com/bfs/music/1673237951.png|8080","ProgressBar":"//i3.hdslb.com/bfs/music/1673237966.png|8080","SongsNameBar":"//i0.hdslb.com/bfs/music/1673237977.png|8080","HitFXRaw":"//i2.hdslb.com/bfs/face/5094e42fed15363384b856c8dcef6a9e06507b94.png|8080","Tap":"//i3.hdslb.com/bfs/face/a3636c5f083713f32b593780e3e3873b1618b0ad.png|8080","TapHL":"//i2.hdslb.com/bfs/face/a218ece0645ca903d785a5b1ddacbcbb4e21ddaa.png|8080","Drag":"//i1.hdslb.com/bfs/face/5673d162fa6a6773828d153b79b9cd7661756e3c.png|8080","DragHL":"//i0.hdslb.com/bfs/face/fabf6606ceb7147d7fdc01871ba1dc5a46713a7c.png|8080","HoldHead":"//i3.hdslb.com/bfs/music/1673237586.png|8080","HoldHeadHL":"//i3.hdslb.com/bfs/music/1673237551.png|7875","Hold":"//i1.hdslb.com/bfs/face/4cf84b98ea62e0bc9db3cca13576031573215404.png|8080","HoldHL":"//i0.hdslb.com/bfs/face/c0c8ab1f023b13bf9184059cb5af4d53560d84b4.png|7875","HoldEnd":"//i3.hdslb.com/bfs/music/1673238102.png|8080","Flick":"//i2.hdslb.com/bfs/face/7305a60718b39595db7c3e03a062acdfc09d10a6.png|8080","FlickHL":"//i0.hdslb.com/bfs/face/a3975cb3a730540b2d927c435a148752f59a2a16.png|8080","LevelOver1":"//i1.hdslb.com/bfs/face/5e073fc762cb2d453ee8ddf24a07d27af681940c.png|8080","LevelOver3":"//i2.hdslb.com/bfs/face/ca8e97a06b68f94e6f731253b0c4dd4421b81e89.png|8080","LevelOver4":"//i1.hdslb.com/bfs/face/11e4fdfa326ab7e97c9b4feab508e6e687aebb57.png|8080","LevelOver5":"//i0.hdslb.com/bfs/face/e44a4fc54e4ffbf05014ee69f231b6b64e19f962.png|8080","Rank":"//i0.hdslb.com/bfs/face/3d6cb03c93536e39496944f0f4f50c9c765288be.png|8080"},"audio":{"HitSong0":"//i0.hdslb.com/bfs/music/1673231631.png|m8","HitSong1":"//i2.hdslb.com/bfs/music/1673231636.png|m8","HitSong2":"//i1.hdslb.com/bfs/music/1673231639.png|m8","LevelOver0_v1":"//i1.hdslb.com/bfs/music/1673230967.png|m8","LevelOver1_v1":"//i0.hdslb.com/bfs/music/1673230996.png|m8","LevelOver2_v1":"//i1.hdslb.com/bfs/music/1673231586.png|m8","LevelOver3_v1":"//i0.hdslb.com/bfs/music/1673231518.png|m8"},"alternative":{"LevelOver0_v1":"//i1.hdslb.com/bfs/music/1676001486.ogg","LevelOver1_v1":"//i3.hdslb.com/bfs/music/1676001490.ogg","LevelOver2_v1":"//i3.hdslb.com/bfs/music/1676001494.ogg","LevelOver3_v1":"//i0.hdslb.com/bfs/music/1676001497.ogg"}}`;
    const i = JSON.parse(dat);
    for (const j in i.image || {}) res0[j] = i.image[j];
    for (const j in i.audio || {}) res0[j] = i.audio[j];
  })();

  //加载资源
  await Promise.all(
    Object.entries(res0).map(
      ([name, src], _i, arr) =>
        new Promise((resolve) => {
          let [url, ext] = src.split("|");
          if (name == "Rank") {
            // Inject
            url = "./ranks.png";
            ext = undefined;
          }
          fetch(url, { referrerPolicy: "no-referrer" })
            .then((a) => a.blob())
            .then(async (blob) => {
              const img = await createImageBitmap(blob);
              if (ext && ext[0] === "m") {
                const data = decode(img, Number(ext.slice(1))).result;
                // 小米浏览器出现问题：decode出来的数据部分被有损压缩导致资源加载失败
                res[name] = await audio.decode(data).catch(async (err) => {
                  const blob = await fetch(raw.alternative[name], { referrerPolicy: "no-referrer" }).then((i) =>
                    i.blob()
                  );
                  return await createImageBitmap(blob)
                    .then(decodeAlt)
                    .then(audio.decode.bind(audio))
                    .catch((err) => {
                      msgHandler.sendWarning(
                        `您的浏览器存在问题，将导致以下音频无法正常播放：\n${name}(${err.message})\n如果多次刷新问题仍然存在，建议更换设备或浏览器。`
                      );
                      return audio.mute(1);
                    });

                  function decodeAlt(img) {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                    const id = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const ab = new Uint8Array((id.data.length / 4) * 3);
                    const mask = (v, i) => v ^ ((i ** 2 * 3473) & 255);
                    for (let i = 0; i < ab.length; i++) ab[i] = id.data[((i / 3) | 0) * 4 + (i % 3)];
                    const combined = new Uint8Array(ab.length / 2);
                    for (let i = 0; i < ab.length / 2; i++) {
                      combined[i] = mask((((ab[i * 2] + 8) / 17) << 4) | ((ab[i * 2 + 1] + 8) / 17), i);
                    }
                    const size = new DataView(combined.buffer, 0, 4).getUint32(0);
                    return combined.buffer.slice(4, size + 4);
                  }
                });
              } else {
                res[name] = await createImageBitmap(
                  img,
                  0,
                  0,
                  img.width,
                  img.height /* , { imageOrientation: 'flipY' } */
                );
              }
              msgHandler.sendMessage(`加载资源：${Math.floor((++loadedNum / arr.length) * 100)}%`);
            })
            .catch((err) => {
              console.error(err);
              msgHandler.sendError(
                `错误：${++errorNum}个资源加载失败（点击查看详情）`,
                `资源加载失败，请检查您的网络连接然后重试：\n${new URL(url, location)}`,
                true
              );
            })
            .finally(resolve);
        })
    )
  );
  if (errorNum) return msgHandler.sendError(`错误：${errorNum}个资源加载失败（点击查看详情）`);
  res["NoImageBlack"] = await createImageBitmap(new ImageData(new Uint8ClampedArray(4).fill(0), 1, 1));
  res["NoImageWhite"] = await createImageBitmap(new ImageData(new Uint8ClampedArray(4).fill(255), 1, 1));
  res["JudgeLineMP"] = await imgShader(res["JudgeLine"], "#feffa9");
  res["JudgeLineFC"] = await imgShader(res["JudgeLine"], "#a2eeff");
  res["TapBad"] = await imgPainter(res["Tap"], "#6c4343");
  res["Ranks"] = await imgSplit(res["Rank"]); // Override
  res["Rank"].close();
  const hitRaw = await imgSplit(res["HitFXRaw"]);
  res["HitFXRaw"].close();
  res["HitFX"] = {};
  res["HitFX"]["rgba(255,236,160,0.8823529)"] = await Promise.all(
    hitRaw.map((img) => imgShader(img, "rgba(255,236,160,0.8823529)"))
  ); //#fce491
  res["HitFX"]["rgba(180,225,255,0.9215686)"] = await Promise.all(
    hitRaw.map((img) => imgShader(img, "rgba(180,225,255,0.9215686)"))
  ); //#9ed5f3
  hitRaw.forEach((img) => img.close());
  res["mute"] = audio.mute(1);
  if (
    !(() => {
      const b = document.createElement("canvas").getContext("2d");
      b.drawImage(res["JudgeLine"], 0, 0);
      return b.getImageData(0, 0, 1, 1).data[0];
    })()
  )
    return msgHandler.sendError("检测到图片加载异常，请关闭所有应用程序然后重试");
  msgHandler.sendMessage("等待上传文件...");
  $("uploader").classList.remove("disabled");
  $("select").classList.remove("disabled");
  btnPause.classList.add("disabled");

  function decode(img, clip = 0) {
    const canvas = document.createElement("canvas");
    canvas.width = img.width - clip * 2;
    canvas.height = img.height - clip * 2;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, -clip, -clip);
    const id = ctx.getImageData(0, 0, canvas.width, canvas.width);
    const ab = new Uint8Array((id.data.length / 4) * 3);
    for (let i = 0; i < ab.length; i++) ab[i] = id.data[((i / 3) | 0) * 4 + (i % 3)] ^ (i * 3473);
    const size = new DataView(ab.buffer, 0, 4).getUint32(0);
    return { result: ab.buffer.slice(4, size + 4) };
  }
});
//必要组件
let stopDrawing;
let curTime = 0;
let curTimestamp = 0;
let timeBgm = 0;
let timeChart = 0;
let duration = 0;
let isInEnd = false; //开头过渡动画
let isOutStart = false; //结尾过渡动画
let isOutEnd = false; //临时变量
let isPaused = true; //暂停
document.addEventListener(
  "visibilitychange",
  () => document.visibilityState === "hidden" && btnPause.value === "暂停" && btnPause.click()
);
document.addEventListener(
  "pagehide",
  () => document.visibilityState === "hidden" && btnPause.value === "暂停" && btnPause.click()
); //兼容Safari
const timerIn = new Timer();
const timerOut = new Timer();
const timerEnd = new Timer();
//play

btnPlay.addEventListener("click", async function () {
  btnPause.value = "暂停";
  if (this.value === "播放") {
    if (judgeManager.replay.length === 0 && app.playMode === 4) {
      return msgHandler.sendError("错误：没有回放可供观看");
    }
    if (!selectchart.value) return msgHandler.sendError("错误：未选择任何谱面");
    if (!selectbgm.value) return msgHandler.sendError("错误：未选择任何音乐");
    audio.play(res["mute"], { loop: true, isOut: false }); //播放空音频(防止音画不同步)
    app.prerenderChart(charts.get(selectchart.value));
    app.md5 = chartsMD5.get(selectchart.value);
    stat.level = Number(levelText.match(/\d+$/));
    stat.reset(app.chart.numOfNotes, app.md5, selectspeed.value);
    for (const i of app.lines) {
      i.imageW = 6220.8; //1920
      i.imageH = 7.68; //3
      i.imageL = [res["JudgeLine"], res["JudgeLineMP"], null, res["JudgeLineFC"]];
      i.imageS = 1; //2.56
      i.imageA = 1; //1.5625
      i.imageD = false;
      i.imageC = true;
      i.imageU = true;
    }
    for (const i of chartLineData) {
      if (selectchart.value === i.Chart) {
        if (!app.lines[i.LineId]) {
          msgHandler.sendWarning(`指定id的判定线不存在：${i.LineId}`);
          continue;
        }
        if (!bgs.has(i.Image)) msgHandler.sendWarning(`图片不存在：${i.Image}`);
        /** @type {ImageBitmap} */
        const image = bgs.get(i.Image) || res["NoImageBlack"];
        app.lines[i.LineId].imageW = image.width;
        app.lines[i.LineId].imageH = image.height;
        if (!lineImages.has(image)) lineImages.set(image, new LineImage(image));
        const lineImage = lineImages.get(image);
        app.lines[i.LineId].imageL = [image, await lineImage.getMP(), await lineImage.getAP(), await lineImage.getFC()];
        if (isFinite((i.Vert = parseFloat(i.Vert)))) {
          //Legacy
          app.lines[i.LineId].imageS = (Math.abs(i.Vert) * 1080) / image.height;
          app.lines[i.LineId].imageU = i.Vert > 0;
        }
        if (isFinite((i.Horz = parseFloat(i.Horz)))) app.lines[i.LineId].imageA = i.Horz; //Legacy
        if (isFinite((i.IsDark = parseFloat(i.IsDark)))) app.lines[i.LineId].imageD = !!i.IsDark; //Legacy
        if (isFinite((i.Scale = parseFloat(i.Scale)))) app.lines[i.LineId].imageS = i.Scale;
        if (isFinite((i.Aspect = parseFloat(i.Aspect)))) app.lines[i.LineId].imageA = i.Aspect;
        if (isFinite((i.UseBackgroundDim = parseFloat(i.UseBackgroundDim))))
          app.lines[i.LineId].imageD = !!i.UseBackgroundDim;
        if (isFinite((i.UseLineColor = parseFloat(i.UseLineColor)))) app.lines[i.LineId].imageC = !!i.UseLineColor;
        if (isFinite((i.UseLineScale = parseFloat(i.UseLineScale)))) app.lines[i.LineId].imageU = !!i.UseLineScale;
      }
    }
    app.bgImage = bgs.get(selectbg.value) || res["NoImageWhite"];
    app.bgImageBlur = bgsBlur.get(selectbg.value) || res["NoImageWhite"];
    const bgm = bgms.get(selectbgm.value);
    app.bgMusic = bgm.audio;
    app.bgVideo = bgm.video;
    this.value = "停止";
    duration = app.bgMusic.duration / app.speed;
    isInEnd = false;
    isOutStart = false;
    isOutEnd = false;
    isPaused = false;
    timeBgm = 0;
    if (!showTransition.checked) timerIn.addTime(3000);
    canvas.classList.remove("fade");
    $("mask").classList.add("fade");
    btnPause.classList.remove("disabled");
    for (const i of $$$(".disabled-when-playing")) i.classList.add("disabled");
    loop();
    timerIn.play();
  } else {
    audio.stop();
    cancelAnimationFrame(stopDrawing);
    canvas.classList.add("fade");
    $("mask").classList.remove("fade");
    for (const i of $$$(".disabled-when-playing")) i.classList.remove("disabled");
    btnPause.classList.add("disabled");
    //清除原有数据
    isDone = false;
    isRankingsReady = false;
    hitEvents0.clear();
    hitEvents1.clear();
    hitEvents2.clear();
    timerIn.reset();
    timerOut.reset();
    timerEnd.reset();
    curTime = 0;
    curTimestamp = 0;
    duration = 0;
    this.value = "播放";
  }
});
btnPause.addEventListener("click", async function () {
  if (this.classList.contains("disabled") || btnPlay.value === "播放") return;
  this.classList.add("disabled");
  if (this.value === "暂停") {
    if (app.bgVideo) app.bgVideo.pause();
    timerIn.pause();
    if (showTransition.checked && isOutStart) timerOut.pause();
    isPaused = true;
    this.value = "继续";
    curTime = timeBgm;
    audio.stop();
  } else {
    if (app.bgVideo) await playVideo(app.bgVideo, timeBgm * app.speed);
    timerIn.play();
    if (showTransition.checked && isOutStart) timerOut.play();
    isPaused = false;
    if (isInEnd && !isOutStart) playBgm(app.bgMusic, timeBgm * app.speed);
    this.value = "暂停";
  }
  this.classList.remove("disabled");
});

/** @param {HTMLVideoElement} data */
function playVideo(data, offset) {
  if (!offset) offset = 0;
  data.currentTime = offset;
  data.playbackRate = app.speed;
  data.muted = true;
  return data.play();
}
inputOffset.addEventListener("input", function () {
  if (this.value < -400) this.value = -400;
  if (this.value > 600) this.value = 600;
});
//播放bgm
function playBgm(data, offset) {
  isPaused = false;
  if (!offset) offset = 0;
  curTimestamp = performance.now();
  audio.play(data, { offset: offset, playbackrate: app.speed, gainrate: app.musicVolume, interval: 1 });
}
let isDone = false;
let isRankingsReady = false;
//作图
function loop() {
  const { lineScale } = app;
  const now = performance.now();
  app.resizeCanvas();
  //计算时间
  if (timerOut.second < 0.67) {
    moveElements(now);
    drawGameStart(now);
  } else if (!isDone) drawEndPlay();
  if (isRankingsReady) drawRankings(isRankingsReady);
  ctx.globalAlpha = 1;
  if ($("imageBlur").checked) ctx.drawImage(app.bgImageBlur, ...adjustSize(app.bgImageBlur, canvas, 1.1));
  else ctx.drawImage(app.bgImage, ...adjustSize(app.bgImage, canvas, 1.1));
  ctx.fillStyle = "#000";
  ctx.globalAlpha = 0.4;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1;
  ctx.drawImage(canvasos, (canvas.width - canvasos.width) / 2, 0);
  //Copyright
  ctx.font = `${lineScale * 0.4}px Custom,Noto Sans SC`;
  ctx.fillStyle = "#ccc";
  ctx.globalAlpha = 0.8;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText(
    `Phi\x67ros Simulator v${_i[1].join(".")} - Code by lchz\x683\x3473 - Mods by skjsjhb`,
    (canvas.width + canvasos.width) / 2 - lineScale * 0.1,
    canvas.height - lineScale * 0.2
  );
  stopDrawing = requestAnimationFrame(loop); //回调更新动画
}

function calcExAlpha(timeChart, realTime, type) {
  if (app.mods.has("hd")) {
    let exAlpha;

    const diff = timeChart - (realTime - 0.35); // Fixed
    exAlpha = 1 - diff / jdm.good;
    if (exAlpha < 0) {
      exAlpha = 0;
    }
    if (type == 3) {
      exAlpha += 0.2;
    }
    if (exAlpha > 1) {
      exAlpha = 1;
    }
    return exAlpha;
  } else {
    return 1;
  }
}

const modsCanonical = {
  ez: "Easy",
  rl: "Relax",
  nf: "No Fall",
  fo: "Flick Over",
  ht: "Half Time",
  hr: "Hard Rock",
  eb: "Elite Beat",
  dt: "Double Time",
  hd: "Hidden",
  fl: "Fade Line",
  sk: "Skill",
  is: "InfScore",
};

const modsValue = {
  ez: -1,
  rl: -1,
  nf: -2,
  fo: -1,
  ht: -2,
  hr: 1,
  eb: 1,
  dt: 2,
  hd: 2,
  fl: 1,
  sk: 0,
  is: 0,
};

function getModsText() {
  let o = [];
  for (const m of [...app.mods].sort().reverse()) {
    o.push(modsCanonical[m] || "");
  }
  return o.join("   ");
}

function isTooHard() {
  let sum = 0;
  for (const m of [...app.mods].sort().reverse()) {
    sum += modsValue[m] || 0;
  }
  return sum >= 3;
}

function calcFLAlpha() {
  if (app.mods.has("fl")) {
    return Math.max(1 - stat.combo / 100, 0);
  } else {
    return 1;
  }
}

function moveElements(now) {
  frameTimer.addTick(); //计算fps
  if (!isInEnd && timerIn.second >= 3) {
    isInEnd = true;
    playBgm(app.bgMusic);
    if (app.bgVideo) playVideo(app.bgVideo);
  }
  if (!isPaused && isInEnd && !isOutStart) timeBgm = (now - curTimestamp) / 1e3 + curTime;
  if (timeBgm >= duration) isOutStart = true;
  if (showTransition.checked && isOutStart && !isOutEnd) {
    isOutEnd = true;
    timerOut.play();
  }
  timeChart = Math.max(timeBgm - app.chart.offset / app.speed - (Number(inputOffset.value) / 1e3 || 0), 0);
  //遍历判定线events和Note
  for (const line of app.lines) {
    for (const i of line.judgeLineDisappearEvents) {
      if (timeChart < i.startRealTime) break;
      if (timeChart > i.endRealTime) continue;
      const t2 = (timeChart - i.startRealTime) / (i.endRealTime - i.startRealTime);
      const t1 = 1 - t2;
      line.alpha = i.start * t1 + i.end * t2;
    }

    for (const i of line.judgeLineMoveEvents) {
      if (timeChart < i.startRealTime) break;
      if (timeChart > i.endRealTime) continue;
      const t2 = (timeChart - i.startRealTime) / (i.endRealTime - i.startRealTime);
      const t1 = 1 - t2;
      line.offsetX = app.matX(i.start * t1 + i.end * t2);
      line.offsetY = app.matY(i.start2 * t1 + i.end2 * t2);
    }
    for (const i of line.judgeLineRotateEvents) {
      if (timeChart < i.startRealTime) break;
      if (timeChart > i.endRealTime) continue;
      const t2 = (timeChart - i.startRealTime) / (i.endRealTime - i.startRealTime);
      const t1 = 1 - t2;
      line.rotation = app.matR(i.start * t1 + i.end * t2);
      line.cosr = Math.cos(line.rotation);
      line.sinr = Math.sin(line.rotation);
    }
    for (const i of line.speedEvents) {
      if (timeChart < i.startRealTime) break;
      if (timeChart > i.endRealTime) continue;
      line.positionY = (timeChart - i.startRealTime) * i.value * app.speed + i.floorPosition;
    }
    for (const i of line.notesAbove) {
      i.cosr = line.cosr;
      i.sinr = line.sinr;
      setAlpha(i, app.scaleX * i.positionX, app.scaleY * getY(i));
      i.alpha *= calcExAlpha(timeChart, i.realTime, i.type);
    }
    for (const i of line.notesBelow) {
      i.cosr = -line.cosr;
      i.sinr = -line.sinr;
      setAlpha(i, -app.scaleX * i.positionX, app.scaleY * getY(i));
      i.alpha *= calcExAlpha(timeChart, i.realTime, i.type);
    }

    function getY(i) {
      if (!i.badtime) return realgetY(i);
      if (performance.now() - i.badtime > 500) delete i.badtime;
      if (!i.badY) i.badY = realgetY(i);
      return i.badY;
    }

    function realgetY(i) {
      if (i.type !== 3) return (i.floorPosition - line.positionY) * i.speed;
      if (i.realTime < timeChart) return (i.realTime - timeChart) * i.speed * app.speed;
      return i.floorPosition - line.positionY;
    }

    function setAlpha(i, dx, dy) {
      i.projectX = line.offsetX + dx * i.cosr;
      i.offsetX = i.projectX + dy * i.sinr;
      i.projectY = line.offsetY + dx * i.sinr;
      i.offsetY = i.projectY - dy * i.cosr;
      i.visible =
        (i.offsetX - app.wlen) ** 2 + (i.offsetY - app.hlen) ** 2 <
        (app.wlen * 1.23625 + app.hlen + app.scaleY * i.realHoldTime * i.speed * app.speed) ** 2; //Math.hypot实测性能较低
      if (i.badtime) i.alpha = 1 - range((performance.now() - i.badtime) / 500);
      else if (i.realTime > timeChart) {
        if (dy > -1e-3 * app.scaleY)
          i.alpha =
            i.type === 3 && i.speed === 0
              ? showPoint.checked
                ? 0.45
                : 0
              : icwCfg[5]
              ? Math.max(1 + (timeChart - i.realTime) / 1.5, 0)
              : 1;
        //过线前1.5s出现
        else i.alpha = showPoint.checked ? 0.45 : 0;
        //i.frameCount = 0;
      } else {
        if (i.type === 3) i.alpha = i.speed === 0 ? (showPoint.checked ? 0.45 : 0) : i.status % 4 === 2 ? 0.45 : 1;
        else i.alpha = Math.max(1 - (timeChart - i.realTime) / 0.16, 0); //过线后0.16s消失
        i.frameCount = isNaN(i.frameCount) ? 0 : i.frameCount + 1;
      }
    }
    if (line.numOfNotes > 0) {
      line.alpha *= calcFLAlpha();
    }
  }
  //更新打击特效和触摸点动画
  hitEvents0.defilter((i) => i.time++ > 0);
  hitEvents1.defilter((i) => now >= i.time + i.duration);
  hitEvents2.defilter((i) => now >= i.time + i.duration);
  for (const i of hitManager.list) {
    if (i.type === "keyboard") continue;
    if (!i.isTapped) hitEvents0.push(HitEvent0.tap(i.offsetX, i.offsetY));
    else if (i.isMoving) hitEvents0.push(HitEvent0.move(i.offsetX, i.offsetY)); //qwq
    else if (i.isActive) hitEvents0.push(HitEvent0.hold(i.offsetX, i.offsetY));
  }
  //触发判定和播放打击音效
  if (isInEnd) {
    let judgeWidth = canvasos.width * 0.118125;
    if (app.mods.has("hr")) {
      judgeWidth *= 0.75;
    } else if (app.mods.has("ez")) {
      judgeWidth *= 1.25;
    }
    if (app.mods.has("hd")) {
      judgeWidth *= 1.05;
    }
    judgeManager.addEvent(app.notes, timeChart);
    judgeManager.execute(app.drags, timeChart, judgeWidth);
    judgeManager.execute(app.flicks, timeChart, judgeWidth);
    judgeManager.execute(app.tapholds, timeChart, judgeWidth);
  }
  //更新判定
  hitManager.update();
  if (icwCfg[4] && stat.good + stat.bad) {
    stat.level = Number(levelText.match(/\d+$/));
    stat.reset();
    btnPlay.click();
    btnPlay.click();
  }
}

function drawGameStart(now) {
  const { lineScale, noteScaleRatio } = app;
  const anim0 = (i) => {
    //绘制打击特效0
    ctxos.globalAlpha = 0.85;
    ctxos.setTransform(1, 0, 0, 1, i.offsetX, i.offsetY); //缩放
    ctxos.fillStyle = i.color;
    ctxos.beginPath();
    ctxos.arc(0, 0, lineScale * 0.5, 0, 2 * Math.PI);
    ctxos.fill();
    i.time++;
  };
  const anim1 = (i) => {
    //绘制打击特效1
    const tick = (now - i.time) / i.duration;
    ctxos.globalAlpha = 1;
    ctxos.setTransform(noteScaleRatio * 6, 0, 0, noteScaleRatio * 6, i.offsetX, i.offsetY); //缩放
    ctxos.drawImage(i.images[parseInt(tick * 30)] || i.images[i.images.length - 1], -128, -128); //停留约0.5秒
    ctxos.fillStyle = i.color;
    ctxos.globalAlpha = 1 - tick; //不透明度
    const r3 = 30 * (((0.2078 * tick - 1.6524) * tick + 1.6399) * tick + 0.4988); //方块大小
    for (const j of i.rand) {
      const ds = j[0] * ((9 * tick) / (8 * tick + 1)); //打击点距离
      ctxos.fillRect(ds * Math.cos(j[1]) - r3 / 2, ds * Math.sin(j[1]) - r3 / 2, r3, r3);
    }
  };
  const anim2 = (i) => {
    //绘制打击特效2
    const tick = (now - i.time) / i.duration;
    ctxos.setTransform(1, 0, 0, 1, i.offsetX, i.offsetY); //缩放
    ctxos.font = `bold ${
      noteScaleRatio * (256 + 128 * (((0.2078 * tick - 1.6524) * tick + 1.6399) * tick + 0.4988))
    }px Custom,Noto Sans SC`;
    ctxos.textAlign = "center";
    ctxos.textBaseline = "middle";
    ctxos.fillStyle = i.color;
    ctxos.globalAlpha = 1 - tick; //不透明度
    ctxos.fillText(i.text, 0, -noteScaleRatio * 192);
  };
  ctxos.clearRect(0, 0, canvasos.width, canvasos.height); //重置画面
  ctxos.globalCompositeOperation = "destination-over"; //由后往前绘制
  if ($("showCE2").checked) hitEvents2.anim(anim2);
  if (icwCfg[4]) ctxos.filter = `hue-rotate(${(energy * 360) / 7}deg)`;
  hitEvents1.anim(anim1, now);
  if (icwCfg[4]) ctxos.filter = "none";
  if ($("feedback").checked) hitEvents0.anim(anim0);
  if (timerIn.second >= 3 && timerOut.second === 0) {
    if (showPoint.checked) {
      //绘制定位点
      ctxos.font = `${lineScale}px Custom,Noto Sans SC`;
      ctxos.textAlign = "center";
      ctxos.textBaseline = "bottom";
      for (const i of app.notes) {
        if (!i.visible) continue;
        ctxos.setTransform(i.cosr, i.sinr, -i.sinr, i.cosr, i.offsetX, i.offsetY);
        ctxos.fillStyle = "cyan";
        ctxos.globalAlpha = i.realTime > timeChart ? 1 : 0.5;
        ctxos.fillText(i.name, 0, -lineScale * 0.1);
        ctxos.globalAlpha = 1;
        ctxos.fillStyle = "lime";
        ctxos.fillRect(-lineScale * 0.2, -lineScale * 0.2, lineScale * 0.4, lineScale * 0.4);
      }
      for (const i of app.lines) {
        ctxos.setTransform(i.cosr, i.sinr, -i.sinr, i.cosr, i.offsetX, i.offsetY);
        ctxos.fillStyle = "yellow";
        ctxos.globalAlpha = (i.alpha + 0.5) / 1.5;
        ctxos.fillText(i.lineId, 0, -lineScale * 0.1);
        ctxos.globalAlpha = 1;
        ctxos.fillStyle = "violet";
        ctxos.fillRect(-lineScale * 0.2, -lineScale * 0.2, lineScale * 0.4, lineScale * 0.4);
      }
    }
    //绘制note
    for (const i of app.flicks) drawFlick(i);
    for (const i of app.taps) drawTap(i);
    for (const i of app.drags) drawDrag(i);
    for (const i of app.reverseholds) drawHold(i, timeChart);
  }
  //绘制背景
  if (icwCfg[4]) ctxos.filter = `hue-rotate(${(energy * 360) / 7}deg)`;
  if (timerIn.second >= 2.5) drawLine(stat.lineStatus ? 2 : 1); //绘制判定线(背景前1)
  if (icwCfg[4]) ctxos.filter = "none";
  ctxos.resetTransform();
  ctxos.fillStyle = "#000"; //背景变暗
  ctxos.globalAlpha = app.brightness; //背景不透明度
  ctxos.fillRect(0, 0, canvasos.width, canvasos.height);
  if (icwCfg[4]) ctxos.filter = `hue-rotate(${(energy * 360) / 7}deg)`;
  if (timerIn.second >= 2.5 && !stat.lineStatus) drawLine(0); //绘制判定线(背景后0)
  if (icwCfg[4]) ctxos.filter = "none";
  ctxos.globalAlpha = 1;
  ctxos.resetTransform();
  if (isInEnd && app.bgVideo) {
    const width = app.bgVideo.videoWidth;
    const height = app.bgVideo.videoHeight;
    ctxos.drawImage(app.bgVideo, ...adjustSize({ width, height }, canvasos, 1));
  }
  if ($("imageBlur").checked) {
    ctxos.drawImage(app.bgImageBlur, ...adjustSize(app.bgImageBlur, canvasos, 1));
  } else {
    ctxos.drawImage(app.bgImage, ...adjustSize(app.bgImage, canvasos, 1));
  }
  ctxos.fillRect(0, 0, canvasos.width, canvasos.height);
  ctxos.globalCompositeOperation = "source-over";
  //绘制进度条
  ctxos.setTransform(
    canvasos.width / 1920,
    0,
    0,
    canvasos.width / 1920,
    0,
    lineScale *
      (timerIn.second < 0.67
        ? tween.easeOutSine(timerIn.second * 1.5) - 1
        : -tween.easeOutSine(timerOut.second * 1.5)) *
      1.75
  );
  ctxos.drawImage(res["ProgressBar"], ((icwCfg[5] ? duration - timeBgm : timeBgm) / duration) * 1920 - 1920, 0);
  //绘制文字
  ctxos.resetTransform();
  ctxos.fillStyle = "#fff";
  //开头过渡动画
  if (timerIn.second < 3) {
    if (timerIn.second < 0.67) ctxos.globalAlpha = tween.easeOutSine(timerIn.second * 1.5);
    else if (timerIn.second >= 2.5) ctxos.globalAlpha = tween.easeOutSine(6 - timerIn.second * 2);
    const name = inputName.value || inputName.placeholder;
    const artist = inputArtist.value;
    const illustrator = `Illustrator - ${inputIllustrator.value || inputIllustrator.placeholder}`;
    const charter = `Chart - ${inputCharter.value || inputCharter.placeholder}`;
    ctxos.textAlign = "center";
    //曲名
    ctxos.textBaseline = "alphabetic";
    ctxos.font = `${lineScale * 1.1}px Custom,Noto Sans SC`;
    const dxsnm = ctxos.measureText(name).width;
    if (dxsnm > canvasos.width - lineScale * 1.5)
      ctxos.font = `${((lineScale * 1.1) / dxsnm) * (canvasos.width - lineScale * 1.5)}px Custom,Noto Sans SC`;
    ctxos.fillText(name, app.wlen, app.hlen * 0.75);
    //曲师、曲绘和谱师
    ctxos.textBaseline = "top";
    ctxos.font = `${lineScale * 0.55}px Custom,Noto Sans SC`;
    const dxa = ctxos.measureText(artist).width;
    if (dxa > canvasos.width - lineScale * 1.5)
      ctxos.font = `${((lineScale * 0.55) / dxa) * (canvasos.width - lineScale * 1.5)}px Custom,Noto Sans SC`;
    ctxos.fillText(artist, app.wlen, app.hlen * 0.75 + lineScale * 0.45);
    ctxos.font = `${lineScale * 0.55}px Custom,Noto Sans SC`;
    const dxi = ctxos.measureText(illustrator).width;
    if (dxi > canvasos.width - lineScale * 1.5)
      ctxos.font = `${((lineScale * 0.55) / dxi) * (canvasos.width - lineScale * 1.5)}px Custom,Noto Sans SC`;
    ctxos.fillText(illustrator, app.wlen, app.hlen * 1.25 - lineScale * 0.25);
    ctxos.font = `${lineScale * 0.55}px Custom,Noto Sans SC`;
    const dxc = ctxos.measureText(charter).width;
    if (dxc > canvasos.width - lineScale * 1.5)
      ctxos.font = `${((lineScale * 0.55) / dxc) * (canvasos.width - lineScale * 1.5)}px Custom,Noto Sans SC`;
    ctxos.fillText(charter, app.wlen, app.hlen * 1.25 + lineScale * 0.6);

    // Display mods

    const tx = getModsText() || "No Mod";
    const dxm = ctxos.measureText(tx).width;
    if (dxm > canvasos.width - lineScale * 1.5)
      ctxos.font = `${((lineScale * 0.55) / dxi) * (canvasos.width - lineScale * 1.5)}px Custom,Noto Sans SC`;
    ctxos.fillText(tx, app.wlen, app.hlen * 1.25 + lineScale * 2.15);
    ctxos.font = `${lineScale * 0.55}px Custom,Noto Sans SC`;

    if (isTooHard()) {
      const dxmr = ctxos.measureText(tx).width;
      if (dxmr > canvasos.width - lineScale * 1.5)
        ctxos.font = `${((lineScale * 0.55) / dxi) * (canvasos.width - lineScale * 1.5)}px Custom,Noto Sans SC`;
      ctxos.fillText("所选模组难度极大 请谨慎挑战", app.wlen, app.hlen * 1.25 + lineScale * 3);
      ctxos.font = `${lineScale * 0.55}px Custom,Noto Sans SC`;
    }

    //判定线(装饰用)
    ctxos.globalAlpha = 1;
    ctxos.setTransform(1, 0, 0, 1, app.wlen, app.hlen);
    const imgW = lineScale * 48 * (timerIn.second < 0.67 ? tween.easeInSine(timerIn.second * 1.5) : 1);
    const imgH = lineScale * 0.15; //0.1333...
    if (timerIn.second >= 2.5) ctxos.globalAlpha = tween.easeOutSine(6 - timerIn.second * 2);
    ctxos.drawImage(lineColor.checked ? res["JudgeLineMP"] : res["JudgeLine"], -imgW / 2, -imgH / 2, imgW, imgH);
  }
  //绘制分数和combo以及暂停按钮
  ctxos.globalAlpha = 1;
  ctxos.setTransform(
    1,
    0,
    0,
    1,
    0,
    lineScale *
      (timerIn.second < 0.67
        ? tween.easeOutSine(timerIn.second * 1.5) - 1
        : -tween.easeOutSine(timerOut.second * 1.5)) *
      1.75
  );
  ctxos.textBaseline = "alphabetic";
  ctxos.font = `${lineScale * 0.95}px Custom,Noto Sans SC`;
  ctxos.textAlign = "right";
  ctxos.fillText(stat.scoreStr, canvasos.width - lineScale * 0.65, lineScale * 1.375);
  if (showAcc.checked) {
    ctxos.font = `${lineScale * 0.66}px Custom,Noto Sans SC`;
    ctxos.fillText(stat.accStr, canvasos.width - lineScale * 0.65, lineScale * 2.05);
  }
  if (stat.combo > 2) {
    ctxos.textAlign = "center";
    ctxos.font = `${lineScale * 1.32}px Custom,Noto Sans SC`;
    ctxos.fillText(stat.getComboText(), app.wlen, lineScale * 1.375);
    ctxos.globalAlpha =
      timerIn.second < 0.67 ? tween.easeOutSine(timerIn.second * 1.5) : 1 - tween.easeOutSine(timerOut.second * 1.5);
    ctxos.font = `${lineScale * 0.66}px Custom,Noto Sans SC`;
    ctxos.fillText(app.playMode === 1 ? "Auto" : app.playMode == 4 ? "Replay" : "combo", app.wlen, lineScale * 2.05);
  }
  //绘制曲名和等级
  ctxos.globalAlpha = 1;
  ctxos.setTransform(
    1,
    0,
    0,
    1,
    0,
    lineScale *
      (timerIn.second < 0.67 ? 1 - tween.easeOutSine(timerIn.second * 1.5) : tween.easeOutSine(timerOut.second * 1.5)) *
      1.75
  );
  ctxos.textBaseline = "alphabetic";
  ctxos.textAlign = "right";
  ctxos.font = `${lineScale * 0.63}px Custom,Noto Sans SC`;
  const dxlvl = ctxos.measureText(levelText).width;
  if (dxlvl > app.wlen - lineScale)
    ctxos.font = `${((lineScale * 0.63) / dxlvl) * (app.wlen - lineScale)}px Custom,Noto Sans SC`;
  ctxos.fillText(levelText, canvasos.width - lineScale * 0.75, canvasos.height - lineScale * 0.66);
  ctxos.textAlign = "left";
  ctxos.font = `${lineScale * 0.63}px Custom,Noto Sans SC`;
  const dxsnm = ctxos.measureText(inputName.value || inputName.placeholder).width;
  if (dxsnm > app.wlen - lineScale)
    ctxos.font = `${((lineScale * 0.63) / dxsnm) * (app.wlen - lineScale)}px Custom,Noto Sans SC`;
  ctxos.fillText(inputName.value || inputName.placeholder, lineScale * 0.65, canvasos.height - lineScale * 0.66);
  ctxos.resetTransform();
  //绘制时间和帧率以及note打击数
  if (timerIn.second < 0.67) ctxos.globalAlpha = tween.easeOutSine(timerIn.second * 1.5);
  else ctxos.globalAlpha = 1 - tween.easeOutSine(timerOut.second * 1.5);
  ctxos.textBaseline = "middle";
  ctxos.font = `${lineScale * 0.4}px Custom,Noto Sans SC`;
  ctxos.textAlign = "left";
  ctxos.fillText(
    `${time2Str(icwCfg[5] ? duration - timeBgm : timeBgm)}/${time2Str(duration)}${scfg()}`,
    lineScale * 0.05,
    lineScale * 0.5
  );
  ctxos.textAlign = "right";
  ctxos.fillText(frameTimer.fpsStr, canvasos.width - lineScale * 0.05, lineScale * 0.5);
  if (showStat.checked) {
    ctxos.textBaseline = "middle";
    ctxos.textAlign = "right";
    [
      stat.noteRank[6],
      stat.noteRank[7],
      stat.noteRank[5],
      stat.noteRank[4],
      stat.noteRank[1],
      stat.noteRank[3],
      stat.noteRank[2],
    ].forEach((val, idx) => {
      const comboColor = ["#fe7b93", "#0ac3ff", "lime", "#f0ed69", "lime", "#0ac3ff", "#999"];
      ctxos.fillStyle = comboColor[idx];
      ctxos.fillText(val, canvasos.width - lineScale * 0.05, canvasos.height / 2 + lineScale * (idx - 3) * 0.5);
    });
    ctxos.fillStyle = "#fff";
    ctxos.textAlign = "left";
    ctxos.fillText(`DSP:  ${stat.curDispStr}`, lineScale * 0.05, canvasos.height / 2 - lineScale * 0.25);
    ctxos.fillText(`AVG:  ${stat.avgDispStr}`, lineScale * 0.05, canvasos.height / 2 + lineScale * 0.25);
    ctxos.textBaseline = "alphabetic";
    ctxos.textAlign = "center";
    stat.combos.forEach((val, idx) => {
      const comboColor = ["#fff", "#0ac3ff", "#f0ed69", "#a0e9fd", "#fe4365"];
      ctxos.fillStyle = comboColor[idx];
      ctxos.fillText(val, lineScale * (idx + 0.55) * 1.1, canvasos.height - lineScale * 0.1);
    });
  }
  //判定线函数，undefined/0:默认,1:非,2:恒成立
  function drawLine(bool) {
    ctxos.globalAlpha = 1;
    const tw = 1 - tween.easeOutSine(timerOut.second * 1.5);
    for (const i of app.lines) {
      if (bool ^ i.imageD && timerOut.second < 0.67) {
        ctxos.globalAlpha = i.alpha;
        ctxos.setTransform(
          i.cosr * tw,
          i.sinr,
          -i.sinr * tw,
          i.cosr,
          app.wlen + (i.offsetX - app.wlen) * tw,
          i.offsetY
        ); //hiahiah
        const imgS = ((i.imageU ? lineScale * 18.75 : canvasos.height) * i.imageS) / 1080;
        const imgW = imgS * i.imageW * i.imageA;
        const imgH = imgS * i.imageH;
        ctxos.drawImage(
          i.imageL[i.imageC && lineColor.checked ? stat.lineStatus : 0],
          -imgW / 2,
          -imgH / 2,
          imgW,
          imgH
        );
      }
    }
  }
}

function drawEndPlay() {
  isDone = true;
  btnPause.click(); //isPaused = true;
  audio.stop();
  cancelAnimationFrame(stopDrawing);
  btnPause.classList.add("disabled");
  ctxos.globalCompositeOperation = "source-over";
  ctxos.resetTransform();
  ctxos.globalAlpha = 1;
  if ($("imageBlur").checked) ctxos.drawImage(app.bgImageBlur, ...adjustSize(app.bgImageBlur, canvasos, 1));
  else ctxos.drawImage(app.bgImage, ...adjustSize(app.bgImage, canvasos, 1));
  ctxos.fillStyle = "#000"; //背景变暗
  ctxos.globalAlpha = app.brightness; //背景不透明度
  ctxos.fillRect(0, 0, canvasos.width, canvasos.height);
  const difficulty = ["ez", "hd", "in", "at"].indexOf(levelText.slice(0, 2).toLocaleLowerCase());
  setTimeout(() => {
    if (!isDone) return; //qwq
    audio.play(res[`LevelOver${difficulty < 0 ? 2 : difficulty}_v1`], {
      loop: true,
    });
    timerEnd.reset();
    timerEnd.play();
    stat.level = Number(levelText.match(/\d+$/));
    isRankingsReady = stat.getData(app.playMode === 1, selectspeed.value, app);
  }, 1000);
}

function drawRankings(statData) {
  ctxos.resetTransform();
  ctxos.globalCompositeOperation = "source-over";
  ctxos.clearRect(0, 0, canvasos.width, canvasos.height);
  ctxos.globalAlpha = 1;
  if ($("imageBlur").checked) ctxos.drawImage(app.bgImageBlur, ...adjustSize(app.bgImageBlur, canvasos, 1));
  else ctxos.drawImage(app.bgImage, ...adjustSize(app.bgImage, canvasos, 1));
  ctxos.fillStyle = "#000"; //背景变暗
  ctxos.globalAlpha = app.brightness; //背景不透明度
  ctxos.fillRect(0, 0, canvasos.width, canvasos.height);
  ctxos.globalCompositeOperation = "destination-out";
  ctxos.globalAlpha = 1;
  const k = 3.7320508075688776; //tan75°
  ctxos.setTransform(
    canvasos.width - canvasos.height / k,
    0,
    -canvasos.height / k,
    canvasos.height,
    canvasos.height / k,
    0
  );
  ctxos.fillRect(0, 0, 1, tween.easeOutCubic(range((timerEnd.second - 0.13) * 0.94)));
  ctxos.resetTransform();
  ctxos.globalCompositeOperation = "destination-over";
  const qwq0 = (canvasos.width - canvasos.height / k) / (16 - 9 / k);
  ctxos.setTransform(qwq0 / 120, 0, 0, qwq0 / 120, app.wlen - qwq0 * 8, app.hlen - qwq0 * 4.5); //?
  ctxos.drawImage(res["LevelOver4"], 183, 42, 1184, 228);
  ctxos.globalAlpha = range((timerEnd.second - 0.27) / 0.83);
  ctxos.drawImage(res["LevelOver1"], 102, 378);
  ctxos.globalCompositeOperation = "source-over";
  ctxos.globalAlpha = 1;
  ctxos.drawImage(res["LevelOver5"], 700 * tween.easeOutCubic(range(timerEnd.second * 1.25)) - 369, 91, 20, 80);
  //曲名和等级
  ctxos.fillStyle = "#fff";
  ctxos.textBaseline = "middle";
  ctxos.textAlign = "left";
  ctxos.font = "80px Custom,Noto Sans SC";
  const dxsnm = ctxos.measureText(inputName.value || inputName.placeholder).width;
  if (dxsnm > 1500) ctxos.font = `${(80 / dxsnm) * 1500}px Custom,Noto Sans SC`;
  ctxos.fillText(
    inputName.value || inputName.placeholder,
    700 * tween.easeOutCubic(range(timerEnd.second * 1.25)) - 320,
    145
  );
  ctxos.font = "30px Custom,Noto Sans SC";
  const dxlvl = ctxos.measureText(levelText).width;
  if (dxlvl > 750) ctxos.font = `${(30 / dxlvl) * 750}px Custom,Noto Sans SC`;
  ctxos.fillText(levelText, 700 * tween.easeOutCubic(range(timerEnd.second * 1.25)) - 317, 208);
  ctxos.font = "30px Custom,Noto Sans SC";
  //Rank图标
  ctxos.globalAlpha = range((timerEnd.second - 1.87) * 3.75);
  const qwq2 = 293 + range((timerEnd.second - 1.87) * 3.75) * 100;
  const qwq3 = 410 - range((timerEnd.second - 1.87) * 2.14) * 164;
  ctxos.drawImage(res["LevelOver3"], 661 - qwq2 / 2, 545 - qwq2 / 2, qwq2, qwq2);
  ctxos.drawImage(res["Ranks"][stat.getRankStatus(app)], 661 - qwq3 / 2, 545 - qwq3 / 2, qwq3, qwq3);
  //各种数据
  ctxos.globalAlpha = range((timerEnd.second - 0.87) * 2.5);
  ctxos.fillStyle = statData.newBestColor;
  ctxos.fillText(statData.newBestStr, 898, 428);
  ctxos.fillStyle = "#fff";
  ctxos.textAlign = "center";
  ctxos.fillText(statData.scoreBest, 1180, 428);
  ctxos.globalAlpha = range((timerEnd.second - 1.87) * 2.5);
  ctxos.textAlign = "right";
  ctxos.fillText(statData.scoreDelta, 1414, 428);
  ctxos.globalAlpha = range((timerEnd.second - 0.95) * 1.5);
  ctxos.textAlign = "left";
  ctxos.fillText(stat.accStr, 352, 545);
  ctxos.fillText(stat.maxcombo, 1528, 545);
  ctxos.fillStyle = statData.textAboveColor;
  ctxos.fillText(
    app.speed === 1 ? "" : statData.textAboveStr.replace("{SPEED}", app.speed.toFixed(2)),
    383 + Math.min(dxlvl, 750),
    208
  );
  ctxos.fillStyle = statData.textBelowColor;
  ctxos.fillText(statData.textBelowStr, 1355, 590);
  ctxos.fillStyle = "#fff";
  ctxos.textAlign = "center";
  ctxos.font = "86px Custom,Noto Sans SC";
  ctxos.globalAlpha = range((timerEnd.second - 1.12) * 2.0);
  ctxos.fillText(stat.scoreStr, 1075, 554);
  ctxos.font = "26px Custom,Noto Sans SC";
  ctxos.globalAlpha = range((timerEnd.second - 0.87) * 2.5);
  ctxos.fillText(stat.perfect, 891, 645);
  ctxos.globalAlpha = range((timerEnd.second - 1.07) * 2.5);
  ctxos.fillText(stat.good, 1043, 645);
  ctxos.globalAlpha = range((timerEnd.second - 1.27) * 2.5);
  ctxos.fillText(stat.noteRank[6], 1196, 645);
  ctxos.globalAlpha = range((timerEnd.second - 1.47) * 2.5);
  ctxos.fillText(stat.noteRank[2], 1349, 645);
  ctxos.font = "22px Custom,Noto Sans SC";
  const qwq4 = range((icwCfg[3] > 0 ? timerEnd.second - icwCfg[3] : 0.2 - timerEnd.second - icwCfg[3]) * 5.0);
  ctxos.globalAlpha = 0.8 * range((timerEnd.second - 0.87) * 2.5) * qwq4;
  ctxos.fillStyle = "#696";
  ctxos.fill(new Path2D("M841,718s-10,0-10,10v80s0,10,10,10h100s10,0,10-10v-80s0-10-10-10h-40l-10-20-10,20h-40z"));
  ctxos.globalAlpha = 0.8 * range((timerEnd.second - 1.07) * 2.5) * qwq4;
  ctxos.fillStyle = "#669";
  ctxos.fill(new Path2D("M993,718s-10,0-10,10v80s0,10,10,10h100s10,0,10-10v-80s0-10-10-10h-40l-10-20-10,20h-40z"));
  ctxos.fillStyle = "#fff";
  ctxos.globalAlpha = range((timerEnd.second - 0.97) * 2.5) * qwq4;
  ctxos.fillText("Early: " + stat.noteRank[5], 891, 755);
  ctxos.fillText("Late: " + stat.noteRank[1], 891, 788);
  ctxos.globalAlpha = range((timerEnd.second - 1.17) * 2.5) * qwq4;
  ctxos.fillText("Early: " + stat.noteRank[7], 1043, 755);
  ctxos.fillText("Late: " + stat.noteRank[3], 1043, 788);
  ctxos.resetTransform();
  ctxos.globalCompositeOperation = "destination-over";
  ctxos.globalAlpha = 1;
  ctxos.fillStyle = "#000";
  ctxos.drawImage(app.bgImage, ...adjustSize(app.bgImage, canvasos, 1));
  ctxos.fillRect(0, 0, canvasos.width, canvasos.height);
}

function range(num) {
  if (num < 0) return 0;
  if (num > 1) return 1;
  return num;
}
class NoteRender {
  constructor() {
    this.urlMap = new Map();
  }
  init(pack = {}) {
    this.res = {
      Tap: pack["Tap"],
      TapHL: pack["TapHL"],
      Drag: pack["Drag"],
      DragHL: pack["DragHL"],
      HoldHead: pack["HoldHead"],
      HoldHeadHL: pack["HoldHeadHL"],
      Hold: pack["Hold"],
      HoldHL: pack["HoldHL"],
      HoldEnd: pack["HoldEnd"],
      Flick: pack["Flick"],
      FlickHL: pack["FlickHL"],
    };
  }
  async load() {} //todo
}
//绘制Note
function drawTap(note) {
  const HL = note.isMulti && app.multiHint;
  const nsr = app.noteScaleRatio;
  if (!note.visible || (note.scored && !note.badtime)) return;
  ctxos.globalAlpha = note.alpha;
  ctxos.setTransform(nsr * note.cosr, nsr * note.sinr, -nsr * note.sinr, nsr * note.cosr, note.offsetX, note.offsetY);
  if (note.badtime) ctxos.drawImage(res["TapBad"], -res["TapBad"].width * 0.5, -res["TapBad"].height * 0.5);
  else if (HL) ctxos.drawImage(res["TapHL"], -res["TapHL"].width * 0.5, -res["TapHL"].height * 0.5);
  else ctxos.drawImage(res["Tap"], -res["Tap"].width * 0.5, -res["Tap"].height * 0.5);
}

function drawDrag(note) {
  const HL = note.isMulti && app.multiHint;
  const nsr = app.noteScaleRatio;
  if (!note.visible || (note.scored && !note.badtime)) return;
  ctxos.globalAlpha = note.alpha;
  ctxos.setTransform(nsr * note.cosr, nsr * note.sinr, -nsr * note.sinr, nsr * note.cosr, note.offsetX, note.offsetY);
  if (note.badtime);
  else if (HL) ctxos.drawImage(res["DragHL"], -res["DragHL"].width * 0.5, -res["DragHL"].height * 0.5);
  else ctxos.drawImage(res["Drag"], -res["Drag"].width * 0.5, -res["Drag"].height * 0.5);
}

function drawHold(note, realTime) {
  const HL = note.isMulti && app.multiHint;
  const nsr = app.noteScaleRatio;
  if (!note.visible || note.realTime + note.realHoldTime < realTime) return; //qwq
  ctxos.globalAlpha = note.alpha;
  ctxos.setTransform(nsr * note.cosr, nsr * note.sinr, -nsr * note.sinr, nsr * note.cosr, note.offsetX, note.offsetY);
  const baseLength = (app.scaleY / nsr) * note.speed * app.speed;
  const holdLength = baseLength * note.realHoldTime;
  if (note.realTime > realTime) {
    if (HL) {
      ctxos.drawImage(
        res["HoldHeadHL"],
        -res["HoldHeadHL"].width * 1.026 * 0.5,
        0,
        res["HoldHeadHL"].width * 1.026,
        res["HoldHeadHL"].height * 1.026
      );
      ctxos.drawImage(
        res["HoldHL"],
        -res["HoldHL"].width * 1.026 * 0.5,
        -holdLength,
        res["HoldHL"].width * 1.026,
        holdLength
      );
    } else {
      ctxos.drawImage(res["HoldHead"], -res["HoldHead"].width * 0.5, 0);
      ctxos.drawImage(res["Hold"], -res["Hold"].width * 0.5, -holdLength, res["Hold"].width, holdLength);
    }
  } else {
    if (HL)
      ctxos.drawImage(
        res["HoldHL"],
        -res["HoldHL"].width * 1.026 * 0.5,
        -holdLength,
        res["HoldHL"].width * 1.026,
        holdLength - baseLength * (realTime - note.realTime)
      );
    else
      ctxos.drawImage(
        res["Hold"],
        -res["Hold"].width * 0.5,
        -holdLength,
        res["Hold"].width,
        holdLength - baseLength * (realTime - note.realTime)
      );
  }
  ctxos.drawImage(res["HoldEnd"], -res["HoldEnd"].width * 0.5, -holdLength - res["HoldEnd"].height);
}

function drawFlick(note) {
  const HL = note.isMulti && app.multiHint;
  const nsr = app.noteScaleRatio;
  if (!note.visible || (note.scored && !note.badtime)) return;
  ctxos.globalAlpha = note.alpha;
  ctxos.setTransform(nsr * note.cosr, nsr * note.sinr, -nsr * note.sinr, nsr * note.cosr, note.offsetX, note.offsetY);
  if (note.badtime);
  else if (HL) ctxos.drawImage(res["FlickHL"], -res["FlickHL"].width * 0.5, -res["FlickHL"].height * 0.5);
  else ctxos.drawImage(res["Flick"], -res["Flick"].width * 0.5, -res["Flick"].height * 0.5);
}
//调节画面尺寸和全屏相关(返回source播放aegleseeker会出现迷之error)
function adjustSize(source, dest, scale) {
  const sw = source.width;
  const sh = source.height;
  const dw = dest.width;
  const dh = dest.height;
  if (dw * sh > dh * sw)
    return [(dw * (1 - scale)) / 2, (dh - ((dw * sh) / sw) * scale) / 2, dw * scale, ((dw * sh) / sw) * scale];
  return [(dw - ((dh * sw) / sh) * scale) / 2, (dh * (1 - scale)) / 2, ((dh * sw) / sh) * scale, dh * scale];
}
/**@type {Map<ImageBitmap,LineImage>} */
const lineImages = new Map();
class LineImage {
  /**@param {ImageBitmap} image */
  constructor(image) {
    this.image = image;
    this.imageFC = null;
    this.imageAP = null;
    this.imageMP = null;
  }
  async getFC() {
    if (!this.imageFC) this.imageFC = await imgShader(this.image, "#a2eeff");
    return this.imageFC;
  }
  async getAP() {
    if (!this.imageAP) this.imageAP = await imgShader(this.image, "#a3ffac");
    return this.imageAP;
  }
  async getMP() {
    if (!this.imageMP) this.imageMP = await imgShader(this.image, "#feffa9");
    return this.imageMP;
  }
}
/**
 * 图片模糊(StackBlur)
 * @param {ImageBitmap} img
 */
function imgBlur(img) {
  const canvas = document.createElement("canvas");
  const w = (canvas.width = img.width);
  const h = (canvas.height = img.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  StackBlur.canvasRGBA(canvas, 0, 0, w, h, Math.ceil(Math.min(w, h) * 0.0125));
  return createImageBitmap(canvas);
}
/**
 * 给图片上色(limit用于解决iOS的InvalidStateError)
 * @param {ImageBitmap} img
 */
function imgShader(img, color, limit = 512) {
  const dataRGBA = hex2rgba(color);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true }); //warning
  ctx.drawImage(img, 0, 0);
  for (let dx = 0; dx < img.width; dx += limit) {
    for (let dy = 0; dy < img.height; dy += limit) {
      const imgData = ctx.getImageData(dx, dy, limit, limit);
      for (let i = 0; i < imgData.data.length / 4; i++) {
        imgData.data[i * 4] *= dataRGBA[0] / 255;
        imgData.data[i * 4 + 1] *= dataRGBA[1] / 255;
        imgData.data[i * 4 + 2] *= dataRGBA[2] / 255;
        imgData.data[i * 4 + 3] *= dataRGBA[3] / 255;
      }
      ctx.putImageData(imgData, dx, dy);
    }
  }
  return createImageBitmap(canvas);
}
/**
 * 给图片纯色(limit用于解决iOS的InvalidStateError)
 * @param {ImageBitmap} img
 */
function imgPainter(img, color, limit = 512) {
  const dataRGBA = hex2rgba(color);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true }); //warning
  ctx.drawImage(img, 0, 0);
  for (let dx = 0; dx < img.width; dx += limit) {
    for (let dy = 0; dy < img.height; dy += limit) {
      const imgData = ctx.getImageData(dx, dy, limit, limit);
      for (let i = 0; i < imgData.data.length / 4; i++) {
        imgData.data[i * 4] = dataRGBA[0];
        imgData.data[i * 4 + 1] = dataRGBA[1];
        imgData.data[i * 4 + 2] = dataRGBA[2];
        imgData.data[i * 4 + 3] *= dataRGBA[3] / 255;
      }
      ctx.putImageData(imgData, dx, dy);
    }
  }
  return createImageBitmap(canvas);
}
/**
 * 切割图片
 * @param {ImageBitmap} img
 * @param {number} [limitX]
 * @param {number} [limitY]
 */
function imgSplit(img, limitX, limitY) {
  limitX = parseInt(limitX) || Math.min(img.width, img.height);
  limitY = parseInt(limitY) || limitX;
  const arr = [];
  for (let dx = 0; dx < img.width; dx += limitX) {
    for (let dy = 0; dy < img.height; dy += limitY) {
      arr.push(createImageBitmap(img, dx, dy, limitX, limitY));
    }
  }
  return Promise.all(arr);
}
//十六进制color转rgba数组
function hex2rgba(color) {
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  return ctx.getImageData(0, 0, 1, 1).data;
}
//rgba数组(0-1)转十六进制
function rgba2hex(...rgba) {
  return "#" + rgba.map((i) => ("00" + Math.round(Number(i) * 255 || 0).toString(16)).slice(-2)).join("");
}
//debug
self.app = app;
self.res = res;
self.audio = audio;
