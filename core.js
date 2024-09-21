/*========================================================================
  Pitch and Rhythm Transformer                                         
  https://github.com/Ash-86/Pitch-and-Rhythm-Transformer                  
                                                                        
  Copyright (C)2023 Ashraf El Droubi (Ash-86)                           
                                                                        
  This program is free software: you can redistribute it and/or modify  
  it under the terms of the GNU General Public License as published by  
  the Free Software Foundation, either version 3 of the License, or     
  (at your option) any later version.                                   
                                                                        
  This program is distributed in the hope that it will be useful,       
  but WITHOUT ANY WARRANTY; without even the implied warranty of        
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the         
  GNU General Public License for more details.                          
                                                                        
  You should have received a copy of the GNU General Public License     
  along with this program.  If not, see <http://www.gnu.org/licenses/>. 
=========================================================================*/


   
function applyTransform(roll){
        
    
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
               
        var onlyPitches=getArrays()      
        rollChord(onlyPitches, roll)
        curScore.selection.selectRange(startTick, endTick, startStaff, endStaff);

    curScore.endCmd()   


    ///////////   Get arrays: Pitches, onlyPitches, Rhythm (durations)///////
    
      
    
    
    function getArrays(){
        var onlyPitches=[]///without rests
        
        while (cursor.segment != null && cursor.tick < endTick) {
            var chord=[]            
            for(var track=startTrack; track<endTrack; track++){
                cursor.track=track
            
                if( !cursor.element) continue        
                var el=cursor.element            
            
                if (el.type == Element.CHORD) {
                    for (var n in el.notes){    
                        var chordNote ={ 
                            pitch: el.notes[n].pitch, 
                            tpc: el.notes[n].tpc, 
                            tpc1: el.notes[n].tpc1, 
                            tpc2: el.notes[n].tpc2 
                        }                                    
                        chord.push(chordNote)                    
                    }                    
                }  
                track++
            }
            onlyPitches.push(chord)          
            cursor.track=startTrack
            cursor.next();                       
        }
        
        cursor.rewind(1)        
        return onlyPitches
    }
    
    
    /////////////////////////////////////////////////////////////   

    
    function rollChord(Pitches,roll){
        var i=0
        while (cursor.segment != null && cursor.tick < endTick) {  
        
            var C=[]
            
            Pitches[i].sort(function(a, b){return a.pitch%12 - b.pitch%12}); //sorting up
            
            for (var m=0; m<Pitches[i].length;m++){
                Pitches[i][m].pitch%=12
                if(!C.some(function(x){return x.pitch==Pitches[i][m].pitch})){        ////discard note is pitch already exists                        
                    C.push(Pitches[i][m])
                }               
            }
            
            ///map scale of chord notes
            var CLength= C.length
            for (var k=1; k<12; k++){
                for (var m=0; m<CLength; m++){  
                    var n= JSON.parse(JSON.stringify(C[m])); // clone C[m] object without shared reference                   
                    n.pitch+=12*k 
                    C.push(n)
                }
            }  
            
            
            for(var track=startTrack; track<endTrack; track++){
                cursor.track=track
                
                if( !cursor.element) continue          
                
                var el=cursor.element              
                if (el.type == Element.CHORD) { 
                
                    if (roll=="up"){
                        for (var n=el.notes.length-1; n>=0; n--){ 

                            var idx = C.findIndex(function(obj){return obj.pitch == el.notes[n].pitch});  
                            el.notes[n].pitch= C[idx+1].pitch  ///change lowest note pitch and tpc
                            el.notes[n].tpc1= C[idx+1].tpc1   
                            el.notes[n].tpc2= C[idx+1].tpc2 
                        }
                    }
                    
                    if (roll=="down"){
                        for (var n=0; n<el.notes.length; n++){ 

                            var idx = C.findIndex(function(obj){return obj.pitch == el.notes[n].pitch});   
                            el.notes[n].pitch= C[idx-1].pitch  ///change lowest note pitch and tpc
                            el.notes[n].tpc1= C[idx-1].tpc1   
                            el.notes[n].tpc2= C[idx-1].tpc2 
                        }
                    }
                    
                }              
                track++
            }
                    
            i++                 
            cursor.track=startTrack 
            cursor.next()
        }  
    }   ///  end rollCHord
}///end transform

