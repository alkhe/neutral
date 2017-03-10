const stl = require('ansi-styles')
const vin = require('vindicate')

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

const Text = (text, { justify = 'wrap', valign = 'top', fg = 'inherit', bg = 'inherit' } = {}) => {
	const styles = []

	if (fg === 'default') {
		styles.push(default_fg)
	} else if (fg !== 'inherit') {
		styles.push(stl[fg])
	}

	if (bg === 'default') {
		styles.push(default_bg)
	} else if (bg !== 'inherit') {
		styles.push(stl[bg])
	}

	return ({ x, y, w, h }) => {
		const lines = justify === 'wrap' ? vin.wrap(text, w) : vin.justify(text.split(/ /), w, vin[justify])
		const len = lines.length
		const real_y = y + calculate_offset(valign, h, len)
		const ey = y + h

		return draw => {
			// while line is within bounds
			for (let i = 0; i < lines.length && (real_y + i < ey); i++) {
				const line = lines[i]
				for (let j = 0; j < line.length; j++) {
					draw(x + j, real_y + i, {
						char: line[j],
						styles
					})
				}
			}
		}
	}
}

module.exports = Text
