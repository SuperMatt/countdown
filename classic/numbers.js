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

function generate() {
    number = Math.floor(Math.random()* 898 ) + 101
    $("#target").html("<div class=\"tile tile-big\"><div class=\"char\">" + number + "</div></div>")
}

function random_number(big) {
    var stagehtml = "<div class=\"row\"><div class=\"col-md-12 stage\">"
    sm = 6 - big

    for (i=0; i < big; i ++) {
        stagehtml += '<div class="tile"><div class="char">' + shuff_large[i] + '</div></div>'
    }

    for (i=0; i < sm; i ++) {
        stagehtml += '<div class="tile"><div class="char">' + shuff_small[i] + '</div></div>'
    }

    stagehtml += '</div></div><div class="row"><div class="col-md-3 stage"><a class="btn btn-default btn-full" href="javascript:generate()">Generate</a></div></div>'
    $('#stage').html(stagehtml)
    $("#target").html("")
}