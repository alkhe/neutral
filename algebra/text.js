// delete word
const C_W = 23
// delete line
const C_U = 21
// delete forward
const C_D = 4
// back
const C_B = 2
// forward
const C_F = 6
// beginning
const C_A = 1
// end
const C_E = 5
// delete backward
const BS = 127

const DELETE_WORD_RX = /[^\s]+\s*$/
const DELETE_LINE_RX = /[^\n]+\s*$/

const deletion = rx => (text, cursor) => {
	const [before, after] = cursor === text.length
		? [text, '']
		: [text.substring(0, cursor), text.substring(cursor)]
	const match = before.match(rx)

	return match === null
		? { text: '', cursor: 0 }
		: { text: before.slice(0, match.index) + after, cursor: match.index }
}

const delete_word = deletion(DELETE_WORD_RX)
const delete_line = deletion(DELETE_LINE_RX)

function delete_char(text, cursor) {
	const [before, after] = cursor === text.length
		? [text, '']
		: [text.substring(0, cursor), text.substring(cursor)]

	return {
		text: before.substring(0, before.length - 1) + after,
		cursor: cursor - 1
	}
}

function insert_char(text, cursor, c) {
	const [before, after] = cursor === text.length
		? [text, '']
		: [text.substring(0, cursor), text.substring(cursor)]

	return {
		text: before + c + after,
		cursor: cursor + 1
	}
}

const is_char = code => 31 < code && code < 127

function update_text({ text = '', cursor = 0 }, ev) {
	switch (ev.code) {
		case C_W:
			return delete_word(text, cursor)
		case C_U:
			return delete_line(text, cursor)
		case C_D:
			return delete_char(text, cursor + 1)
		case BS:
			return delete_char(text, cursor)
		case C_B:
			return { text, cursor: Math.max(0, cursor - 1) }
		case C_F:
			return { text, cursor: Math.min(text.length, cursor + 1) }
		case C_A:
			return { text, cursor: 0 }
		case C_E:
			return { text, cursor: text.length }
	}

	if (is_char(ev.code)) {
		return insert_char(text, cursor, ev.char)
	} else {
		return { text, cursor }
	}
}

module.exports = update_text
