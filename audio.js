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
var clock_state = "idle"     // idle | running | stopped (paused part way) | up
var clock_started = null
var clock_stopped_at = 0
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
    $id("clock").muted = settings.muted
    draw_clock(0)
    update_main_button()
}

// One button that changes as the round goes: GO! -> Stop -> Clear board -> GO!
function main_button_action() {
    if (ready_timer || clock_state == "running") return "stop"
    if (clock_state == "up" || clock_state == "stopped") return "clear"
    return "go"
}

function update_main_button() {
    var action = main_button_action()
    var b = $id("main-btn")
    b.className = "btn main " + action
    b.textContent = {go: "GO!", stop: "Stop", clear: "Clear board"}[action]
}

function main_action() {
    var action = main_button_action()
    if (action == "go") countdown()
    else if (action == "clear") reset()
    else if (ready_timer) cancel_auto_start()   // stop during the get-ready pause: back to GO
    else pause_clock()
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

// Seconds since GO (null if the clock hasn't been started)
function clock_elapsed() {
    if (clock_state == "idle") return null
    if (clock_state == "up") return CLOCK_SECONDS
    if (clock_state == "stopped") return clock_stopped_at
    var audio = $id("clock")
    // Follow the music when it's playing so the hand and the bong line up
    var e = !audio.paused && audio.currentTime > 0
        ? audio.currentTime
        : (performance.now() - clock_started) / 1000
    return Math.min(e, CLOCK_SECONDS)
}

function tick() {
    var elapsed = clock_elapsed()
    draw_clock(elapsed)
    if (elapsed < CLOCK_SECONDS) {
        clock_frame = requestAnimationFrame(tick)
    } else {
        clock_frame = null
        time_up()
    }
}

function show_times_up(on) {
    $id("times-up").hidden = !on
    var face = $id("clock-face")
    face.classList.remove("flash")
    if (on) {
        void face.getBoundingClientRect()  // restart the animation
        face.classList.add("flash")
    }
}

function time_up() {
    clock_state = "up"
    show_times_up(true)
    update_main_button()
    on_time_up()
}

// Auto-start: when the board is ready, count down a short "get ready" pause
// (like the presenter talking on the show), then start the clock.
var ready_timer = null

function auto_start() {
    if (!settings.auto_start) return
    cancel_auto_start()
    var left = settings.auto_start
    var badge = $id("get-ready")
    badge.textContent = "Get ready… " + left
    badge.hidden = false
    ready_timer = setInterval(function() {
        left -= 1
        if (left > 0) {
            badge.textContent = "Get ready… " + left
        } else {
            countdown()
        }
    }, 1000)
    update_main_button()
}

function cancel_auto_start() {
    if (ready_timer) clearInterval(ready_timer)
    ready_timer = null
    $id("get-ready").hidden = true
    update_main_button()
}

function countdown() {
    cancel_auto_start()
    var audio = $id("clock")
    audio.currentTime = 0
    var p = audio.play()
    if (p && p.catch) p.catch(function() {})
    if (clock_frame) cancelAnimationFrame(clock_frame)
    clock_state = "running"
    show_times_up(false)
    clock_started = performance.now()
    clock_frame = requestAnimationFrame(tick)
    update_main_button()

    // Put the cursor in this round's text box so you can start typing straight away
    var field = {letters: "check-word", numbers: "method", conundrum: "guess"}[current_section]
    if (field) {
        $id(field).focus()
        $id(field).select()
    }
}

// Freeze the clock where it is (e.g. conundrum solved)
function pause_clock() {
    if (clock_state != "running") return
    clock_stopped_at = clock_elapsed()
    clock_state = "stopped"
    $id("clock").pause()
    if (clock_frame) cancelAnimationFrame(clock_frame)
    clock_frame = null
    update_main_button()
}

function stop_clock() {
    cancel_auto_start()
    var audio = $id("clock")
    audio.pause()
    audio.currentTime = 0
    if (clock_frame) cancelAnimationFrame(clock_frame)
    clock_frame = null
    clock_state = "idle"
    show_times_up(false)
    draw_clock(0)
    update_main_button()
}

function toggle_muted() {
    settings.muted = !settings.muted
    $id("clock").muted = settings.muted
    save_settings()
}

// Keep the screen from going to sleep while the page is open
var wake_lock = null

function keep_awake() {
    if (!("wakeLock" in navigator) || wake_lock || document.visibilityState != "visible") return
    navigator.wakeLock.request("screen").then(function(lock) {
        wake_lock = lock
        lock.addEventListener("release", function() { wake_lock = null })
    }).catch(function() {})
}

document.addEventListener("visibilitychange", keep_awake)
document.addEventListener("click", keep_awake)
document.addEventListener("keydown", keep_awake)
document.addEventListener("DOMContentLoaded", keep_awake)
