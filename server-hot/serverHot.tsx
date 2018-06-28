import * as _ from 'lodash'
import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as path from 'path'
import * as serveIndex from 'serve-index'

import * as webpack from 'webpack'
import * as webpackDevMiddleware from 'webpack-dev-middleware'
import * as webpackHotMiddleware from 'webpack-hot-middleware'

import * as history from 'connect-history-api-fallback'
import * as proxy from 'http-proxy-middleware'
// import * as webpackConfig from './../webpack.config.js'

export interface IProxy {
  in: string
  out: string
}
export function createServer(options: {
  dirName: string
  publicDir?: string
  port?: number
  title?: string
  webpackConfig: any
  proxy?: IProxy[],
}) {
  _.defaults(options, {
    port: 3003,
    title: 'Hot 2',
    proxy: [],
  })
  process.title = `${options.port}:${options.title}`

  const app = express()

  // app.use(bodyParser.urlencoded({ extended: false }))
  // app.use(bodyParser.json())

  const compiler = webpack(options.webpackConfig)

  _.forEach(options.proxy, (c) => {
    console.log(`proxy ${c.in} to ${c.out}`)
    app.use(c.in, proxy({ target: c.out, changeOrigin: true }))
  })

  //let publicPath = path.join(options.dirName, '/public')

  if (options.publicDir) {
    console.log('/public is static', options.publicDir)
    app.use(
      '/public',
      express.static(options.publicDir),
      serveIndex(options.publicDir, { icons: true }),
    )
  }

  // app.get('/login-iframe', (req, res) => {
  //   res.send('Hello iframe!')
  // })

  let urlencodedParser = bodyParser.urlencoded({ extended: false })
  app.post('/login-iframe-check', urlencodedParser, (req, res) => {
    let { username, password } = req.body

    if (password !== 'password') {
      res.redirect('/login-iframe?error=wrong-password')
    } else {
      //res.send('Hola ' + username + '!')
      let key = '1234'
      res.redirect(
        `/login-iframe-success?username=${encodeURIComponent(
          username,
        )}&key=${encodeURIComponent(key)}`,
      )
    }
  })
  // // Pass-thru for all routing
  app.use(history({
    htmlAcceptHeaders: ['text/html'],
    disableDotRule: true,
  }))

  // Dev and hot middleware
  app.use(
    webpackDevMiddleware(compiler, {
      // webpack-dev-middleware options
      noInfo: true,
      logLevel: 'warn',
      publicPath: options.webpackConfig.output.publicPath,
      historyApiFallback: true,
    }),
  )

  app.use(webpackHotMiddleware(compiler))

  app.get('/', (req, res) => {
    res.send('Hello World!')
  })

  app.get('/ping', (req, res) => {
    res.send('pong')
  })

  app.listen(options.port, () => {
    console.log(
      `Hot server ${options.title} listening on port ${options.port}!`,
    )
  })
}
