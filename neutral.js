const esc = require('ansi-escapes')
const cursor = require('cli-cursor')
const xs = require('xstream').default
const from_event = require('xstream/extra/fromEvent').default
const sample_combine = require('xstream/extra/sampleCombine').default
const { openSync: open, closeSync: close } = require('fs')
const tty = require('tty')
const { concat, render_cell, divide } = require('./util')

const commit_view = (v, width, buf) => {
	v((x, y, cell) => {
		buf[y * width + x] = render_cell(cell)
	})
}

const update_screen = (old_buf, new_buf, rows, cols) => {
	let out = ''

	for (let i = 0; i < old_buf.length; i++) {
		const new_cell = new_buf[i]
		if (old_buf[i] !== new_cell) {
			const [y, x] = divide(i, cols)
			out += esc.cursorTo(x, y) + new_cell
		}
	}

	return out

	// fresh render
	// return esc.clearScreen + concat(new_buf)
}

const term = () => {
	cursor.hide()

	const fd = open('/dev/tty', 'a+')
	const ws = new tty.WriteStream(fd)
	const rs = new tty.ReadStream(fd)

	rs.setRawMode(true)

	const put = ws.write.bind(ws)

	put(esc.clearScreen)

	process.on('SIGWINCH', () => {
		ws._refreshSize()
	})

	let rows = ws.rows
	let cols = ws.columns

	let back_buffer = Array(rows * cols).fill(' ')
	let front_buffer = Array(rows * cols).fill(' ')

	const keys = from_event(rs, 'data').map(ev => ({
		type: 'key',
		char: ev.toString()
	}))

	const resize = from_event(ws, 'resize').startWith().map(() => ({
		type: 'resize',
		rows: ws.rows,
		cols: ws.columns
	}))

	const handle_resize$ = resize.map(ev => {
		rows = ev.rows
		cols = ev.cols

		const new_size = rows * cols
		const size_diff = new_size - back_buffer.length

		if (size_diff < 0) {
			back_buffer = back_buffer.slice(0, new_size).fill(' ')
			front_buffer = front_buffer.slice(0, new_size).fill(' ')
		} else if (size_diff > 0) {
			const expansion = Array(size_diff)
			back_buffer = back_buffer.concat(expansion).fill(' ')
			front_buffer = front_buffer.concat(expansion).fill(' ')
		}

		put(esc.clearScreen)

		return ev
	})

	return {
		view: view$ => {
			view$.addListener({
				next(v) {
					commit_view(v, cols, back_buffer)
					put(update_screen(front_buffer, back_buffer, rows, cols))
					const temp = back_buffer
					back_buffer = front_buffer
					front_buffer = temp
					back_buffer.fill(' ')
				}
			})

			return xs.merge(keys, handle_resize$)
		},
		exit: exit$ => exit$.addListener({
			next() {
				put(esc.clearScreen)
				ws.end()
				rs.end()
				close(fd)
			}
		})
	}
}

module.exports = term

