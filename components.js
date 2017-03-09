const stl = require('ansi-styles')
const vin = require('vindicate')

const default_fg = {
	open: stl.black.close,
	close: stl.black.close
}

const default_bg = {
	open: stl.bgBlack.close,
	close: stl.bgBlack.close
}

const WrapText = (text, { valign = 'top', fg = default_fg, bg = default_bg } = {}) => ({ x, y, w, h }) => draw => {
	if (w === 0 || h === 0) return

	const ex = x + w
	const ey = y + h

	let cx = x
	let cy = y

	for (let i = 0; i < text.length; i++) {
		draw(cx, cy, {
			char: text[i],
			styles: [fg, bg]
		})

		cx++
		if (cx >= ex) {
			cx = x
			cy++

			if (cy >= ey) return

			// skip leading spaces
			if (text[i + 1] === ' ') i++
		}
	}
}

const calculate_offset = (valign, height, used) => {
	if (valign === 'center') {
		const vdiff = height - used
		return vdiff > 0 ? vdiff / 2 | 0 : 0
	} else if (valign === 'bottom') {
		const vdiff = height - used
		return vdiff > 0 ? vdiff : 0
	} else {
		return 0
	}
}

const Text = (text, { justify = 'left', valign = 'top', fg = default_fg, bg = default_bg } = {}) => ({ x, y, w, h }) => draw => {
	const lines = vin.justify(text.split(/ /), w, vin[justify])
	const len = lines.length
	
	const offset = calculate_offset(valign, h, len)

	const ey = y + h

	// while line is within bounds
	for (let i = 0; i < lines.length && (y + i + offset < ey); i++) {
		const line = lines[i]
		for (let j = 0; j < line.length; j++) {
			draw(x + j, y + i + offset, {
				char: line[j],
				styles: [fg, bg]
			})
		}
	}
}

const Box = (child, { padding = 0 } = {})  => ({ x, y, w, h }) => draw => {
	const ex = x + w
	const ey = y + h

	for (let i = x + 1; i < ex - 1; i++) {
		draw(i, y, {
			char: '─',
			styles: []
		})

		draw(i, ey - 1, {
			char: '─',
			styles: []
		})
	}

	for (let i = y + 1; i < ey - 1; i++) {
		draw(x, i, {
			char: '│',
			styles: []
		})

		draw(ex - 1, i, {
			char: '│',
			styles: []
		})
	}

	draw(x, y, {
		char: '┌',
		styles: []
	})
	draw(ex - 1, y, {
		char: '┐',
		styles: []
	})
	draw(x, ey - 1, {
		char: '└',
		styles: []
	})
	draw(ex - 1, ey - 1, {
		char: '┘',
		styles: []
	})

	child({
		x: x + 1 + padding,
		y: y + 1 + padding,
		w: w - 2 * (1 + padding),
		h: h - 2 * (1 + padding)
	})(draw)
}

const divide = (a, b) => {
	const quot = a / b | 0
	const rem = a - quot * b
	return [quot, rem]
}

const HorizontalList = children => ({ x, y, w, h }) => draw => {
	const len = children.length
	const [size, extra] = divide(w - 2, len)

	let last_left = 0
	for (let i = 0; i < children.length; i++) {
		const width = size + (i < extra ? 1 : 0)

		children[i]({
			x: x + last_left,
			y: y,
			w: width,
			h: h
		})(draw)

		last_left += width
	}
}

const VerticalList = children => ({ x, y, w, h }) => draw => {
	const len = children.length
	const [size, extra] = divide(h - 2, len)

	let last_top = 0
	for (let i = 0; i < children.length; i++) {
		const height = size + (i < extra ? 1 : 0)

		children[i]({
			x: x,
			y: y + last_top,
			w: w,
			h: height
		})(draw)

		last_top += height
	}
}

module.exports = {
	WrapText,
	Text,
	Box,
	HorizontalList,
	VerticalList
}
