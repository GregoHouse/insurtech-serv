import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import type { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

/**
 * Wrapper to use DynamoDBClient
 */
class DynamoDbDocClient {
  private static instance: DynamoDBDocument;
  private static translateConfig = {
    marshallOptions: {
      convertEmptyValues: false,
      removeUndefinedValues: false,
      convertClassInstanceToMap: true,
    },
    unmarshallOptions: {
      wrapNumbers: false,
    },
  };

  /**
   * Singleton method to get a DynamoDBDocument instance
   *
   * @param {DynamoDBClientConfig} config - dynamoDB client config
   * @returns {DynamoDBDocument} DynamoDBDocument instance
   */
  public static getInstance(config: DynamoDBClientConfig): DynamoDBDocument {
    if (DynamoDbDocClient.instance != null) return DynamoDbDocClient.instance;

    const client: DynamoDBClient = new DynamoDBClient(config);

    DynamoDbDocClient.instance = DynamoDBDocument.from(
      client,
      DynamoDbDocClient.translateConfig
    );

    return DynamoDbDocClient.instance;
  }
}

export default DynamoDbDocClient;
