// Roll-Voicing Plugin for MuseScore 4 https://github.com/Ash-86/Roll-Voicing                                          
// Copyright (C) 2025 Ashraf El Droubi [Ash-86]                                                                      

function rollListSel(type, roll) {
    var els = curScore.selection.elements
    
    var notes = [];
    for (var i = 0; i < els.length; i++) { //change elements array to a js array to operate on by sort/filter ...
        if (els[i].pitch != undefined) {
            notes.push(els[i])
        }
    }
    
    var byTrack = {}
    var byTick = {}
    for (var i = 0; i < notes.length; i++) {
        var track = notes[i].track
        var tick = notes[i].parent.parent.tick
        if (!byTrack[track]) {
            byTrack[track] = []
        }
        if (!byTick[tick]) {
            byTick[tick] = []
        }
        byTrack[track].push(notes[i])
        byTick[tick].push(notes[i])
    }

    curScore.startCmd()

    if (type == "melody") rollByAttribute(byTrack)
    if (type == "chord") rollByAttribute(byTick)

    curScore.selection.clear()
    for (var i = 0; i < notes.length; i++) {        
        curScore.selection.select(notes[i], true)
    }
    
    curScore.endCmd()
    quit()
    
    function rollByAttribute(byAttribute) {
        for (var att in byAttribute) {
            var notesOfAtt = byAttribute[att]

            var primes = []
            for (var m = 0; m < notesOfAtt.length; m++) {
                    
                var prime = {
                    pitch: notesOfAtt[m].pitch % 12,
                    tpc1: notesOfAtt[m].tpc1,
                    tpc2: notesOfAtt[m].tpc2
                }

                if (!primes.some(function (x) { return x.pitch == prime.pitch })) {        ////discard note is pitch already exists                        
                    primes.push(prime)
                }
            }
            primes.sort(function (a, b) { return a.pitch - b.pitch }) //sorting up

            var scale = []
            for (var k = 0; k < 12; k++) {
                for (var m = 0; m < primes.length; m++) {
                    var pitch = {
                        pitch: primes[m].pitch + 12 * k,
                        tpc1: primes[m].tpc1,
                        tpc2: primes[m].tpc2
                    }
                    scale.push(pitch)
                }
            }
            
            var direction = roll == "up" ? 1 : -1
            for (var m = 0; m < notesOfAtt.length; m++) {
                var idx = scale.findIndex(function (p) { return p.pitch == notesOfAtt[m].pitch })
                notesOfAtt[m].pitch = scale[idx + direction].pitch
                notesOfAtt[m].tpc1 = scale[idx + direction].tpc1
                notesOfAtt[m].tpc2 = scale[idx + direction].tpc2
            }
        }
    }
}