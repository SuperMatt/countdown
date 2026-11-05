var vowels = {
    "A": 15,
    "E": 21,
    "I": 13,
    "O": 13,
    "U": 8
}

var consonants = {
    "B": 2,
    "C": 3,
    "D": 6,
    "F": 2,
    "G": 4,
    "H": 2,
    "J": 1,
    "K": 1,
    "L": 5,
    "M": 4,
    "N": 8,
    "P": 4,
    "Q": 1,
    "R": 10,
    "S": 10,
    "T": 11,
    "V": 2,
    "W": 2,
    "X": 1,
    "Y": 1,
    "Z": 1,
}

// Classic: 9 letters. Street Countdown: 18 letters, limits scaled to match.
var modes = {
    "classic": {total: 9,  maxvowels: 5,  maxcons: 6},
    "street":  {total: 18, maxvowels: 10, maxcons: 12}
}
var mode = "classic"

var allvowels = []
var allcons = []

var numvowels = 0
var numcons = 0
var board_letters = []

var words = null
var word_set = null
var words_loading = null

function init_letters() {
    for (var l in vowels) {
        for (var i = 0; i < vowels[l]; i++) allvowels.push(l)
    }
    for (var l in consonants) {
        for (var i = 0; i < consonants[l]; i++) allcons.push(l)
    }
}

function update_mode_buttons() {
    $id("mode-classic").classList.toggle("on", mode == "classic")
    $id("mode-street").classList.toggle("on", mode == "street")
}

function set_mode(m) {
    mode = m
    store_set("mode", m)
    update_mode_buttons()
    reset()
}

function render_tiles() {
    var total = modes[mode].total
    var html = ""
    for (var i = 0; i < total; i++) {
        if (i > 0 && i % 9 == 0) html += '<span class="break"></span>'
        html += '<span class="tile" id="t' + i + '">&nbsp;</span>'
    }
    $id("letter-stage").innerHTML = html
    $id("letter-stage").classList.toggle("street", mode == "street")
}

function reset_letters() {
    render_tiles()
    numvowels = 0
    numcons = 0
    board_letters = []
    allvowels = shuffle(allvowels)
    allcons = shuffle(allcons)
    $id("vowels").disabled = false
    $id("consonants").disabled = false
    $id("words").innerHTML = ""
    $id("check-word").value = ""
    set_result("check-result", "")
    checked = []
    answers_shown = false
    render_checked()
}

function letter(type) {
    var m = modes[mode]
    var l
    if (board_letters.length >= m.total) return

    if (type == "v") {
        if (numvowels >= m.maxvowels) return
        l = allvowels[numvowels]
        numvowels += 1
        if (numvowels == m.maxvowels) $id("vowels").disabled = true
    }
    else if (type == "c") {
        if (numcons >= m.maxcons) return
        l = allcons[numcons]
        numcons += 1
        if (numcons == m.maxcons) $id("consonants").disabled = true
    }

    board_letters.push(l)

    if (board_letters.length == m.total) {
        $id("vowels").disabled = true
        $id("consonants").disabled = true
    }

    $id("t" + (board_letters.length - 1)).textContent = l
    if (board_letters.length == m.total) auto_start()
}

// Fetch the dictionary in the background (only once)
function load_words() {
    if (!words_loading) {
        words_loading = fetch("words.txt")
            .then(function(r) {
                if (!r.ok) throw new Error("HTTP " + r.status)
                return r.text()
            })
            .then(function(t) {
                words = t.split("\n").filter(function(w) { return w.length > 0 })
                word_set = new Set(words)
                return words
            })
            .catch(function(e) {
                words_loading = null
                throw e
            })
    }
    return words_loading
}

function letter_counts(s) {
    var c = new Array(26).fill(0)
    for (var i = 0; i < s.length; i++) {
        c[s.charCodeAt(i) - 97]++
    }
    return c
}

// Why a word can't be made from the board, e.g. "no Z, only one E" ("" if makeable)
function missing_letters(word, letters) {
    var have = letter_counts(letters.join("").toLowerCase())
    var need = letter_counts(word)
    var problems = []
    var seen = {}
    for (var j = 0; j < word.length; j++) {
        var k = word.charCodeAt(j) - 97
        var L = word[j].toUpperCase()
        if (seen[L] || need[k] <= have[k]) continue
        seen[L] = true
        if (have[k] == 0) problems.push("no " + L)
        else problems.push("uses " + need[k] + " " + L + "s but there " + (have[k] == 1 ? "is only one" : "are only " + have[k]))
    }
    return problems.join(", ")
}

// All dictionary words makeable from the given letters, longest first
function find_words(letters, dict) {
    var avail = letter_counts(letters.join("").toLowerCase())
    var found = []
    for (var i = 0; i < dict.length; i++) {
        var w = dict[i]
        if (w.length > letters.length) continue
        var c = avail.slice()
        var ok = true
        for (var j = 0; j < w.length; j++) {
            var k = w.charCodeAt(j) - 97
            if (--c[k] < 0) { ok = false; break }
        }
        if (ok) found.push(w)
    }
    found.sort(function(a, b) { return b.length - a.length || (a < b ? -1 : 1) })
    return found
}

var answers_shown = false

// Your longest valid word, not counting ones checked after time was up
function best_checked() {
    var best = null
    checked.forEach(function(c) {
        if (c.ok && !c.late && (!best || c.word.length > best.word.length)) best = c
    })
    return best
}

function show_words() {
    if (board_letters.length == 0) {
        $id("words").innerHTML = '<p class="muted">Pick some letters first.</p>'
        return
    }
    answers_shown = true
    if (!words) $id("words").innerHTML = '<p class="muted">Thinking&hellip;</p>'
    var letters = board_letters.slice()
    load_words().then(function(dict) {
        if (letters.join() !== board_letters.join()) return  // board changed meanwhile
        var found = find_words(letters, dict)
        if (found.length == 0) {
            $id("words").innerHTML = '<p class="muted">No words found. Tough one!</p>'
            return
        }
        // Group by length, show the top 3 lengths
        var groups = []
        found.forEach(function(w) {
            if (groups.length == 0 || groups[groups.length - 1].len != w.length) {
                groups.push({len: w.length, words: []})
            }
            groups[groups.length - 1].words.push(w)
        })

        // How did you do?
        var mine = {}
        checked.forEach(function(c) { if (c.ok) mine[c.word] = true })
        var best = best_checked()
        var max = groups[0].len
        var summary
        if (!best) summary = "Best possible: " + max + " letters"
        else if (best.word.length == max) summary = "You found a best possible word: " + escape_html(best.word.toUpperCase()) + " (" + max + ")"
        else summary = "Your best: " + escape_html(best.word.toUpperCase()) + " (" + best.word.length + ") · Best possible: " + max + " letters"

        var html = "<h3>Answers</h3><p class=\"summary\">" + summary + "</p>"
        groups.slice(0, 3).forEach(function(g) {
            var shown = g.words.slice(0, 30)
            // Always list the words you found, even past the first 30
            g.words.slice(30).forEach(function(w) { if (mine[w]) shown.push(w) })
            html += '<div class="group"><span class="len">' + g.len + " letters (" + g.words.length + ')</span><div class="group-words">'
            shown.forEach(function(w) {
                html += '<span class="word' + (mine[w] ? " found" : "") + '">' + escape_html(w) + "</span>"
            })
            if (g.words.length > shown.length) html += '<span class="word">&hellip;</span>'
            html += "</div></div>"
        })
        $id("words").innerHTML = html
    }).catch(function() {
        $id("words").innerHTML = '<p class="muted">Couldn\'t load the dictionary. Reload the page and try again.</p>'
    })
}

// Word checker: is it in the dictionary, and can it be made from the board?
// Every checked word stays listed under the board until the board is reset.
// Words checked after the clock has run out are marked late.
var checked = []

function add_checked(word, ok, note) {
    var late = clock_state == "up"
    checked.push({word: word, ok: ok, note: late ? note + " (after time)" : note, late: late})
    render_checked()
    if (answers_shown) show_words()
}

function render_checked(flash_word) {
    var el = $id("checked")
    if (checked.length == 0) {
        el.innerHTML = ""
        return
    }
    var best = best_checked()
    var html = '<div class="label">Your words' +
        (best ? " · best " + escape_html(best.word.toUpperCase()) + " (" + best.word.length + ")" : "") + "</div><div class=\"chips\">"
    checked.forEach(function(c) {
        html += '<span class="checked-word ' + (c.ok ? "good" : "bad") + (c == best ? " best" : "") +
                (c.late ? " late" : "") + (c.word == flash_word ? " flash" : "") +
                '" title="' + escape_html(c.note) + '">' +
                (c.ok ? "✓ " : "✗ ") + '<span class="w">' + escape_html(c.word.toUpperCase()) + "</span>" +
                (c.ok ? " " + c.word.length : "") + (c.late ? ' <span class="tag">late</span>' : "") + "</span>"
    })
    $id("checked").innerHTML = html + "</div>"
}

function check_word(e) {
    if (e) e.preventDefault()
    var input = $id("check-word")
    var w = input.value.toLowerCase().replace(/[^a-z]/g, "")
    if (!w) return
    var W = w.toUpperCase()
    if (board_letters.length == 0) {
        set_result("check-result", "Pick some letters first.", false)
        return
    }
    input.value = ""
    if (checked.some(function(c) { return c.word == w })) {
        set_result("check-result", "You've already checked " + W)
        render_checked(w)
        return
    }
    var letters = board_letters.join()
    var missing = missing_letters(w, board_letters)
    if (missing) {
        set_result("check-result", "✗ " + W + " can't be made: " + missing, false)
        add_checked(w, false, "Can't be made: " + missing)
        return
    }
    set_result("check-result", "Checking…")
    load_words().then(function() {
        if (letters !== board_letters.join()) return  // board changed meanwhile
        if (checked.some(function(c) { return c.word == w })) return  // checked twice quickly
        if (word_set.has(w)) {
            set_result("check-result", "✓ " + W + ": " + w.length + " letters" + (clock_state == "up" ? " (after time)" : ""), true)
            add_checked(w, true, w.length + " letters")
        } else {
            set_result("check-result", "✗ " + W + " isn't in the dictionary", false)
            add_checked(w, false, "Not in the dictionary")
        }
    }).catch(function() {
        set_result("check-result", "Couldn't load the dictionary.", false)
    })
}
