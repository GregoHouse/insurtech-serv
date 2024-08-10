import middy from '@middy/core';
import { ProductsApplication } from '../product/productsApplication';
import { middyConfig } from '../middlewares/middyConfig';

const appInstance = ProductsApplication.usingEnv();
const postProduct = appInstance.postProduct.bind(appInstance);

export const handler = middy(postProduct).use(middyConfig());
