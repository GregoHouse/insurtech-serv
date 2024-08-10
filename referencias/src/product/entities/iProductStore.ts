import type { Product } from '../entities/product';

interface IProductStore {
  getProducts: () => Promise<Product[] | []>;
  putProduct: (product: Product) => Promise<Product | null>;
  postProduct: (product: Product) => Promise<Product | null>;
  getProductById(id: string): Promise<Product | null>;
  deleteProduct(id: string): Promise<Product | null>;
}

export { IProductStore };
