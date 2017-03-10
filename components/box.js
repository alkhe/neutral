const horizontal_bar = '─'
const vertical_bar = '│'
const top_left_corner = '┌'
const top_right_corner = '┐'
const bottom_left_corner = '└'
const bottom_right_corner = '┘'

const Box = (child, { padding = 0, style = [] } = {})  => ({ x, y, w, h }) => draw => {
	const ex = x + w
	const ey = y + h

	for (let i = x + 1; i < ex - 1; i++) {
		draw(i, y, {
			char: horizontal_bar,
			styles: style
		})

		draw(i, ey - 1, {
			char: horizontal_bar,
			styles: style
		})
	}

	for (let i = y + 1; i < ey - 1; i++) {
		draw(x, i, {
			char: vertical_bar,
			styles: style
		})

		draw(ex - 1, i, {
			char: vertical_bar,
			styles: style
		})
	}

	draw(x, y, {
		char: top_left_corner,
		styles: style
	})

	draw(ex - 1, y, {
		char: top_right_corner,
		styles: style
	})

	draw(x, ey - 1, {
		char: bottom_left_corner,
		styles: style
	})

	draw(ex - 1, ey - 1, {
		char: bottom_right_corner,
		styles: style
	})

	child({
		x: x + 1 + padding,
		y: y + 1 + padding,
		w: w - 2 * (1 + padding),
		h: h - 2 * (1 + padding)
	})(draw)
}

module.exports = Box
