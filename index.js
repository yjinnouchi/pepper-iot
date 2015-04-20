var tessel = require('tessel');
var climatelib = require('climate-si7020');
var pubnub = require("pubnub").init(
    {
        publish_key: "pub-c-046ffbf3-56c3-42a6-8730-98be12984e81",
        subscribe_key: "sub-c-f5f16f1c-e593-11e4-b759-0619f8945a4f"
    });

var climate = climatelib.use(tessel.port['A']);
var queueCount = 0;

climate.on('ready', function () {
    console.log('si7020:connected!');
    setImmediate(function loop() {
        publishTemperature();
        setTimeout(loop, 1000 * (queueCount + 1));
    });
});

climate.on('error', function (err) {
    console.log('si7020:connection error! ', err);
});

function publishTemperature() {
    climate.readTemperature('c', function (err, temp) {
        var data = {
            value: Math.floor(temp * 10) / 10,
            timestamp: new Date().getTime()
        };

        queueCount++;
        pubnub.publish({
            channel: "Sandbox",
            message: data,
            callback: function (e) {
                queueCount--;
                console.log("publish success:", e);
            },
            error: function (e) { console.log("publish failed:", e); }
        });
    });
}