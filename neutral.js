const esc = require('ansi-escapes')
const cursor = require('cli-cursor')
const xs = require('xstream').default
const from_event = require('xstream/extra/fromEvent').default
const sample_combine = require('xstream/extra/sampleCombine').default
const { openSync: open, closeSync: close, appendFileSync: append } = require('fs')
const tty = require('tty')
const { concat, render_cell } = require('./util')

const log = append.bind(null, 'app.log')

const commit_view = (v, width, buf) => {
	v((x, y, cell) => {
		buf[y * width + x] = render_cell(cell)
	})
}

const update_screen = (old_buf, new_buf) => {
	// for (let i = 0; i < old_buf.length; i++)
	return esc.clearScreen + concat(new_buf)
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

	const resize = from_event(ws, 'resize').map(() => ({
		type: 'resize',
		rows: ws.rows,
		cols: ws.columns
	}))

	resize.addListener({
		next(ev) {
			rows = ev.rows
			cols = ev.cols

			const new_size = rows * cols
			const size_diff = new_size - back_buffer.length

			if (size_diff < 0) {
				back_buffer = back_buffer.slice(0, new_size)
				front_buffer = front_buffer.slice(0, new_size)
			} else if (size_diff > 0) {
				const spaces = Array(size_diff).fill(' ')
				back_buffer = back_buffer.concat(spaces)
				front_buffer = front_buffer.concat(spaces)
			}
		}
	})

	return {
		view: view$ => {
			const redraw$ = resize.compose(sample_combine(view$)).map(x => x[1])

			xs.merge(view$, redraw$).addListener({
				next(v) {
					commit_view(v, cols, back_buffer)
					put(update_screen(front_buffer, back_buffer))
					const temp = back_buffer
					back_buffer = front_buffer
					front_buffer = temp
				}
			})

			return xs.merge(keys, resize)
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

