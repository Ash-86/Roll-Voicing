// Roll-Voicing Plugin for MuseScore 4 https://github.com/Ash-86/Roll-Voicing                                          
// Copyright (C) 2025 Ashraf El Droubi [Ash-86]                                                                      

function applyTransform(type, roll) {        
    
    var cursor = curScore.newCursor(); 

    /////// Get Selection //////////////////////////
    cursor.rewind(2); // go to the end of the selection
    var endTick = cursor.tick;
    // if (endTick == 0) { // dealing with some bug when selecting to end.
    // 	var endTick = score.lastSegment.tick + 1;
    // }
    var endStaff = cursor.staffIdx +1;
    var endTrack = endStaff * 4;
    //start		
    cursor.rewind(1); // go to the beginning of the selection
    var startSegTick= curScore.selection.startSegment.tick;
    var startTick = cursor.tick;
    var startStaff = cursor.staffIdx;
    var startTrack = startStaff * 4;
    cursor.rewind(1);       // beginning of selection
    ///////////////////////////////////////////////////

    curScore.startCmd()    
        
        if (type == "melody") {
            var allMelodies = getMelody()      
            rollMelody(allMelodies, roll)
            
        }
        if (type == "chord") {
            var allChords = getChords()
            rollChord(allChords, roll)
        }
        curScore.selection.selectRange(startTick, endTick, startStaff, endStaff);

    curScore.endCmd()   

    ////////////////////////////////////////////////////////////
    
    function getChords() {
        var allChords = []///without rests
        
        while (cursor.segment != null && cursor.tick < endTick) {
            var chord = []            
            for(var track = startTrack; track < endTrack; track++) {
                cursor.track = track
            
                if( !cursor.element) continue        
                    storeNoteTo(chord)
                    track++
                }
            allChords.push(chord)          
            cursor.track = startTrack
            cursor.next();                       
        }
        cursor.rewind(1)        
        return allChords
    }
    
    
    /////////////////////////////////////////////////////////////   
    

    function getMelody() {
        
        var allMelodies = []
        for (var track = startTrack; track < endTrack; track++){
            cursor.rewind(1)
            cursor.track = track
            if (!cursor.element) continue
                var melody = [] ///without rests
                while (cursor.segment != null && cursor.tick < endTick) {
                    storeNoteTo(melody)
                    cursor.next();
                }
            allMelodies.push(melody)
            cursor.rewind(startTick)            
        }
        return allMelodies
    }

    ////////////////////////////////////////////////////////////

    function storeNoteTo(array) {
        var el = cursor.element
            
        if (el.type == Element.CHORD) {
            for (var n in el.notes) {
                var chordNote = {
                    pitch: el.notes[n].pitch,
                    tpc: el.notes[n].tpc,
                    tpc1: el.notes[n].tpc1,
                    tpc2: el.notes[n].tpc2
                }
                array.push(chordNote)
            }
        }
    }

    ///////////////////////////////////////////////////////////
    
    function rollChord(allChords, roll) {
        var i = 0
        cursor.rewind(1)
        while (cursor.segment != null && cursor.tick < endTick) {  
            var C = getOrderedSet(allChords[i])
            
            for(var track = startTrack; track < endTrack; track++){
                cursor.track = track
                if (!cursor.element) continue
                replaceElement(C, roll)                
            }                    
            i++ 
            cursor.track = startTrack 
            cursor.next()
        }  
    }   

    //////////////////////////////////////////////////////////

    function rollMelody (allMelodies, roll) {
        var i = 0
        for (var track = startTrack; track < endTrack; track++){
            cursor.track = track
            if (!cursor.element) {
                continue
            }
            var C = getOrderedSet(allMelodies[i])
            while (cursor.segment != null && cursor.tick < endTick) {
                replaceElement(C, roll)
                cursor.next()
            }             
            i++
            cursor.rewind(1)
        }
    }

    //////////////////////////////////////////////////////////

    function replaceElement(set, roll) { 
        var el = cursor.element
        if (el.type == Element.CHORD) {
        
            if (roll == "up") {
                for (var n = el.notes.length - 1; n >= 0; n--) {

                    var idx = set.findIndex(function (obj) { return obj.pitch == el.notes[n].pitch });
                    el.notes[n].pitch = set[idx + 1].pitch  ///change lowest note pitch and tpc
                    el.notes[n].tpc1 = set[idx + 1].tpc1
                    el.notes[n].tpc2 = set[idx + 1].tpc2
                }
            }
            
            if (roll == "down") {
                for (var n = 0; n < el.notes.length; n++) {

                    var idx = set.findIndex(function (obj) { return obj.pitch == el.notes[n].pitch });
                    el.notes[n].pitch = set[idx - 1].pitch  ///change lowest note pitch and tpc
                    el.notes[n].tpc1 = set[idx - 1].tpc1
                    el.notes[n].tpc2 = set[idx - 1].tpc2
                }
            }
            
        }
    }

    //////////////////////////////////////////////////////////

    function getOrderedSet(array) {
        array.sort(function (a, b) { return a.pitch % 12 - b.pitch % 12 }); //sorting up
        
        var set = []
        for (var m = 0; m < array.length; m++) {
            array[m].pitch %= 12
            if (!set.some(function (x) { return x.pitch == array[m].pitch })) {        ////discard note is pitch already exists                        
                set.push(array[m])
            }
        }
        
        ///map scale of chord notes
        var initialSetLength = set.length
        for (var k = 1; k < 12; k++) {
            for (var m = 0; m < initialSetLength; m++) {
                var n = JSON.parse(JSON.stringify(set[m])); // clone C[m] object without shared reference                   
                n.pitch += 12 * k
                set.push(n)
            }
        }
        return set
    }
}///end transform

