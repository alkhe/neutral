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
	HorizontalList,
	VerticalList
}
