const xs = require('xstream').default
const sampleCombine = require('xstream/extra/sampleCombine').default
const { run } = require('@cycle/run')
const neutral = require('../neutral')
const Text = require('../components/text')
const Box = require('../components/box')
const { HorizontalList } = require('../components/list')

const term = neutral()
const truth = `A monad is just a monoid in the category of endofunctors, what's the problem?`

const is_char = code => 31 < code && code < 127

run(sources => {
	const keys$ = sources.view.filter(ev => ev.type === 'key')
	const ctrl$ = keys$.filter(ev => !is_char(ev.code))
	const char$ = keys$.filter(ev => is_char(ev.code))

	const size$ = sources.view.filter(ev => ev.type === 'resize')

	// C-q
	const exit$ = ctrl$.filter(ev => ev.code === 17)

	const tab$ = ctrl$.filter(ev => ev.code === 9)

	const focus$ = tab$.fold(which => !which, false)
	const input$ = char$.compose(sampleCombine(focus$))

	const text1$ = input$.filter(ev => ev[1]).fold((s, [ev]) =>
		// Backspace
		ev.code === 127
			? s.substring(0, s.length - 1)
			: s + ev.char,
		''
	)

	const text2$ = input$.filter(ev => !ev[1]).fold((s, [ev]) =>
		// Backspace
		ev.code === 127
			? s.substring(0, s.length - 1)
			: s + ev.char,
		''
	)

	const view$ = xs.combine(size$, text1$, text2$).map(([size, text1, text2]) =>
		HorizontalList([
			Box(Text(text1, { fg: 'bold' })),
			Box(Text(text2, { fg: 'underline', bg: 'bgBlack' }))
		])({ x: 0, y: 0, w: size.cols, h: size.rows })
	)

	return {
		view: view$,
		exit: exit$
	}
}, term)

