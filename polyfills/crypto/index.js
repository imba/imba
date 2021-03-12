import randomBytes from './esm/lib/randombytes';
// export  from './esm/lib/randombytes';
// TODO exports.randomBytes = exports.rng = exports.pseudoRandomBytes = exports.prng = require('randombytes')

export {
  randomBytes,
  randomBytes as rng,
  randomBytes as pseudoRandomBytes,
  randomBytes as prng
};

// import {createHash} from  './esm/lib/create-hash';
// export default {createHash,Hash:createHash};
export {default as createHash} from './esm/lib/create-hash';
export {default as createHmac} from './esm/lib/create-hmac';
// exports.createHash = exports.Hash = require('create-hash')
// exports.createHmac = exports.Hmac = require('create-hmac')

import algos from './esm/lib/browserify-sign/algorithms.json'
var hashes = ['sha1', 'sha224', 'sha256', 'sha384', 'sha512', 'md5', 'rmd160'].concat(Object.keys(algos));

export function getHashes() {
  return hashes
}

export * from './esm/lib/pbkdf2'
// exports.pbkdf2 = p.pbkdf2
// exports.pbkdf2Sync = p.pbkdf2Sync

export * from './esm/lib/browserify-cipher'
/*var aes = require('browserify-cipher')
exports.Cipher = aes.Cipher
exports.createCipher = aes.createCipher
exports.Cipheriv = aes.Cipheriv
exports.createCipheriv = aes.createCipheriv
exports.Decipher = aes.Decipher
exports.createDecipher = aes.createDecipher
exports.Decipheriv = aes.Decipheriv
exports.createDecipheriv = aes.createDecipheriv
exports.getCiphers = aes.getCiphers
exports.listCiphers = aes.listCiphers*/
export * from './esm/lib/diffie-hellman'
/* var dh = require('diffie-hellman')

exports.DiffieHellmanGroup = dh.DiffieHellmanGroup
exports.createDiffieHellmanGroup = dh.createDiffieHellmanGroup
exports.getDiffieHellman = dh.getDiffieHellman
exports.createDiffieHellman = dh.createDiffieHellman
exports.DiffieHellman = dh.DiffieHellman */

export * from './esm/lib/browserify-sign'
/* var sign = require('browserify-sign')

exports.createSign = sign.createSign
exports.Sign = sign.Sign
exports.createVerify = sign.createVerify
exports.Verify = sign.Verify */

export * from './esm/lib/create-ecdh'
// exports.createECDH = require('create-ecdh')

export * from './esm/lib/public-encrypt'
/* var publicEncrypt = require('public-encrypt')

exports.publicEncrypt = publicEncrypt.publicEncrypt
exports.privateEncrypt = publicEncrypt.privateEncrypt
exports.publicDecrypt = publicEncrypt.publicDecrypt
exports.privateDecrypt = publicEncrypt.privateDecrypt */

// the least I can do is make error messages for the rest of the node.js/crypto api.
// ;[
//   'createCredentials'
// ].forEach(function (name) {
//   exports[name] = function () {
//     throw new Error([
//       'sorry, ' + name + ' is not implemented yet',
//       'we accept pull requests',
//       'https://github.com/crypto-browserify/crypto-browserify'
//     ].join('\n'))
//   }
// })

export * from './esm/lib/randomfill'
/* var rf = require('randomfill')

exports.randomFill = rf.randomFill
exports.randomFillSync = rf.randomFillSync */

export function createCredentials() {
  throw new Error([
    'sorry, createCredentials is not implemented yet',
    'we accept pull requests',
    'https://github.com/crypto-browserify/crypto-browserify'
  ].join('\n'))
}

export const constants = {
  'DH_CHECK_P_NOT_SAFE_PRIME': 2,
  'DH_CHECK_P_NOT_PRIME': 1,
  'DH_UNABLE_TO_CHECK_GENERATOR': 4,
  'DH_NOT_SUITABLE_GENERATOR': 8,
  'NPN_ENABLED': 1,
  'ALPN_ENABLED': 1,
  'RSA_PKCS1_PADDING': 1,
  'RSA_SSLV23_PADDING': 2,
  'RSA_NO_PADDING': 3,
  'RSA_PKCS1_OAEP_PADDING': 4,
  'RSA_X931_PADDING': 5,
  'RSA_PKCS1_PSS_PADDING': 6,
  'POINT_CONVERSION_COMPRESSED': 2,
  'POINT_CONVERSION_UNCOMPRESSED': 4,
  'POINT_CONVERSION_HYBRID': 6
}
