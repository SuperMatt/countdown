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

function section(sec) {
  if (sec == "l") {
    show = "#letters"
    hide = "#numbers"
    load_words()
  } else if (sec == "n") {
    show = "#numbers"
    hide = "#letters"
  }

  $(show).show()
  $(hide).hide()
  reset()
}

function reset() {
  $("#stage").html("")
  $("#target").html("")
  $("#solution").html("")
  $("#words").html("")

  render_tiles()

  numvowels = 0
  numcons = 0
  board_letters = []

  allvowels = shuffle(allvowels)
  allcons = shuffle(allcons)

  shuff_large = shuffle(large)
  shuff_small = shuffle(small)
  board_numbers = []
  target = null

  $("#clock").trigger("pause")
  $("#clock").prop("currentTime", 0)

  $("#consonants").attr("disabled", false)
  $("#vowels").attr("disabled", false)
}

function escape_html(s) {
  return String(s).replace(/[&<>"]/g, function(c) {
    return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]
  })
}
