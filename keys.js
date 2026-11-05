// Keyboard shortcuts (listed in the page footer)
document.addEventListener("keydown", function(e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return
    var t = e.target
    if (t.tagName == "INPUT" || t.tagName == "TEXTAREA" || t.isContentEditable) return

    var k = e.key.toLowerCase()
    var handled = true

    if (k == " ") {
        // Don't let a focused button also get "clicked" by the space bar
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur()
        countdown()
    }
    else if (k == "r") reset()
    else if (k == "f") toggle_fullscreen()
    else if (k == "l") section("letters")
    else if (k == "n") section("numbers")
    else if (k == "k") section("conundrum")
    else if (current_section == "letters" && k == "v") letter("v")
    else if (current_section == "letters" && k == "c") letter("c")
    else if (current_section == "letters" && k == "a") show_words()
    else if (current_section == "numbers" && k >= "0" && k <= "4" && k.length == 1) random_number(parseInt(k))
    else if (current_section == "numbers" && k == "t") generate()
    else if (current_section == "numbers" && k == "a") show_solution()
    else if (current_section == "conundrum" && k == "t") new_conundrum()
    else if (current_section == "conundrum" && k == "a") reveal_conundrum()
    else handled = false

    if (handled) e.preventDefault()
})
