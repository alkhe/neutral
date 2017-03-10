const horizontal_bar = '─'
const vertical_bar = '│'
const top_left_corner = '┌'
const top_right_corner = '┐'
const bottom_left_corner = '└'
const bottom_right_corner = '┘'

const Box = (child, { padding = 0, style = [] } = {}) => {
	const horizontal = {
		char: horizontal_bar,
		styles: style
	}

	const vertical = {
		char: vertical_bar,
		styles: style
	}

	const top_left = {
		char: top_left_corner,
		styles: style
	}

	const top_right = {
		char: top_right_corner,
		styles: style
	}

	const bottom_left = {
		char: bottom_left_corner,
		styles: style
	}

	const bottom_right = {
		char: bottom_right_corner,
		styles: style
	}

	return ({ x, y, w, h }) => {
		const ex = x + w
		const ey = y + h

		const child_fn = child({
			x: x + 1 + padding,
			y: y + 1 + padding,
			w: w - 2 * (1 + padding),
			h: h - 2 * (1 + padding)
		})

		return draw => {
			for (let i = x + 1; i < ex - 1; i++) {
				draw(i, y, horizontal)
				draw(i, ey - 1, horizontal)
			}

			for (let i = y + 1; i < ey - 1; i++) {
				draw(x, i, vertical)
				draw(ex - 1, i, vertical)
			}

			draw(x, y, top_left)
			draw(ex - 1, y, top_right)
			draw(x, ey - 1, bottom_left)
			draw(ex - 1, ey - 1, bottom_right)

			child_fn(draw)
		}
	}
}

module.exports = Box
