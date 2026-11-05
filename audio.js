// Preload the whole clock music into memory so GO! starts instantly.
// Falls back to the normal <source> streaming if the fetch fails.
$(document).ready(function() {
    fetch("clock.mp3")
        .then(function(r) {
            if (!r.ok) throw new Error(r.status)
            return r.blob()
        })
        .then(function(blob) {
            var clock = document.getElementById("clock")
            clock.src = URL.createObjectURL(blob)
            clock.load()
        })
        .catch(function() {})
})

function countdown() {
    $("#clock").prop("currentTime", 0)
    $("#clock").trigger("play")
}
