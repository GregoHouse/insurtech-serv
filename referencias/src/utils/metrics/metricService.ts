import { Metrics, MetricUnits } from '@aws-lambda-powertools/metrics';

/**
 * Class to manage the metrics for the application
 */
export class MetricService {
  private metrics: Metrics;
  private static instance: MetricService;

  /**
   * Return MetricService with default params
   *
   * @returns {MetricService} - MetricService with default params
   */
  public static withDefaults(): MetricService {
    if (!MetricService.instance) {
      const metricInstance = new Metrics({
        namespace: 'checkout-config-api', // es el namespace
        serviceName: 'default-crud-template-example', // es el service (es posible agregar mas dimensiones para segmentar)
      });

      MetricService.instance = new MetricService(metricInstance);
    }

    return MetricService.instance;
  }

  /**
   *
   * @param {Metrics} aMetrics - Metrics instance
   */
  constructor(aMetrics: Metrics) {
    this.metrics = aMetrics;
  }

  /**
   * Return Metrics instance
   *
   * @returns {Metrics} - Metrics instance
   */
  getMetricsInstance(): Metrics {
    return this.metrics;
  }

  /**
   * Increment Metric getProducts
   */
  countGetProducts() {
    this.metrics.addMetric('getProducts', MetricUnits.Count, 1);
  }

  /**
   * Increment Metric getProduct
   *
   * @param {string} id Product Id
   */
  countGetSingleProduct(id: string) {
    this.metrics.addMetric('getProduct', MetricUnits.Count, 1);
    this.metrics.addMetadata('productId', id);
  }

  /**
   * Increment Metric createProduct
   *
   * @param {string} id Product Id
   */
  countCreateProduct(id: string) {
    this.metrics.addMetric('createProduct', MetricUnits.Count, 1);
    this.metrics.addMetadata('productId', id);
  }

  /**
   * Increment Metric updateProduct
   */
  countUpdateProduct() {
    this.metrics.addMetric('updateProduct', MetricUnits.Count, 1);
  }

  /**
   * Increment Metric productDeleted
   *
   * @param {string} id Product Id
   */
  countDeleteProduct(id: string) {
    this.metrics.addMetric('productDeleted', MetricUnits.Count, 1);
    this.metrics.addMetadata('productId', id);
  }
}
