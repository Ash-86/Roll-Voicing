
import QtQuick 2.9
import QtQuick.Controls 2.2
import MuseScore 3.0
import "core.js" as Core 

MuseScore {
    menuPath: "Plugins.Roll melody up"
    description: "Roll melody  down"
    version: "1.0"
    //4.4 title: "Roll melody up"
    //4.4 thumbnailName: "thumbnail.jpg"
    //4.4 categoryCode: "Roll Voicing"

    Component.onCompleted: {
        if (mscoreMajorVersion >= 4) {
            title = "Roll melody up"
            thumbnailName = "thumbnail.jpg"
            categoryCode = "Roll Voicing"
        }
    }
       
        
    onRun: {            
             
        Core.rollListSel("melody", "up")     
    }

}