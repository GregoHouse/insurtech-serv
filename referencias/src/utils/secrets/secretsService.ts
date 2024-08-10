import { logger } from '../logger/logHandler';
import { FsService } from '../fs/fs';

/**
 * @description Secrets service
 * @class SecretsService
 * @export
 * @example
 * import { SecretsService } from './secretsService';
 * const secretsService = SecretsService.getInstance();
 * const secret = secretsService.getSecret('PRUEBA_KEY');
 * console.log(secret);
 */
export class SecretsService {
  private static instance: SecretsService;
  private secrets: { [key: string]: string };
  static readonly FILE_SECRET_DEFAULT_VALUE = '/tmp/vault/secrets.json';
  static readonly FILE_STACK_SECRET_DEFAULT_VALUE =
    '/tmp/vault/secretsStack.json';
  static readonly FILE_ENCODING = 'utf-8';
  static readonly ERROR_READING_FILES_SECRETS =
    'Error reading or parsing secret files';
  /**
   * constructor
   * @param data key-value object with secrets
   */
  private constructor(data: { [key: string]: string }) {
    this.secrets = data;
  }

  /**
   * Static method to return Secrets instance
   * @returns {SecretsService} Secrets instance
   */
  public static withDefaults(): SecretsService {
    if (!SecretsService.instance) {
      let data: { [key: string]: string } = {};

      try {
        const secretData = FsService.readFileUTF8Sync(
          SecretsService.FILE_SECRET_DEFAULT_VALUE
        );
        data = { ...data, ...JSON.parse(secretData).data };

        const secretDataStack = FsService.readFileUTF8Sync(
          SecretsService.FILE_STACK_SECRET_DEFAULT_VALUE
        );
        data = { ...data, ...JSON.parse(secretDataStack).data };
      } catch (error) {
        logger.error({
          error: {
            error: SecretsService.ERROR_READING_FILES_SECRETS,
            message: (error as any)?.message,
            stack: (error as any)?.stack,
          },
        });
      }

      SecretsService.instance = new SecretsService(data);
    }

    return SecretsService.instance;
  }

  /**
   * Return secret value
   * @param key secret key
   * @returns {string} secret value
   */
  public getSecret(key: string): string | undefined {
    if (!this.secrets[key]) {
      throw new Error(`Secret ${key} not found`);
    }
    return this.secrets[key];
  }
}
