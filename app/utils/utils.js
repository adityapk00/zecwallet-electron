export default class Utils {
  static isSapling(addr: string): boolean {
    return addr.startsWith('zs') || addr.startsWith('ztestsapling');
  }

  static isTransparent(addr: string): boolean {
    return addr.startsWith('t');
  }

  static nextToAddrID: number = 0;

  static getNextToAddrID(): number {
    // eslint-disable-next-line no-plusplus
    return Utils.nextToAddrID++;
  }
}
