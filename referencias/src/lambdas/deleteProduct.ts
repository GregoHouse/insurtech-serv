import middy from '@middy/core';
import { ProductsApplication } from '../product/productsApplication';
import { middyConfig } from '../middlewares/middyConfig';

const appInstance = ProductsApplication.usingEnv();
const deleteProduct = appInstance.deleteProduct.bind(appInstance);

export const handler = middy(deleteProduct).use(middyConfig());
