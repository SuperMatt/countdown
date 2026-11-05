// Two of each small number, like the show
var small = [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10]
var large = [25, 50, 75, 100]

var numbers_points = {
    "0": 10,
    "1": 7,
    "2": 7,
    "3": 7,
    "4": 7,
    "5": 7,
    "6": 5,
    "7": 5,
    "8": 5,
    "9": 5,
    "10": 5
}

var shuff_large = []
var shuff_small = []
var board_numbers = []
var target = null
var solution = null
var steps_shown = 0

function reset_numbers() {
    shuff_large = shuffle(large)
    shuff_small = shuffle(small)
    board_numbers = []
    target = null
    $id("stage").innerHTML = tiles_html(["", "", "", "", "", ""], "num")
    $id("target").innerHTML = "&nbsp;"
    $id("generate-btn").disabled = true
    clear_solution()
    clear_attempts()
}

function clear_solution() {
    solution = null
    steps_shown = 0
    $id("solution").innerHTML = ""
    $id("solve-btn").disabled = target === null
    $id("solve-btn").hidden = false
    $id("next-step-btn").hidden = true
    $id("all-steps-btn").hidden = true
}

function random_number(big) {
    cancel_auto_start()
    reset_numbers()
    board_numbers = shuff_large.slice(0, big).concat(shuff_small.slice(0, 6 - big))
    $id("stage").innerHTML = tiles_html(board_numbers.map(String), "num")
    $id("generate-btn").disabled = false
}

function generate() {
    if (board_numbers.length == 0) return
    target = Math.floor(Math.random() * 899) + 101  // 101 to 999
    $id("target").textContent = target
    clear_solution()
    clear_attempts()
    auto_start()
}

// Exhaustive search: closest result to target, using the fewest steps.
// Each step combines two available numbers; intermediate results must be
// positive integers (Countdown rules).
function solve_numbers(nums, goal) {
    var best = {diff: Infinity, value: null, steps: []}
    var steps = []

    function consider(v) {
        var d = Math.abs(v - goal)
        if (d < best.diff || (d == best.diff && steps.length < best.steps.length)) {
            best = {diff: d, value: v, steps: steps.slice()}
        }
    }

    function search(list) {
        // Once exact, only a strictly shorter solution is worth looking for
        if (best.diff == 0 && steps.length >= best.steps.length - 1) return
        for (var i = 0; i < list.length; i++) {
            for (var j = i + 1; j < list.length; j++) {
                var a = Math.max(list[i], list[j])
                var b = Math.min(list[i], list[j])
                var rest = []
                for (var k = 0; k < list.length; k++) {
                    if (k != i && k != j) rest.push(list[k])
                }
                var results = [[a + b, "+"]]
                if (b > 1) results.push([a * b, "×"])
                if (a != b && a - b != b) results.push([a - b, "−"])
                if (b > 1 && a % b == 0 && a / b != b) results.push([a / b, "÷"])

                for (var r = 0; r < results.length; r++) {
                    var v = results[r][0]
                    steps.push(a + " " + results[r][1] + " " + b + " = " + v)
                    consider(v)
                    if (rest.length > 0) {
                        rest.push(v)
                        search(rest)
                        rest.pop()
                    }
                    steps.pop()
                }
            }
        }
    }

    nums.forEach(consider)
    search(nums.slice())
    return best
}

function render_solution() {
    var s = solution
    var html = ""
    if (s.diff == 0) {
        html += "<h3>Exact solution for " + target + " in " + s.steps.length + " step" + (s.steps.length == 1 ? "" : "s") + "</h3>"
    } else {
        html += "<h3>No exact solution. Closest is " + s.value + " (" + s.diff + " away)</h3>"
    }
    if (s.steps.length == 0) {
        html += "<p>" + s.value + " is already on the board!</p>"
    } else {
        html += '<ol class="steps">'
        s.steps.forEach(function(st, i) {
            html += i < steps_shown ? "<li>" + st + "</li>" : '<li class="hidden-step">&nbsp;</li>'
        })
        html += "</ol>"
    }
    $id("solution").innerHTML = html
    var more = steps_shown < s.steps.length
    $id("solve-btn").hidden = true
    $id("next-step-btn").hidden = !more
    $id("all-steps-btn").hidden = !more
}

// First press: say whether it's exact. Then reveal one step at a time.
function show_solution() {
    if (target === null || board_numbers.length == 0) return
    if (solution) return next_step()
    $id("solution").innerHTML = '<p class="muted">Thinking&hellip;</p>'
    setTimeout(function() {
        solution = solve_numbers(board_numbers, target)
        steps_shown = 0
        render_solution()
    }, 20)
}

function next_step() {
    if (!solution) return
    steps_shown = Math.min(steps_shown + 1, solution.steps.length)
    render_solution()
}

function all_steps() {
    if (target === null || board_numbers.length == 0) return
    if (!solution) solution = solve_numbers(board_numbers, target)
    steps_shown = solution.steps.length
    render_solution()
}

// Method checker: type your working, e.g. (75 + 3) * 6 - 50
// Checks it only uses numbers on the board and follows the rules,
// then says how close it gets. Attempts stay listed until the next target.
var attempts = []

function clear_attempts() {
    attempts = []
    render_attempts()
    if ($id("method")) $id("method").value = ""
    set_result("method-result", "")
}

function tokenize(src) {
    var tokens = []
    var re = /\s*(?:(\d+)|([-+*\/xX×÷−()]))/gy
    var m
    src = src.trim()
    re.lastIndex = 0
    while (re.lastIndex < src.length) {
        var start = re.lastIndex
        m = re.exec(src)
        if (!m) throw new Error("I don't understand \"" + src.slice(start).trim().charAt(0) + "\". Use numbers, + − × ÷ and brackets")
        if (m[1] !== undefined) tokens.push({num: parseInt(m[1], 10)})
        else tokens.push({op: {"x": "*", "X": "*", "×": "*", "÷": "/", "−": "-"}[m[2]] || m[2]})
        while (re.lastIndex < src.length && /\s/.test(src[re.lastIndex])) re.lastIndex++
    }
    return tokens
}

var OP_SYMBOL = {"+": "+", "-": "\u2212", "*": "\u00d7", "/": "\u00f7"}

// Evaluate with Countdown rules: every step must give a positive whole number
function evaluate_method(src) {
    var tokens = tokenize(src)
    var pos = 0
    var used = []

    function peek() { return tokens[pos] }
    function apply(a, op, b) {
        var r
        if (op == "+") r = a + b
        else if (op == "*") r = a * b
        else if (op == "-") {
            r = a - b
            if (r <= 0) throw new Error(a + " \u2212 " + b + " isn't allowed: every step must stay above zero")
        } else {
            if (b == 0 || a % b != 0) throw new Error(a + " \u00f7 " + b + " isn't a whole number")
            r = a / b
        }
        return r
    }
    function factor() {
        var t = tokens[pos++]
        if (!t) throw new Error("It ends too soon")
        if (t.num !== undefined) { used.push(t.num); return t.num }
        if (t.op == "(") {
            var v = expr()
            if (!peek() || peek().op != ")") throw new Error("A bracket isn't closed")
            pos++
            return v
        }
        throw new Error("Unexpected " + (OP_SYMBOL[t.op] || t.op))
    }
    function term() {
        var v = factor()
        while (peek() && (peek().op == "*" || peek().op == "/")) {
            var op = tokens[pos++].op
            v = apply(v, op, factor())
        }
        return v
    }
    function expr() {
        var v = term()
        while (peek() && (peek().op == "+" || peek().op == "-")) {
            var op = tokens[pos++].op
            v = apply(v, op, term())
        }
        return v
    }

    if (tokens.length == 0) throw new Error("Type a method first")
    var value = expr()
    if (pos < tokens.length) throw new Error("Unexpected " + (tokens[pos].num !== undefined ? tokens[pos].num : (OP_SYMBOL[tokens[pos].op] || tokens[pos].op)))
    return {value: value, used: used}
}

// Numbers used that aren't available on the board ("" if fine)
function method_number_problems(used) {
    var have = {}
    board_numbers.forEach(function(n) { have[n] = (have[n] || 0) + 1 })
    var need = {}
    used.forEach(function(n) { need[n] = (need[n] || 0) + 1 })
    var problems = []
    Object.keys(need).forEach(function(n) {
        if (!have[n]) problems.push(n + " isn't on the board")
        else if (need[n] > have[n]) problems.push(n + " is used " + need[n] + " times but there " + (have[n] == 1 ? "is only one" : "are only " + have[n]))
    })
    return problems.join(", ")
}

function method_points(diff) {
    return diff == 0 ? 10 : diff <= 5 ? 7 : diff <= 10 ? 5 : 0
}

function pretty_method(src) {
    return src.replace(/\*|x|X/g, " \u00d7 ").replace(/\//g, " \u00f7 ").replace(/-/g, " \u2212 ").replace(/\+/g, " + ")
              .replace(/\s+/g, " ").replace(/\( /g, "(").replace(/ \)/g, ")").trim()
}

function check_method(e) {
    if (e) e.preventDefault()
    var input = $id("method")
    var src = input.value
    if (!src.trim()) return
    if (target === null) {
        set_result("method-result", "Generate a target first.", false)
        return
    }
    var r
    try {
        r = evaluate_method(src)
    } catch (err) {
        set_result("method-result", "✗ " + err.message, false)
        return  // keep the text so a typo can be fixed
    }
    var problems = method_number_problems(r.used)
    if (problems) {
        set_result("method-result", "✗ Can't use that: " + problems, false)
        return
    }
    var diff = Math.abs(r.value - target)
    var pts = method_points(diff)
    var late = clock_state == "up"
    var msg = "= " + r.value + (diff == 0 ? ", exact!" : ", " + diff + " away") +
              (late ? " (after time)" : " · " + pts + " point" + (pts == 1 ? "" : "s"))
    set_result("method-result", (pts > 0 ? "✓ " : "") + msg, pts > 0 && !late)
    attempts.push({text: pretty_method(src), value: r.value, diff: diff, late: late})
    input.value = ""
    render_attempts()
}

function render_attempts() {
    var el = $id("attempts")
    if (!el) return
    if (attempts.length == 0) {
        el.innerHTML = ""
        return
    }
    var best = null
    attempts.forEach(function(a) {
        if (!a.late && (!best || a.diff < best.diff)) best = a
    })
    var html = '<div class="label">Your methods' + (best ? " · best " + best.value + (best.diff ? " (" + best.diff + " away)" : " (exact)") : "") + '</div><div class="chips">'
    attempts.forEach(function(a) {
        var good = method_points(a.diff) > 0
        html += '<span class="checked-word ' + (good ? "good" : "bad") + (a == best && good ? " best" : "") + (a.late ? " late" : "") + '">' +
                escape_html(a.text) + " = " + a.value + (a.diff == 0 ? " ✓" : " (" + a.diff + " off)") +
                (a.late ? ' <span class="tag">late</span>' : "") + "</span>"
    })
    el.innerHTML = html + "</div>"
}
