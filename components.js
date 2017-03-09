const stl = require('ansi-styles')
const vin = require('vindicate')
const { divide } = require('./util')

const default_fg = { open: stl.black.close, close: '' }
const default_bg = { open: stl.bgBlack.close, close: '' }

const WrapText = (text, { valign = 'top', fg = 'default', bg = 'default' } = {}) => ({ x, y, w, h }) => draw => {
	if (w === 0 || h === 0) return

	const ex = x + w
	const ey = y + h

	let cx = x
	let cy = y

	for (let i = 0; i < text.length; i++) {
		draw(cx, cy, {
			char: text[i],
			styles: [fg === 'default' ? default_fg : stl[fg], bg === 'default' ? default_bg : stl[bg]]
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

const Text = (text, { justify = 'left', valign = 'top', fg = 'default', bg = 'default' } = {}) => ({ x, y, w, h }) => draw => {
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
				styles: [fg === 'default' ? default_fg : stl[fg], bg === 'default' ? default_bg : stl[bg]]
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

const sum = xs => {
	let s = 0
	for (let i = 0; i < xs.length; i++) {
		s += xs[i]
	}
	return s
}

const normalize_children = children => {
	const weights = []
	const normalized_children = []

	for (let i = 0; i < children.length; i++) {
		const c = children[i]

		if (c.constructor === Array) {
			weights.push(1 in c ? c[1] : 1)
			normalized_children.push(c[0])
		} else {
			weights.push(1)
			normalized_children.push(c)
		}
	}

	return [weights, normalized_children]
}

const HorizontalList = children => ({ x, y, w, h }) => draw => {
	const len = children.length
	if (len === 0) return

	const [weights, normalized_children] = normalize_children(children)
	const whole = sum(weights)
	const part = w / whole

	const last_i = len - 1

	let progress = 0
	for (let i = 0; i < last_i; i++) {
		const width = weights[i] * part | 0
		const child = normalized_children[i]

		child({
			x: x + progress,
			y: y,
			w: width,
			h: h
		})(draw)

		progress += width
	}

	const last_child = normalized_children[last_i]

	last_child({
		x: x + progress,
		y: y,
		w: w - progress,
		h: h
	})(draw)
}

const VerticalList = children => ({ x, y, w, h }) => draw => {
	const len = children.length
	if (len === 0) return

	const [weights, normalized_children] = normalize_children(children)
	const whole = sum(weights)
	const part = h / whole

	const last_i = len - 1

	let progress = 0
	for (let i = 0; i < last_i; i++) {
		const height = weights[i] * part | 0
		const child = normalized_children[i]

		child({
			x: x,
			y: y + progress,
			w: w,
			h: height
		})(draw)

		progress += height
	}

	const last_child = normalized_children[last_i]

	last_child({
		x: x,
		y: y + progress,
		w: w,
		h: h - progress
	})(draw)
}

module.exports = {
	WrapText,
	Text,
	Box,
	HorizontalList,
	VerticalList
}
