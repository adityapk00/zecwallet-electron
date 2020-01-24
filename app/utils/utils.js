/* eslint-disable no-plusplus */
export const NO_CONNECTION: string = 'Could not connect to zcashd';

export default class Utils {
  static isSapling(addr: string): boolean {
    if (!addr) return false;
    return addr.startsWith('zs') || addr.startsWith('ztestsapling');
  }

  static isSprout(addr: string): boolean {
    if (!addr) return false;
    return addr.startsWith('zc');
  }

  static isZaddr(addr: string): boolean {
    if (!addr) return false;
    return Utils.isSapling(addr) || Utils.isSprout(addr);
  }

  static isTransparent(addr: string): boolean {
    if (!addr) return false;
    return addr.startsWith('t');
  }

  // Convert to max 8 decimal places, and remove trailing zeros
  static maxPrecision(v: number): number {
    if (!v) return v;

    if (typeof v === 'string' || v instanceof String) {
      // eslint-disable-next-line no-param-reassign
      v = parseFloat(v);
    }

    return parseFloat(v.toFixed(8));
  }

  static splitZecAmountIntoBigSmall(zecValue: number) {
    if (!zecValue) {
      return { bigPart: zecValue, smallPart: '' };
    }

    let bigPart = Utils.maxPrecision(zecValue).toString();
    let smallPart = '';

    if (bigPart.indexOf('.') >= 0) {
      const decimalPart = bigPart.substr(bigPart.indexOf('.') + 1);
      if (decimalPart.length > 4) {
        smallPart = decimalPart.substr(4);
        bigPart = bigPart.substr(0, bigPart.length - smallPart.length);

        // Pad the small part with trailing 0s
        while (smallPart.length < 4) {
          smallPart += '0';
        }
      }
    }

    return { bigPart, smallPart };
  }

  static splitStringIntoChunks(s: string, numChunks: number) {
    if (numChunks > s.length) return [s];
    if (s.length < 16) return [s];

    const chunkSize = Math.round(s.length / numChunks);
    const chunks = [];
    for (let i = 0; i < numChunks - 1; i++) {
      chunks.push(s.substr(i * chunkSize, chunkSize));
    }
    // Last chunk might contain un-even length
    chunks.push(s.substr((numChunks - 1) * chunkSize));

    return chunks;
  }

  static nextToAddrID: number = 0;

  static getNextToAddrID(): number {
    // eslint-disable-next-line no-plusplus
    return Utils.nextToAddrID++;
  }
}
