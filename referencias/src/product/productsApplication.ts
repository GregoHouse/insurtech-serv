import { DynamoDbStoreRepository } from './repository/dynamoDbStoreRepository';
import { MetricService } from '../utils/metrics/metricService';
import type { IProductStore } from './entities/iProductStore';
import { Product } from './entities/product';
import type { ProductInfo } from './entities/product';
import {
  ValidationError,
  ExistingItemError,
  NotFoundError,
} from '../utils/errors/customErrors';
import { SecretsService } from '../utils/secrets/secretsService';

/**
 * class that manages the registration, cancellation and modification of the products entity
 */
export class ProductsApplication {
  readonly repository: IProductStore;
  readonly metrics: MetricService;
  readonly secretsService: SecretsService;

  /**
   * @description Create the Application instance that connect dynamo local or remote
   * depends on the env variable IS_OFFLINE
   * @returns {ProductsApplication}
   * or to AWS DynamoDB
   */
  static usingEnv() {
    if (process.env['IS_OFFLINE'] === 'true') {
      return ProductsApplication.offlineMode();
    } else {
      return ProductsApplication.onlineMode();
    }
  }

  /**
   * @description Create the Application instance connected to local DynamoDB
   * @returns {ProductsApplication} ProductsApplication instance using local DynamoDB
   */
  static offlineMode() {
    const dBOptions = {
      dbConfig: {
        region: 'localhost',
        endpoint: 'http://localhost:8000',
      },

      tableName: process.env['TABLE_NAME']!,
    };

    return new ProductsApplication(DynamoDbStoreRepository.using(dBOptions));
  }
  /**
   * @description Create the Application instance conected to AWS DynamoDB using env variables
   * @env REGION -> AWS region
   * @env TABLE_NAME -> DynamoDB table name
   * @returns {ProductsApplication}
   */
  static onlineMode() {
    const dBOptions = {
      dbConfig: {
        region: process.env['REGION'] || 'us-east-1',
      },
      tableName: process.env['TABLE_NAME']!,
    };
    return new ProductsApplication(DynamoDbStoreRepository.using(dBOptions));
  }

  /**
   * @description Constructor of the Application
   * @param {IProductStore} aRepository - Repository to connect to database that implement IProductStore interface
   * @param aSecretService
   * @param {MetricService} aMetricService - MetricService to count metrics optional. If not provided will use default
   * @returns {ProductsApplication}
   */
  constructor(
    aRepository: IProductStore,
    aMetricService?: MetricService,
    aSecretService?: SecretsService
  ) {
    this.repository = aRepository;
    this.metrics = aMetricService || MetricService.withDefaults();
    this.secretsService = aSecretService || SecretsService.withDefaults();
  }

  /**
   * @description Get all products from database
   * @param {any} _event - Event from lambda
   * @param {any} context - Context from lambda
   * @returns {any} - Response from lambda
   */
  public async getProducts(_event, context) {
    let productsInfo: ProductInfo[] = [];
    const products = await this.repository.getProducts();

    if (!products.length) {
      context.logger.warn(context, 'No Items found');
    } else {
      productsInfo = products.map((product) => product.toObject());
      context.logger.info(
        { productsInfo, ...context },
        'Products retrieved => '
      );
    }

    this.metrics.countGetProducts();

    const response = {
      statusCode: 200,
      body: JSON.stringify(productsInfo),
    };

    return response;
  }

  /**
   * @description Get a product when id is provided inside path
   * @param {any} _event - Event from lambda
   * @param event
   * @param {any} context - Context from lambda
   * @returns {any} - Response from lambda
   */
  public async getProduct(event, context) {
    const id = event?.pathParameters?.id;

    this.validateProductId(id, context);

    const product = await this.repository.getProductById(id);

    if (!product) {
      context.logger.warn(context, `No item with ID ${id} found`);
      throw new NotFoundError(`No item with ID ${id} found`);
    }

    context.logger.info(
      { ...context, product },
      `Product retrieved with ID ${id}`
    );
    this.metrics.countGetSingleProduct(id);
    return {
      statusCode: 200,
      body: JSON.stringify(product.toObject()),
    };
  }

  /**
   * @description Update a product when id match in DB and body is a valid product
   * @param {any} _event - Event from lambda
   * @param event
   * @param {any} context - Context from lambda
   * @returns {any} - Response from lambda
   */
  public async putProduct(event, context) {
    const productInfo = JSON.parse(event.body)?.product;

    this.validateProductInfo(productInfo, context);

    const product = this.createProduct(productInfo);
    const response = await this.repository.putProduct(product);

    if (!response) {
      context.logger.warn(context, 'Product not updated');
      throw new NotFoundError(
        `Product not updated, No item with ID ${productInfo.id} found`
      );
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Product updated',
        new_product: response,
      }),
    };
  }
  /**
   * @description Create a new product when does not exist a product with same id and
   * body is a valid product
   * @param {any} _event - Event from lambda
   * @param event
   * @param {any} context - Context from lambda
   * @returns {any} - Response from lambda
   */
  public async postProduct(event, context) {
    const productInfo = JSON.parse(event.body)?.product;
    this.validateProductInfo(productInfo, context);
    const product = this.createProduct(productInfo);

    const response = await this.repository.postProduct(product);

    if (!response) {
      context.logger.warn(context, 'Product not created');
      throw new ExistingItemError(
        `Product with id: ${productInfo.id} already exist`
      );
    }

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Product created',
        product: response,
      }),
    };
  }
  /**
   * @description Delete a product when id match in DB
   * @param {any} _event - Event from lambda
   * @param event
   * @param {any} context - Context from lambda
   * @returns {any} - Response from lambda
   */
  public async deleteProduct(event, context) {
    const id = event?.pathParameters?.id;

    this.validateProductId(id, context);

    const response = await this.repository.deleteProduct(id);

    if (!response) {
      context.logger.warn(context, `No item with ID ${id} found`);
      throw new NotFoundError(`No item with ID ${id} found`);
    }
    context.logger.info(context, `Product deleted with ID ${id}`);
    this.metrics.countDeleteProduct(id);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `product id ${id} deleted`,
        ['deleted product']: response,
      }),
    };
  }

  /**
   * @description Create a new product from  object
   * @param {ProductInfo} info - ProductInfo object
   * @returns {Product} - Product instance
   */
  public createProduct(info: ProductInfo) {
    const product = new Product(info.id, info.name, info.price);
    return product;
  }

  /**
   * @description Validate if productInfo is a valid ProductInfo object and throw a
   * ValidationError if not
   * @param {ProductInfo} info - ProductInfo object
   * @param {any} context Lambda Context
   */
  public validateProductInfo(info: ProductInfo, context) {
    if (!info || !info.id || !info.name || !info.price) {
      context.logger.warn(context, 'Missing info on body');
      throw new ValidationError('Missing info on body');
    }
  }

  /**
   * Verify that the product id is valid
   * @param {string} id Product id
   * @param {any} context Lambda context
   */
  public validateProductId(id, context) {
    if (!id) {
      context.logger.warn(context, "Missing 'id' parameter in path");
      throw new ValidationError("Missing 'id' parameter in path");
    }
  }
}
