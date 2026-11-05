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

var current_section = "letters"

function section(sec) {
  current_section = sec
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
  init_letters()
  init_clock()
  // ?street=1 starts in Street Countdown mode
  mode = get_flag("street") ? "street" : "classic"
  update_mode_buttons()
  section("letters")
})
