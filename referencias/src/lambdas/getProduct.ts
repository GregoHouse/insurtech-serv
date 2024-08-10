import middy from '@middy/core';
import { ProductsApplication } from '../product/productsApplication';
import { middyConfig } from '../middlewares/middyConfig';

const appInstance = ProductsApplication.usingEnv();
const getProduct = appInstance.getProduct.bind(appInstance);

export const handler = middy(getProduct).use(middyConfig());
