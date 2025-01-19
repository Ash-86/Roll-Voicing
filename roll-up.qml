
import QtQuick 2.9
import QtQuick.Controls 2.2
import MuseScore 3.0
import "core.js" as Core 

MuseScore {
    menuPath: "Plugins.Roll Chords up"
    description: "Roll Chords up"
    version: "1.0"
    //4.4 title: "Roll voicing up"
    //4.4 thumbnailName: "thumbnail.jpg"
    //4.4 categoryCode: "Roll Voicing"

    Component.onCompleted: {
        if (mscoreMajorVersion >= 4) {
            title = "Roll voicing up.jpg"
            categoryCode = "Roll Voicing"
        }
    }       
       
        
    onRun: {            
             
        Core.applyTransform("up")     
    }
}