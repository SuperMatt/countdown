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
    if (!solution) return
    steps_shown = solution.steps.length
    render_solution()
}
