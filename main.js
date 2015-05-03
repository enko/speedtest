// Taken from https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable
function getReadableFileSizeString(fileSizeInBytes) {

    var i = -1;
    var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
    do {
        fileSizeInBytes = fileSizeInBytes / 1024;
        i++;
    } while (fileSizeInBytes > 1024);

    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
}

var lastsample = {};
var maxvalue = 0;

function handleProgressEvent(evt) {
    $('#downloaded').text(getReadableFileSizeString(evt.loaded));
    $('#total').text(getReadableFileSizeString(evt.total));
    var percentComplete = (evt.loaded / evt.total) * 100;
    $('#dl-progress').progress({
        percent: percentComplete
    });
    var bytes = evt.loaded - lastsample.bytes;
    var seconds = new Date().getTime() - lastsample.time;
    console.log([bytes,seconds/1000]);
    var bytespersecond = (1 / (seconds/1000)) * bytes;
    if (bytespersecond > maxvalue) {
        maxvalue = bytespersecond;
        $('#maxspeed').text(getReadableFileSizeString(maxvalue))
    }
    $('#speed').text(getReadableFileSizeString(bytespersecond))
    lastsample = {
        bytes: evt.loaded,
        time: new Date().getTime()
    };
}

$(document).ready(function(){
    $('#dl-progress').progress({
        percent: 0
    });

    $('#start:not(.disabled)').click(function(){
        lastsample = {
            bytes: 0,
            time: new Date().getTime()
        };
        $('#start').addClass('disabled');
        $('#dl-progress').progress({
            percent: 0
        });
        $.ajax({
            xhr: function() {
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener("progress", function(evt) {
                    if (evt.lengthComputable) {
                        handleProgressEvent(evt);
                    }
                }, false);

                xhr.addEventListener("progress", function(evt) {
                    if (evt.lengthComputable) {
                        handleProgressEvent(evt);
                    }
                }, false);

                return xhr;
            },
            type: 'POST',
            url: "speedbytes",
            data: {},
            complete: function(xhr,status) {
                $('#start').removeClass('disabled');
            }
        });
    });
    
});
