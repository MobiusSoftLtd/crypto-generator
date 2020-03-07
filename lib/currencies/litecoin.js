const lib = require('litecore-lib');

module.exports = function(count) {
    const response = [];

    for (let i = 0; i < count; i++) {
        const privateKey = new lib.PrivateKey();
        const address = privateKey.toAddress().toString();
        const wif = privateKey.toWIF();

        response.push({
            address,
            wif,
        });
    }

    return response;
};
