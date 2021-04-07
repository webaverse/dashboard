import {toBuffer, fromRpcSig, ecrecover, keccak256, pubToAddress, bufferToHex} from 'ethereumjs-util';
const Buffer = toBuffer('0x0').constructor;

export function parseQuery(queryString) {
  var query = {};
  var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split('=');
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  return query;
}

export function makePromise() {
  let accept, reject;
  const p = new Promise((a, r) => {
    accept = a;
    reject = r;
  });
  p.accept = accept;
  p.reject = reject;
  return p;
}

export function jsonParse(s) {
  try {
    return JSON.parse(s);
  } catch (err) {
    return null;
  }
}

export function uniquify(a, pred = (a, b) => a === b) {
  return a.filter((e, i) => {
    for (let j = 0; j < i; j++) {
      if (pred(a[j], e)) {
        return false;
      }
    }
    return true;
  });
}

export function getAddressProofs(profile) {
  let addressProofs = jsonParse((profile && profile.addressProofs) || '');
  if (!Array.isArray(addressProofs)) {
    addressProofs = [];
  }
  return addressProofs;
}

export async function getAddressesFromProofs(adressProofs, web3, proofOfAddressMessage) {
  return await Promise.all(adressProofs.map(async signature => {
    // console.log('got sig 1', signature);
    
    try {
      const {v, r, s} = fromRpcSig(signature);
      const b = toBuffer(web3.mainnetsidechain.utils.sha3('\x19Ethereum Signed Message:\n' + proofOfAddressMessage.length + proofOfAddressMessage));
      // console.log('got sig 2', {v, r, s}, [b, v, r, s]);
      const pubKey = ecrecover(b, v, r, s);
      // console.log('got sig 3', pubKey);
      const address = bufferToHex(pubToAddress(pubKey));
      // console.log('got sig 4', address);
      return address;
    } catch(err) {
      console.warn(err);
    }
  }));
}

export function formatError(err) {
  return err instanceof Error ? (err + '') : err.message ? err.message : JSON.stringify(err);
}