const stl = require('ansi-styles')
const xs = require('xstream').default
const { run } = require('@cycle/run')
const neutral = require('./neutral')
const { WrapText, Text, Box, HorizontalList, VerticalList } = require('./components')

const term = neutral()
const truth = 'A monad is just a monoid in the category of endofunctors, what\'s the problem?'

run(sources => {
	const keys$ = sources.view.filter(ev => ev.type === 'key')
	const exit$ = keys$.filter(ev => ev.char === 'q')

	const boxes = [
		Box(Text(truth, { fg: stl.green }), { padding: 1 }),
		Box(Text(truth, { justify: 'right', valign: 'center', fg: stl.yellow }), { padding: 1 }),
		Box(Text(truth, { justify: 'center', valign: 'bottom', fg: stl.red }), { padding: 1 }),
		Box(Text(truth, { justify: 'stretch', fg: stl.magenta }), { padding: 1 }),
		Box(WrapText(truth, { fg: stl.cyan }), { padding: 1 })
	]

	const l = HorizontalList(boxes)({ x: 0, y: 0, w: 100, h: 10 })
	const l2 = VerticalList(boxes)({ x: 0, y: 10, w: 30, h: 50 })
	const l3 = VerticalList(boxes)({ x: 30, y: 10, w: 30, h: 50 })
	const l4 = VerticalList(boxes)({ x: 60, y: 10, w: 30, h: 50 })

	const view$ = xs.of(draw => {
		[l, l2, l3, l4].forEach(c => c(draw))
	})

	return {
		view: view$,
		exit: exit$
	}
}, term)
