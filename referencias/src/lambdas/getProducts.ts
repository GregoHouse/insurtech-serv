import middy from '@middy/core';
import { ProductsApplication } from '../product/productsApplication';
import { middyConfig } from '../middlewares/middyConfig';

const appInstance = ProductsApplication.usingEnv();
const getProducts = appInstance.getProducts.bind(appInstance);

export const handler = middy(getProducts).use(middyConfig());
