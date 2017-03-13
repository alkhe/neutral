const xs = require('xstream').default
const { run } = require('@cycle/run')
const neutral = require('../neutral')
const Text = require('../components/text')
const Box = require('../components/box')
const { HorizontalList, VerticalList } = require('../components/list')

const term = neutral()
const truth = `A monad is just a monoid in the category of endofunctors, what's the problem?`

run(sources => {
	const keys$ = sources.view.filter(ev => ev.type === 'key')
	const size$ = sources.view.filter(ev => ev.type === 'resize')

	const exit$ = keys$.filter(ev => ev.char === 'q')

	const boxes = [
		Box(Text(truth, { justify: 'left', fg: 'green' }), { padding: 1 }),
		Box(Text(truth, { justify: 'right', fg: 'yellow', valign: 'center' }), { padding: 1 }),
		Box(Text(truth, { justify: 'center', fg: 'red', valign: 'bottom' }), { padding: 1 }),
		Box(Text(truth, { justify: 'stretch', fg: 'magenta' }), { padding: 1 }),
		Box(Text(truth, { fg: 'cyan' }), { padding: 1 })
	]

	const tree = VerticalList([
		HorizontalList(boxes),
		[HorizontalList([
			[VerticalList(boxes), 2],
			[VerticalList(boxes), 3],
			[VerticalList(boxes), 2]
		]), 5]
	])

	const view$ = size$.map(s => tree({ x: 0, y: 0, w: s.cols, h: s.rows }))

	return {
		view: view$,
		exit: exit$
	}
}, term)
