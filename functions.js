function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function $id(id) {
  return document.getElementById(id)
}

function escape_html(s) {
  return String(s).replace(/[&<>"]/g, function(c) {
    return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]
  })
}

function get_flag(name) {
  var p = new URLSearchParams(location.search).get(name)
  return p !== null && p !== "0" && p !== "false"
}

function tiles_html(chars, cls) {
  return chars.map(function(c) {
    return '<span class="tile' + (cls ? " " + cls : "") + '">' + (c === "" ? "&nbsp;" : escape_html(c)) + "</span>"
  }).join("")
}

function set_result(id, text, good) {
  var el = $id(id)
  el.textContent = text
  el.className = "result " + (good === undefined ? "" : good ? "good" : "bad")
}

// Saved in the browser: options, letters mode and the last round played
function store_get(key) {
  try { return localStorage.getItem(key) } catch (e) { return null }
}

function store_set(key, value) {
  try { localStorage.setItem(key, value) } catch (e) {}
}

var settings = {
  muted: store_get("muted") == "1",
  auto_answers: store_get("auto_answers") == "1",
  auto_start: parseInt(store_get("auto_start"), 10) || 0,  // seconds of "get ready" pause, 0 = off
  carry_piles: store_get("carry_piles") != "0",   // default on
  cap_repeats: store_get("cap_repeats") != "0"    // default on
}

var AUTO_START_CHOICES = [0, 3, 5]

function save_settings() {
  store_set("muted", settings.muted ? "1" : "0")
  store_set("auto_answers", settings.auto_answers ? "1" : "0")
  store_set("auto_start", String(settings.auto_start))
  store_set("carry_piles", settings.carry_piles ? "1" : "0")
  store_set("cap_repeats", settings.cap_repeats ? "1" : "0")
  render_options()
}

function render_options() {
  $id("opt-sound").classList.toggle("on", !settings.muted)
  $id("opt-sound").textContent = settings.muted ? "Sound off" : "Sound on"
  $id("opt-auto").classList.toggle("on", settings.auto_answers)
  $id("opt-auto").textContent = "Answers at time's up: " + (settings.auto_answers ? "on" : "off")
  $id("opt-piles").classList.toggle("on", settings.carry_piles)
  $id("opt-piles").textContent = "Piles carry over: " + (settings.carry_piles ? "on" : "off")
  $id("opt-cap").classList.toggle("on", settings.cap_repeats)
  $id("opt-cap").textContent = "Repeat cap: " + (settings.cap_repeats ? "on" : "off")
  $id("opt-start").classList.toggle("on", settings.auto_start > 0)
  $id("opt-start").textContent = "Auto-start: " + (settings.auto_start > 0 ? settings.auto_start + "s pause" : "off")
}

function toggle_carry_piles() {
  settings.carry_piles = !settings.carry_piles
  save_settings()
}

function toggle_cap_repeats() {
  settings.cap_repeats = !settings.cap_repeats
  save_settings()
}

function cycle_auto_start() {
  var i = AUTO_START_CHOICES.indexOf(settings.auto_start)
  settings.auto_start = AUTO_START_CHOICES[(i + 1) % AUTO_START_CHOICES.length]
  save_settings()
}

function toggle_auto_answers() {
  settings.auto_answers = !settings.auto_answers
  save_settings()
}

// Called by the clock when the 30 seconds are up
function on_time_up() {
  if (!settings.auto_answers) return
  if (current_section == "letters" && board_letters.length > 0) show_words()
  else if (current_section == "numbers" && target !== null) all_steps()
  else if (current_section == "conundrum" && conundrum_word && !conundrum_solved) {
    set_result("guess-result", "Out of time!", false)
    reveal_conundrum()
  }
}

var current_section = "letters"

function section(sec) {
  current_section = sec
  store_set("section", sec)
  ;["letters", "numbers", "conundrum"].forEach(function(s) {
    $id(s).hidden = s != sec
  })
  document.querySelectorAll("[data-tab]").forEach(function(b) {
    b.classList.toggle("on", b.dataset.tab == sec)
  })
  if (sec != "numbers") load_words().catch(function() {})
  reset()
}

function reset() {
  reset_letters()
  reset_numbers()
  reset_conundrum()
  stop_clock()
}

function set_style(s) {
  document.documentElement.dataset.style = s
  try { localStorage.setItem("style", s) } catch (e) {}
  document.querySelectorAll("[data-style-btn]").forEach(function(b) {
    b.classList.toggle("on", b.dataset.styleBtn == s)
  })
}

function toggle_fullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(function() {})
  }
}

document.addEventListener("fullscreenchange", function() {
  var fs = !!document.fullscreenElement
  document.documentElement.classList.toggle("is-fullscreen", fs)
  $id("fullscreen-btn").textContent = fs ? "Exit fullscreen" : "Fullscreen"
})

document.addEventListener("DOMContentLoaded", function() {
  if (!document.documentElement.requestFullscreen) $id("fullscreen-btn").hidden = true
  set_style(document.documentElement.dataset.style)
  render_options()
  init_letters()
  init_clock()
  // ?street=1 starts in Street Countdown mode, otherwise use the last mode played
  mode = get_flag("street") ? "street" : (store_get("mode") == "street" ? "street" : "classic")
  update_mode_buttons()
  var last = store_get("section")
  section(["letters", "numbers", "conundrum"].indexOf(last) >= 0 ? last : "letters")
})
