const xs = require('xstream').default
const { run } = require('@cycle/run')
const neutral = require('../neutral')
const Text = require('../components/text')
const update_text = require('../algebra/text')

const term = neutral()

run(sources => {
	const keys$ = sources.view.filter(ev => ev.type === 'key')

	return {
		// view: keys$.map(ev => Text(String(ev.code))({ x: 0, y: 0, w: 3, h: 1 })),
		view: keys$.fold(update_text, { text: '', cursor: 0 }).map(o => Text(o.text)({ x: 0, y: 0, w: 20, h: 30 })),
		exit: keys$.filter(ev => ev.char === 'q')
	}
}, term)
