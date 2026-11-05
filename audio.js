// Preload the whole clock music into memory so GO! starts instantly.
// Falls back to the normal <source> streaming if the fetch fails.
document.addEventListener("DOMContentLoaded", function() {
    fetch("clock.mp3")
        .then(function(r) {
            if (!r.ok) throw new Error(r.status)
            return r.blob()
        })
        .then(function(blob) {
            var clock = $id("clock")
            clock.src = URL.createObjectURL(blob)
            clock.load()
        })
        .catch(function() {})
})

var CLOCK_SECONDS = 30
var clock_started = null
var clock_frame = null

function init_clock() {
    var ticks = ""
    for (var i = 0; i < 60; i += 5) {
        var t = i / 60 * 2 * Math.PI
        ticks += '<line x1="' + (50 + 38 * Math.sin(t)).toFixed(1) + '" y1="' + (50 - 38 * Math.cos(t)).toFixed(1) +
                 '" x2="' + (50 + 44 * Math.sin(t)).toFixed(1) + '" y2="' + (50 - 44 * Math.cos(t)).toFixed(1) +
                 '" stroke-width="' + (i % 15 ? 1.5 : 3) + '"/>'
    }
    $id("clock-ticks").innerHTML = ticks
    draw_clock(0)
}

// Like the show: a 60-second face, the hand sweeps half way round in 30 seconds
function draw_clock(elapsed) {
    var a = elapsed / 60 * 2 * Math.PI
    var x = (50 + 42 * Math.sin(a)).toFixed(2), y = (50 - 42 * Math.cos(a)).toFixed(2)
    $id("clock-sweep").setAttribute("d", elapsed > 0 ? "M50 50 L50 8 A42 42 0 0 1 " + x + " " + y + " Z" : "")
    $id("clock-hand").setAttribute("x2", x)
    $id("clock-hand").setAttribute("y2", y)
    var left = Math.ceil(CLOCK_SECONDS - elapsed)
    $id("clock-face").setAttribute("aria-label", "Countdown clock, " + left + " seconds left")
}

function tick() {
    var audio = $id("clock")
    // Follow the music when it's playing so the hand and the bong line up
    var elapsed = !audio.paused && audio.currentTime > 0
        ? audio.currentTime
        : (performance.now() - clock_started) / 1000
    elapsed = Math.min(elapsed, CLOCK_SECONDS)
    draw_clock(elapsed)
    clock_frame = elapsed < CLOCK_SECONDS ? requestAnimationFrame(tick) : null
}

function countdown() {
    var audio = $id("clock")
    audio.currentTime = 0
    var p = audio.play()
    if (p && p.catch) p.catch(function() {})
    if (clock_frame) cancelAnimationFrame(clock_frame)
    clock_started = performance.now()
    clock_frame = requestAnimationFrame(tick)

    // Put the cursor in this round's text box so you can start typing straight away
    var field = {letters: "check-word", conundrum: "guess"}[current_section]
    if (field) {
        $id(field).focus()
        $id(field).select()
    }
}

function stop_clock() {
    var audio = $id("clock")
    audio.pause()
    audio.currentTime = 0
    if (clock_frame) cancelAnimationFrame(clock_frame)
    clock_frame = null
    draw_clock(0)
}
