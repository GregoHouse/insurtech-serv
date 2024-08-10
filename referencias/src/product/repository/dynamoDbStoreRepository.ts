import type { IProductStore } from '../entities/iProductStore';
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import type { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { tracer } from '../../utils/tracer/traceHandler';
import {
  ScanCommand,
  PutCommand,
  GetCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { Product } from '../entities/product';
import DynamoDbDocClient from '../../utils/dynamo/dynamoDbDocClient';

interface IUsingOptions {
  dbConfig: DynamoDBClientConfig;
  tableName: string;
}
/**
 * @description DynamoDbStoreRepository implements IProductStore interface
 * @link   This implementation is based on V3 of the AWS SDK for JavaScript for DynamoDbDocument
 * https://docs.aws.amazon.com/es_es/sdk-for-javascript/v3/developer-guide/dynamodb-example-dynamodb-utilities.html *
 */
export class DynamoDbStoreRepository implements IProductStore {
  readonly client: DynamoDBDocument;
  readonly tableName: string;

  /**
   * @description Create the repository using the options
   * @param {IUsingOptions} options  - tableName and DynamoDBClientConfig
   * @returns {DynamoDbStoreRepository} - DynamoDbStoreRepository instance
   */
  static using(options: IUsingOptions) {
    const dynamoDBClient = DynamoDbDocClient.getInstance(options.dbConfig);
    const tableName: string = options.tableName;

    const repository = new DynamoDbStoreRepository(
      tableName,

      dynamoDBClient
    );
    tracer.captureAWSv3Client(repository.client);

    return repository;
  }

  /**
   * @description constructor for DynamoDbStoreRepository
   * @param {string} tableName  - tableName
   * @param aTableName
   * @param {DynamoDBDocument} aDynamoDBClient  - DynamoDBDocument instance
   * @returns {DynamoDbStoreRepository} - DynamoDbStoreRepository instance
   */
  constructor(
    aTableName: string,

    aDynamoDBClient: DynamoDBDocument
  ) {
    this.tableName = aTableName;
    this.client = aDynamoDBClient;
  }

  /**
   * @descroption Map a Product to DynamoDB Item using single table design
   * @param {Product} product - Product to be mapped
   * @returns dynamoItem - DynamoDB Item
   */
  mapToDynamo(product: Product) {
    const item = product.toObject();
    const dynamoItem = {
      ...item,
      PK: `PRODUCT#${item.id}`,
      SK: `PRODUCT#${item.id}`,
    };
    return dynamoItem;
  }
  /**
   * @descroption Map a DynamoDB Item to Product using single table design
   * @param {any} Item - DynamoDB Item
   * @returns {Product} - Product entity
   */
  mapFromDynamo(Item): Product {
    return new Product(Item.id, Item.name, Item.price);
  }

  /**
   * @descroption Get all products from DynamoDB
   * @returns {Product[]} - Product instance array
   */
  async getProducts() {
    const params = new ScanCommand({
      TableName: this.tableName,
      Limit: 100,
    });

    const { Items } = await this.client.send(params);

    if (!Items || Items.length === 0) return [];

    const products: Product[] = Items.map((item) => {
      return this.mapFromDynamo(item);
    });
    return products;
  }

  /**
   * @descroption Get one product that match with id from DynamoDB
   * @param {string} id - Product id
   * @returns {Product} - Product instance or null in case Db  error
   */
  async getProductById(id: string): Promise<Product | null> {
    const params = new GetCommand({
      TableName: this.tableName,
      Key: {
        PK: `PRODUCT#${id}`,
        SK: `PRODUCT#${id}`,
      },
    });
    try {
      const { Item } = await this.client.send(params);
      if (!Item) return null;
      const product = this.mapFromDynamo(Item);
      return product;
    } catch (error) {
      return null;
    }
  }

  /**
   * @description Update a product in DynamoDB only if already exists
   * @param {Product} product - Product to be put
   * @returns {Product} - Product instance or null in case Db  error
   */
  async putProduct(product: Product): Promise<Product | null> {
    const Item = this.mapToDynamo(product);
    const params = new PutCommand({
      TableName: this.tableName,
      Item,
      ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)',
    });

    try {
      await this.client.send(params);
      return product;
    } catch (error) {
      return null;
    }
  }

  /**
   * @description Create a product in DynamoDB only if not exists
   * @param {Product} product - Product to be post
   * @returns {Product} - Product instance or null in case Db  error
   */
  async postProduct(product: Product): Promise<Product | null> {
    const Item = this.mapToDynamo(product);
    const params = new PutCommand({
      TableName: this.tableName,
      Item,
      ConditionExpression:
        'attribute_not_exists(PK) AND attribute_not_exists(SK)',
    });

    try {
      await this.client.send(params);
      return product;
    } catch (error) {
      return null;
    }
  }

  /**
   * @description Delete a product in DynamoDB only if already exists
   * @param {string} id - Product id
   * @returns {Product} - Product instance or null in case Db  error
   */
  async deleteProduct(id: string) {
    if (!id) return null;
    const params = new DeleteCommand({
      TableName: this.tableName,
      Key: {
        PK: `PRODUCT#${id}`,
        SK: `PRODUCT#${id}`,
      },
      ReturnValues: 'ALL_OLD',
    });

    try {
      const response = await this.client.send(params);
      if (!response.Attributes) return null;
      const product = new Product(
        response.Attributes['id'],
        response.Attributes['name'],
        response.Attributes['price']
      );
      return product;
    } catch (error) {
      return null;
    }
  }
}
