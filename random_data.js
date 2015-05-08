importScripts("bower_components/chance/chance.js");

self.addEventListener('message', function(e) {
    var data = e.data;
    switch (data.cmd) {
    case 'start':
        var size = data.size;
        var x = "";
        var byte_length = 2048;
        var iterations = (size * 1024 * 1024) / byte_length;
        var old_value = 0;
        for (var i = 0; i < iterations; i++) {
            x = x + chance.string({length: byte_length});
            if (old_value != parseInt((i / iterations) * 100)) {
                self.postMessage({
                    'type': 'progress',
                    'progress': parseInt((i / iterations) * 100)
                });
                old_value = parseInt((i / iterations) * 100);
            }
        }
        self.postMessage({
            'type': 'result',
            'data': x
        });
        break;
    };
}, false);

