import middy from '@middy/core';
import { ProductsApplication } from '../product/productsApplication';
import { middyConfig } from '../middlewares/middyConfig';

const appInstance = ProductsApplication.usingEnv();
const putProduct = appInstance.putProduct.bind(appInstance);

export const handler = middy(putProduct).use(middyConfig());
