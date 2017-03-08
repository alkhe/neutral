const esc = require('ansi-escapes')
const stl = require('ansi-styles')
const xs = require('xstream').default
const { run } = require('@cycle/run')
const neutral = require('./neutral')

const term = neutral()

run(sources => {
	const keys$ = sources.view.filter(ev => ev.type === 'key')

	const view$ = xs.of(draw => {
		draw(0, 0, {
			char: 'H',
			styles: [stl.green]
		})
		draw(1, 0, {
			char: 'e',
			styles: [stl.red, stl.bold]
		})
		draw(2, 0, {
			char: 'l',
			styles: [stl.yellow, stl.underline]
		})
		draw(3, 0, {
			char: 'l',
			styles: [stl.blue]
		})
		draw(4, 0, {
			char: 'o',
			styles: [stl.bgBlack, stl.cyan]
		})
	})

	const exit$ = keys$.filter(ev => ev.char === 'q')

	return {
		view: view$,
		exit: exit$
	}
}, {
	view: term.view,
	exit: term.exit
})
