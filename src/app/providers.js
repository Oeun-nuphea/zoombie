import router from '../router'
import { pinia } from '../stores'

export function registerProviders(app) {
  app.use(pinia)
  app.use(router)

  return app
}
