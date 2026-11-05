// Conundrum: a scrambled 9-letter word with exactly one answer
var conundrums = null
var conundrum_word = null

// 9-letter words that are the only anagram of their letters.
// Skip words ending in S to avoid easy plurals.
function build_conundrums(dict) {
    var groups = new Map()
    dict.forEach(function(w) {
        if (w.length != 9) return
        var key = w.split("").sort().join("")
        groups.set(key, (groups.get(key) || 0) + 1)
    })
    return dict.filter(function(w) {
        return w.length == 9 && w[8] != "s" && groups.get(w.split("").sort().join("")) == 1
    })
}

function reset_conundrum() {
    conundrum_word = null
    $id("conundrum-stage").innerHTML = tiles_html(["", "", "", "", "", "", "", "", ""])
    $id("conundrum-answer").innerHTML = ""
    $id("reveal-btn").disabled = true
    $id("guess").value = ""
    set_result("guess-result", "")
}

function new_conundrum() {
    load_words().then(function(dict) {
        if (!conundrums) conundrums = build_conundrums(dict)
        reset_conundrum()
        conundrum_word = conundrums[Math.floor(Math.random() * conundrums.length)]
        var scrambled
        do {
            scrambled = shuffle(conundrum_word.split("")).join("")
        } while (scrambled == conundrum_word)
        $id("conundrum-stage").innerHTML = tiles_html(scrambled.toUpperCase().split(""))
        $id("reveal-btn").disabled = false
        countdown()  // the clock starts as soon as the conundrum is shown
    }).catch(function() {
        $id("conundrum-answer").innerHTML = '<p class="muted">Couldn\'t load the dictionary. Reload the page and try again.</p>'
    })
}

function reveal_conundrum() {
    if (!conundrum_word) return
    $id("conundrum-answer").innerHTML = "<h3>The answer</h3>" +
        '<div class="board">' + tiles_html(conundrum_word.toUpperCase().split("")) + "</div>"
    stop_clock()
}

function guess_conundrum(e) {
    if (e) e.preventDefault()
    if (!conundrum_word) {
        set_result("guess-result", "Start a new conundrum first.", false)
        return
    }
    var g = $id("guess").value.toLowerCase().replace(/[^a-z]/g, "")
    if (!g) return
    if (g == conundrum_word) {
        set_result("guess-result", "✓ Correct! " + g.toUpperCase(), true)
        reveal_conundrum()
    } else {
        set_result("guess-result", "✗ " + g.toUpperCase() + " is wrong", false)
    }
}
