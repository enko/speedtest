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

function sendData(direction,size,post_data) {
    var start = new Date().getTime();
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
        type: (direction == 'download' ? 'GET' : 'POST'),
        url: (direction == 'download' ? "speedbytes_"+size+"?_="+new Date().getTime() : "empty?_="+new Date().getTime()),
        data: post_data,
        complete: function(xhr,status) {
            var end = new Date().getTime() - start;
            var speed = getReadableFileSizeString((size * 1024 * 1024) / (end / 1000)) + '/s';
            $('#calculatedspeed').text(speed);
            $('#start').removeClass('disabled');
        }
    });
}

function handleProgressEvent(evt) {
    $('#downloaded').text(getReadableFileSizeString(evt.loaded));
    $('#total').text(getReadableFileSizeString(evt.total));
    var percentComplete = (evt.loaded / evt.total) * 100;
    $('#dl-progress').progress({
        percent: percentComplete
    });
    var bytes = evt.loaded - lastsample.bytes;
    var seconds = new Date().getTime() - lastsample.time;
    var bytespersecond = (bytes / (seconds/1000));
    if (bytespersecond > maxvalue) {
        maxvalue = bytespersecond;
        $('#maxspeed').text(getReadableFileSizeString(maxvalue) + '/s')
    }
    $('#speed').text(getReadableFileSizeString(bytespersecond) + '/s')
    lastsample = {
        bytes: evt.loaded,
        time: new Date().getTime()
    };
}

$(document).ready(function(){
    $('#dl-progress').progress({
        percent: 0
    });

    $('#size,#direction')
        .dropdown({
            // you can use any ui transition
            transition: 'drop'
        })
    ;

    $.ajax({
        method: 'GET',
        url: "https://r.datenknoten.me/",
        success: function(data) {
            $('#ip').text(data);
        }
    });

    $('#start:not(.disabled)').click(function(){
        var size = parseInt($('input[name=size]').val());
        var direction = $('input[name=direction]').val();        
        size = (isNaN(size) ? 20 : size);
        direction = (direction == '' ? 'download' : direction);
        lastsample = {
            bytes: 0,
            time: new Date().getTime()
        };
        $('#start').addClass('disabled');
        $('#dl-progress').progress({
            percent: 0
        });
        var post_data = {};
        if (direction == 'upload') {
            $('#dl-progress .label').text('Generating random data');
            var worker = new Worker("random_data.js");
            worker.addEventListener('message', function(e) {
                var results = e.data;
                if (results.type == 'progress') {
                    $('#dl-progress').progress({
                        percent: results.progress
                    });
                } else if (results.type == 'result') {
                    post_data = {
                        data: results.data
                    };
                    $('#dl-progress .label').text('Testing speed');
                    $('#dl-progress').progress({
                        percent: 0
                    });             
                    sendData(direction,size,post_data);
                }
            }, false);
            worker.postMessage({'cmd': 'start', 'size': size});
        } else {
            $('#dl-progress').progress({
                percent: 0
            });
            sendData(direction,size,post_data);
        }

    });
    
});
