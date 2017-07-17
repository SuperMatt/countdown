var vowels = {
    "A": 15,
    "E": 21,
    "I": 13,
    "O": 13,
    "U": 8
}

var consonants = {
    "B": 2,
    "C": 3,
    "D": 6,
    "F": 2,
    "G": 4,
    "H": 2,
    "J": 1,
    "K": 1,
    "L": 5,
    "M": 4,
    "N": 8,
    "P": 4,
    "Q": 1,
    "R": 10,
    "S": 10,
    "T": 11,
    "V": 2,
    "W": 2,
    "X": 1,
    "Y": 1,
    "Z": 1,
}

var allvowels = []
var allcons = []

var maxvowels = 5
var maxcons = 6

var numvowels = 0
var numcons = 0

$( document ).ready(function() {
    
    for (var l in vowels) {
        numvowel = vowels[l]
        for (i = 0; i < numvowel; i++) {
            allvowels.push(l)
        }
    }

    for (var l in consonants) {
        numcon = consonants[l]
        for (i = 0; i < numcon; i++) {
            allcons.push(l)
        }
    }

    reset()
});

function letter(type) {
    if (type == "v") {
        l = allvowels[numvowels]
        numvowels += 1;
        if (numvowels == maxvowels) {
            $("#vowels").attr("disabled", true)
        }
    }
    else if (type == "c") {
        l = allcons[numcons]
        numcons += 1;
        if (numcons == maxcons) {
            $("#consonants").attr("disabled", true)
        }
    }

    totalletters = numvowels + numcons

    if (totalletters == 9) {
        $("#vowels").attr("disabled", true)
        $("#consonants").attr("disabled", true)
    }

    id = "#t" + (totalletters -1)
    $(id).text(l)
}