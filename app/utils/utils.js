export default class Utils {
  static isSapling(addr: string): boolean {
    return addr.startsWith('zs') || addr.startsWith('ztestsapling');
  }

  static isSprout(addr: string): boolean {
    return addr.startsWith('zc');
  }

  static isZaddr(addr: string): boolean {
    return Utils.isSapling(addr) || Utils.isSprout(addr);
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
