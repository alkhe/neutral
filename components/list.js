const { sum, noop2 } = require('../util')

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

const HorizontalList = children => {
	const len = children.length
	if (len === 0) return noop2

	const [weights, normalized_children] = normalize_children(children)
	const whole = sum(weights)

	const last_i = len - 1

	return ({ x, y, w, h }) => {
		const part = w / whole

		const child_fns = []

		let progress = 0
		for (let i = 0; i < last_i; i++) {
			const width = weights[i] * part | 0
			const child = normalized_children[i]

			child_fns.push(child({
				x: x + progress,
				y: y,
				w: width,
				h: h
			}))

			progress += width
		}

		const last_child = normalized_children[last_i]

		child_fns.push(last_child({
			x: x + progress,
			y: y,
			w: w - progress,
			h: h
		}))

		return draw => {
			for (let i = 0; i < child_fns.length; i++) {
				child_fns[i](draw)
			}
		}
	}
}

const VerticalList = children => {
	const len = children.length
	if (len === 0) return noop2

	const [weights, normalized_children] = normalize_children(children)
	const whole = sum(weights)

	const last_i = len - 1

	return ({ x, y, w, h }) => {
		const part = h / whole

		const child_fns = []

		let progress = 0
		for (let i = 0; i < last_i; i++) {
			const height = weights[i] * part | 0
			const child = normalized_children[i]

			child_fns.push(child({
				x: x,
				y: y + progress,
				w: w,
				h: height
			}))

			progress += height
		}

		const last_child = normalized_children[last_i]

		child_fns.push(last_child({
			x: x,
			y: y + progress,
			w: w,
			h: h - progress
		}))

		return draw => {
			for (let i = 0; i < child_fns.length; i++) {
				child_fns[i](draw)
			}
		}
	}
}

module.exports = {
	HorizontalList,
	VerticalList
}
