import { urls, audio, csv2array } from './common.js';
import Pec from './pec2json.js';
export const uploader = {
	// files: [],
	input: Object.assign(document.createElement('input'), {
		type: 'file',
		accept: '',
		multiple: true,
		/**@this {HTMLInputElement} */
		onchange() {
			uploader.onchange(this.files);
			for (const i of this.files) { //加载文件
				const reader = new FileReader;
				reader.readAsArrayBuffer(i);
				reader.onprogress = evt => uploader.onprogress(evt, i);
				reader.onload = evt => uploader.onload(evt, i);
			}
		}
	}),
	uploadFile() {
		uploader.input.webkitdirectory = false;
		uploader.input.click();
	},
	uploadDir() {
		uploader.input.webkitdirectory = true;
		uploader.input.click();
	},
	onchange() {},
	onprogress() {},
	onload() {}
}
/**
 * @typedef {object} ReaderData
 * @property {string} name
 * @property {string} type
 * @property {ArrayBuffer|ImageBitmap|{}[]} data
 * 
 * @typedef {object} DataType
 * @property {string} name
 * @property {string} path
 * @property {ArrayBuffer} buffer
 * 
 * @typedef {object} ReaderOptions
 * @property {()=>void} onloadstart
 * @property {(param1:ReaderData,param2:number)=>void} onread
 * 
 * @param {DataType} result 
 * @param {ReaderOptions} options 
 */
export function readZip(result, {
	onloadstart = () => void 0,
	onread = () => void 0
}) {
	const string = async i => {
		const labels = ['utf-8', 'gbk', 'big5', 'shift_jis'];
		for (const label of labels) {
			const decoder = new TextDecoder(label, { fatal: true }); // '\ufffd'
			try {
				return decoder.decode(i);
			} catch (e) {
				if (label === labels[labels.length - 1]) throw e;
			}
		}
	};
	/**
	 * @param {DataType} i 
	 * @returns {Promise<ReaderData>}
	 */
	const it = async i => {
		if (i.name === 'line.csv') {
			const data = await string(i.buffer);
			const chartLine = csv2array(data, true);
			return { type: 'line', data: chartLine };
		}
		if (i.name === 'info.csv') {
			const data = await string(i.buffer);
			const chartInfo = csv2array(data, true);
			return { type: 'info', data: chartInfo };
		}
		if (i.name === 'Settings.txt' || i.name === 'info.txt') {
			const data = await string(i.buffer);
			const chartInfo = Pec.info(data); //qwq
			return { type: 'info', data: chartInfo };
		}
		return (async () => {
			const audioData = await audio.decode(i.buffer.slice());
			return { type: 'audio', name: i.name, data: audioData };
		})().catch(async () => {
			const data = new Blob([i.buffer]);
			const imageData = await createImageBitmap(data);
			return { type: 'image', name: i.name, data: imageData };
		}).catch(async () => {
			const data = await string(i.buffer);
			console.log(JSON.parse(data)); //test
			const jsonData = await chart123(JSON.parse(data));
			return { type: 'chart', name: i.name, md5: md5(data), data: jsonData };
		}).catch(async () => {
			const data = await string(i.buffer);
			console.log(i);
			const pecData = Pec.parse(data, i.name);
			const jsonData = await chart123(pecData.data);
			// for (const i of pecData.messages) msgHandler.sendWarning(i);
			return { type: 'chart', name: i.name, md5: md5(data), data: jsonData, msg: pecData.messages };
		}).catch(error => ({ type: 'error', name: i.name, data: error }));
	};
	const tl = urls['jszip'].reverse()[0];
	// 踩坑：worker实际上优化了性能，性能对比应该用zip测试而不是普通文件
	// if (!self._zip_reader) {
	// 	let total = 0;
	// 	loadJS(tl).then(() => loadJS('js/reader-zip.js')).then(() => {
	// 		self._zip_reader = new ZipReader(isJSZip, async msg => {
	// 			/** @type {{data:{name:string,path:string,buffer:ArrayBuffer},total:number}} */
	// 			const data = msg.data;
	// 			total = data.total;
	// 			const result = await it(data.data);
	// 			return onread(result,total);
	// 		});
	// 		self._zip_reader.postMessage(result);
	// 	});
	// } else self._zip_reader.postMessage(result);
	if (!self._zip_worker) {
		onloadstart();
		const worker = new Worker(`js/worker-zip.js#${tl}`); //以后考虑indexedDB存储url
		let total = 0;
		worker.addEventListener('message', async msg => {
			/** @type {{data:{name:string,path:string,buffer:ArrayBuffer},total:number}} */
			const data = msg.data;
			total = data.total;
			const result = await it(data.data);
			return onread(result, total);
		});
		self._zip_worker = worker;
	}
	self._zip_worker.postMessage(result, [result.buffer]);
}
//test
function chart123(chart) {
	const newChart = JSON.parse(JSON.stringify(chart)); //深拷贝
	switch (parseInt(newChart.formatVersion)) { //加花括号以避免beautify缩进bug
		case 1: {
			newChart.formatVersion = 3;
			for (const i of newChart.judgeLineList) {
				for (const j of i.judgeLineMoveEvents) {
					j.start2 = j.start % 1e3 / 520;
					j.end2 = j.end % 1e3 / 520;
					j.start = parseInt(j.start / 1e3) / 880;
					j.end = parseInt(j.end / 1e3) / 880;
				}
			}
		}
		case 3: {
			for (const i of newChart.judgeLineList) {
				let y = 0;
				for (const j of i.speedEvents) {
					if (j.startTime < 0) j.startTime = 0;
					j.floorPosition = y;
					y += (j.endTime - j.startTime) * j.value / i.bpm * 1.875;
					y = Math.fround(y); //float32
				}
			}
		}
		case 3473:
			break;
		default:
			throw `Unsupported formatVersion: ${newChart.formatVersion}`;
	}
	return newChart;
}