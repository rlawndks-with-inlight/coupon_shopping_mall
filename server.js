const express = require('express')
const next = require('next')
const vhost = require('vhost')

const port = process.env.PORT || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const mainServer = express()
  const homeServer = express()
  const memberServer = express()

  homeServer.get('/', (req, res) => {
    return app.render(req, res, '/home', req.query)
  })

  homeServer.get('/*', (req, res) => {
    return app.render(req, res, `/home${req.path}`, req.query)
  })

  homeServer.all('*', (req, res) => {
    return handle(req, res)
  })

  memberServer.get('/', (req, res) => {
    return app.render(req, res, '/member', req.query)
  })

  memberServer.get('/*', (req, res) => {
    return app.render(req, res, `/member${req.path}`, req.query)
  })

  memberServer.all('*', (req, res) => {
    return handle(req, res)
  })

  mainServer.use(vhost('localhost', homeServer))
  mainServer.use(vhost('lvh.me', memberServer))
  mainServer.use(vhost('www.lvh.me', memberServer))
  mainServer.listen(port, (err) => {
    if (err) throw err

    console.log(`> Ready on http://lvh.me:${port}`)
  })
})