var small = [1,2,3,4,5,6,7,8,9,10]
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

shuff_large = []
shuff_small = []
var board_numbers = []
var target = null

function generate() {
    number = Math.floor(Math.random()* 898 ) + 101
    target = number
    $("#target").html("<div class=\"tile tile-big\"><div class=\"char\">" + number + "</div></div>")
    $("#solution").html("")
    $("#solve-btn").attr("disabled", false)
}

function random_number(big) {
    var stagehtml = "<div class=\"row\"><div class=\"col-md-12 stage\">"
    sm = 6 - big
    board_numbers = []

    for (i=0; i < big; i ++) {
        board_numbers.push(shuff_large[i])
        stagehtml += '<div class="tile"><div class="char">' + shuff_large[i] + '</div></div>'
    }

    for (i=0; i < sm; i ++) {
        board_numbers.push(shuff_small[i])
        stagehtml += '<div class="tile"><div class="char">' + shuff_small[i] + '</div></div>'
    }

    stagehtml += '</div></div><div class="row">'
    stagehtml += '<div class="col-md-3 stage"><a class="btn btn-default btn-full" href="javascript:generate()">Generate</a></div>'
    stagehtml += '<div class="col-md-3 col-md-offset-6 stage"><button class="btn btn-info btn-full" id="solve-btn" onclick="show_solution()" disabled>Solution</button></div>'
    stagehtml += '</div>'
    $('#stage').html(stagehtml)
    $("#target").html("")
    $("#solution").html("")
    target = null
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
                var rest = list.filter(function(_, k) { return k != i && k != j })
                var results = [[a + b, "+"]]
                if (b > 1) results.push([a * b, "×"])
                if (a != b && a - b != b) results.push([a - b, "−"])
                if (b > 1 && a % b == 0 && a / b != b) results.push([a / b, "÷"])

                for (var r = 0; r < results.length; r++) {
                    var v = results[r][0]
                    steps.push(a + " " + results[r][1] + " " + b + " = " + v)
                    consider(v)
                    if (rest.length > 0) search(rest.concat([v]))
                    steps.pop()
                }
            }
        }
    }

    nums.forEach(consider)
    search(nums.slice())
    return best
}

function show_solution() {
    if (target === null || board_numbers.length == 0) return
    var s = solve_numbers(board_numbers, target)
    var html = ""
    if (s.diff == 0) {
        html += "<h3>Exact solution for " + target + "</h3>"
    } else {
        html += "<h3>No exact solution. Closest is " + s.value + " (" + s.diff + " away)</h3>"
    }
    if (s.steps.length == 0) {
        html += "<p>" + s.value + " is already on the board!</p>"
    } else {
        html += "<ol>"
        s.steps.forEach(function(st) { html += "<li>" + st + "</li>" })
        html += "</ol>"
    }
    $("#solution").html(html)
}
