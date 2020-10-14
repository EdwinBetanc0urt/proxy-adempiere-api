import { StorefrontApiModule, registerExtensions } from '@storefront-api/lib/module'
import { StorefrontApiContext } from '@storefront-api/lib/module/types'
import { Router } from 'express';
import user from './api/user';
import img from './api/img'
import dictionary from './api/dictionary'
import data from './api/data'
import { version } from '../../../package.json';
import path from 'path'

export const ADempiereApi: StorefrontApiModule = new StorefrontApiModule({
  key: 'adempiere-api',
  initApi: ({ config, db, app }: StorefrontApiContext): void => {
    let api = Router();
    const Api = require('@adempiere/grpc-api')
    // console.log('Config: ', config)
    let service = new Api(config)
    service.initService()
    // mount the user resource
    api.use('/user', user({ config, db, service }));

    api.use('/img', img({ config, db, service }));
    api.use('/img/:width/:height/:action/:image', (req, res, next) => {
      console.log(req.params)
    });
    //  Dictionary
    api.use('/dictionary', dictionary({ config, db, service }));
    //  Business Data
    api.use('/data', data({ config, db, service }));
    // perhaps expose some API metadata at the root
    api.get('/', (req, res) => {
      res.json({ version });
    });

    registerExtensions({ app, config, db, registeredExtensions: config.get('modules.adempiereApi.registeredExtensions'), rootPath: path.join(__dirname, 'api', 'extensions') })

    // api router
    app.use('/adempiere-api', api);
  }

})
