    var startgps = false;
    process.on('message', function(m) {



        if (m == 'startgps') {
            startgps = true;
        } else {
            startgps = false;
        }



        process.send("bin_im_child_ Process_");
        sendgps();

        // // Pass results back to parent process
        // process.send(m.toUpperCase(m));
    });

    var i = 0;

    function sendgps() {
        if (startgps) {
            process.send(i);
            i++;
        }

        setTimeout(function() {
            sendgps();
        }, 1000);
    }
