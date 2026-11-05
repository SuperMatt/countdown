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
var words_loading = null

$( document ).ready(function() {

    for (var l in vowels) {
        numvowel = vowels[l]
        for (i = 0; i < numvowel; i++) {
            allvowels.push(l)
        }
    }

    for (var l in consonants) {
        numcon = consonants[l]
        for (i = 0; i < numcon; i++) {
            allcons.push(l)
        }
    }

    // ?street=1 starts in Street Countdown mode
    var p = new URLSearchParams(location.search).get("street")
    set_mode(p !== null && p !== "0" && p !== "false" ? "street" : "classic")
});

function set_mode(m) {
    mode = m
    $("#mode-classic").toggleClass("active btn-primary", m == "classic")
    $("#mode-street").toggleClass("active btn-primary", m == "street")
    reset()
}

function render_tiles() {
    var total = modes[mode].total
    var html = ""
    for (var i = 0; i < total; i++) {
        if (i > 0 && i % 9 == 0) html += "<br>"
        html += '<div class="tile"><div class="char" id="t' + i + '">&nbsp;</div></div>'
    }
    $("#letter-stage").html(html)
}

function letter(type) {
    var m = modes[mode]
    if (board_letters.length >= m.total) return

    if (type == "v") {
        if (numvowels >= m.maxvowels) return
        l = allvowels[numvowels]
        numvowels += 1;
        if (numvowels == m.maxvowels) {
            $("#vowels").attr("disabled", true)
        }
    }
    else if (type == "c") {
        if (numcons >= m.maxcons) return
        l = allcons[numcons]
        numcons += 1;
        if (numcons == m.maxcons) {
            $("#consonants").attr("disabled", true)
        }
    }

    board_letters.push(l)
    totalletters = board_letters.length

    if (totalletters == m.total) {
        $("#vowels").attr("disabled", true)
        $("#consonants").attr("disabled", true)
    }

    id = "#t" + (totalletters -1)
    $(id).text(l)
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

function show_words() {
    if (board_letters.length == 0) {
        $("#words").html("<p>Pick some letters first!</p>")
        return
    }
    $("#words").html("<p>Thinking...</p>")
    var letters = board_letters.slice()
    load_words().then(function(dict) {
        if (letters.join() !== board_letters.join()) return  // board changed meanwhile
        var found = find_words(letters, dict)
        if (found.length == 0) {
            $("#words").html("<p>No words found. Tough one!</p>")
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
        var html = ""
        groups.slice(0, 3).forEach(function(g) {
            var shown = g.words.slice(0, 30)
            html += "<h3>" + g.len + " letters (" + g.words.length + ")</h3><div>"
            shown.forEach(function(w) { html += '<span class="word">' + escape_html(w) + "</span>" })
            if (g.words.length > shown.length) html += '<span class="word">&hellip;</span>'
            html += "</div>"
        })
        $("#words").html(html)
    }).catch(function() {
        $("#words").html("<p>Couldn't load the dictionary, sorry.</p>")
    })
}
