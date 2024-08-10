import fs from 'fs';

/**
 * @description Fs service is a wrapper for fs module
 * @class FsService
 * @export
 */
export class FsService {
  static readonly FILE_ENCODING = 'utf-8';

  /**
   * Read file using utf-8 encoding and return file content
   * @param key secret key
   * @param path
   * @returns {string} secret value
   */
  static readFileUTF8Sync(path) {
    return fs.readFileSync(path, FsService.FILE_ENCODING);
  }
}
