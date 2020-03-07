const base58 = require('bs58');
const wif = require('wif');
const crypto = require('crypto');

const lib = {
  generatePrivateKey: function () {
    let privateKey = Buffer.alloc(32);
    let currentIndex = 0;
    let step = 0;
    let randomStep = null;

    while (currentIndex < privateKey.length) {
      if (randomStep === null) {
        randomStep = parseInt(Math.random() * 10);
      } else if (randomStep === step) {
        randomStep = null;
        step = 0;
        let randomBytes = crypto.randomBytes(1024);
        let randomIndex = Math.floor(Math.random() * randomBytes.length);
        privateKey[currentIndex++] = randomBytes[randomIndex];
      } else {
        crypto.randomBytes(1024);
        step++;
      }
    }

    return privateKey;
  },
  ripemd160: function (buffer) {
    let hash = crypto.createHash('ripemd160');
    hash.update(buffer);
    return hash.digest();
  },

  sha256: function (buffer) {
    let hash = crypto.createHash('sha256');
    hash.update(buffer);
    return hash.digest();
  },

  setPrivateKey: function (privateKey) {
    if (!this._ecdh) {
      this._ecdh = crypto.createECDH('secp256k1');
    }
    this._ecdh.setPrivateKey(privateKey);
    this._privateKey = privateKey;
  },

  publicKeyToAddress: function (publicKey) {
    let sha256 = this.sha256(publicKey);

    let hash160 = this.ripemd160(sha256);

    let buffer = Buffer.alloc(21);
    buffer[0] = 0x00;
    hash160.copy(buffer, 1);

    let checksum = this.sha256(this.sha256(buffer));

    // Compute address buffer
    let addressBuffer = Buffer.alloc(25);
    buffer.copy(addressBuffer);
    checksum.copy(addressBuffer, 21);

    // Convert to Base58
    return base58.encode(addressBuffer);
  },
  getAddressCompressed: function () {
    return this.publicKeyToAddress(this._ecdh.getPublicKey('buffer', 'compressed'));
  },
  getAddressUncompressed: function () {
    return this.publicKeyToAddress(this._ecdh.getPublicKey('buffer', 'uncompressed'));
  },
  getPrivateKey: function () {
    return this._privateKey;
  },
  getWIF: function (compressed) {
    return wif.encode(128, this._privateKey, compressed)
  }
};

module.exports = count => {
  const response = [];
  for (let i = 0; i < count; i++) {
    const privateKey = lib.generatePrivateKey();

    lib.setPrivateKey(privateKey);

    const address = lib.getAddressCompressed();
    const wif = lib.getWIF(true);

    response.push({
      address,
      wif,
    });
  }

  return response;
};
