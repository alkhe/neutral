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

module.exports = {
	concat,
	render_cell
}
