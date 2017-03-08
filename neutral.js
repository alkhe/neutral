const esc = require('ansi-escapes')
const xs = require('xstream').default
const from_event = require('xstream/extra/fromEvent').default
const { openSync: open, closeSync: close, writeSync: write } = require('fs')
const { concat, render_cell } = require('./util')

const commit_view = (v, width, buf) => {
	v((x, y, cell) => {
		buf[x] = render_cell(cell)
	})
}

const update_screen = (old_buf, new_buf) => {
	// for (let i = 0; i < old_buf.length; i++)
	return esc.clearScreen + concat(new_buf)
}

let back_buffer = Array(100).fill('')
let front_buffer = Array(100).fill('')

const term = () => {
	const stdin = process.openStdin()
	stdin.setRawMode(true)

	const fd = open('/dev/tty', 'a+')
	const put = write.bind(null, fd)

	put(esc.clearScreen)

	return {
		view: view$ => {
			view$.addListener({
				next(v) {
					commit_view(v, 3, back_buffer)
					put(update_screen(front_buffer, back_buffer))
					const temp = back_buffer
					back_buffer = front_buffer
					front_buffer = temp
				}
			})

			const keys = from_event(stdin, 'data').map(ev => ({
				type: 'key',
				char: ev.toString()
			}))

			return xs.merge(keys)
		},
		exit: exit$ => exit$.addListener({
			next() {
				put(esc.clearScreen)
				close(fd)
				stdin.setRawMode(false)
				process.exit()
			}
		})
	}
}

module.exports = term

