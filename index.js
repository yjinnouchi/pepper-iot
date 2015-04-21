var tessel = require('tessel');
var climatelib = require('climate-si7020');
// �C��Z���T��A�|�[�g���g�p����
var climate = climatelib.use(tessel.port['A']);


var pubnub = require("pubnub").init(
    {
        publish_key: "pub-c-046ffbf3-56c3-42a6-8730-98be12984e81",
        subscribe_key: "sub-c-f5f16f1c-e593-11e4-b759-0619f8945a4f"
    });

// pubnub���M�L���[�J�E���g
var queueCount = 0;

climate.on('ready', function () {
    console.log('si7020:connected!');
    setImmediate(function loop() {
        // �C��Z���T�[�̒l���擾
        climate.readTemperature('c', function (err, temp) {
            publishTemperature(temp);
        });
        // ���M�L���[�����܂��Ă����瑗�M�Ԋu�𒷂�����
        setTimeout(loop, 1000 * (queueCount + 1));
    });
});

function publishTemperature(temp) {
    // ���M�f�[�^�̐��`
    var data = {
        value: Math.floor(temp * 10) / 10,
        timestamp: new Date().getTime()
    };
    // pubnub�ɑ��M
    pubnub.publish({
        channel: "Sandbox",
        message: data,
        callback: function (e) {
            queueCount--;
            console.log("publish success:", e);
        },
        error: function (e) { console.log("publish failed:", e); }
    });
    queueCount++;
}

climate.on('error', function (err) {
    console.log('si7020:connection error! ', err);
});