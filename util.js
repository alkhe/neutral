const concat = ss => {
	let out = ''

	for (let i = 0; i < ss.length; i++) {
		out += ss[i]
	}

	return out
}

const render_cell = c => {
	const { styles } = c

	let open = ''
	let close = ''

	for (let i = 0; i < styles.length; i++) {
		const s = styles[i]
		open += s.open
		close += s.close
	}

	return open + c.char + close
}

const divide = (a, b) => {
	const quot = a / b | 0
	const rem = a - quot * b
	return [quot, rem]
}

module.exports = {
	concat,
	render_cell,
	divide
}
