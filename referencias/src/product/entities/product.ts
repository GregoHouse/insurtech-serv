export type ProductInfo = {
  id: string;
  name: string;
  price: number;
};

/**
 * Product entity
 */
export class Product {
  private readonly id: string;
  private readonly name: string;
  private readonly price: number;

  /**
   * construct for the product entity
   *
   * @param id Id product
   * @param name Name product
   * @param price Price procut
   */
  constructor(id: string, name: string, price: number) {
    if (!id || !name || !price || price <= 0)
      throw new Error('Invalid product info');
    this.id = id;
    this.name = name;
    this.price = price;
  }

  /**
   * @description Transform Product to ProductInfo object.
   * @returns {ProductInfo} - ProductInfo object.
   */
  toObject(): ProductInfo {
    return {
      id: this.id,
      name: this.name,
      price: this.price,
    };
  }
}
