
const express = require('express')
const logger = require('./util//logger')
// const http = require('http')
const argv = require('./util/argv')
const port = require('./util//port')
const frontEndSetup = require('./middlewares/frontendMiddleware')
const { resolve } = require('path')
const router = require('./api/router')
const expressServer = express()

const expressRouter = router()

expressServer.use('/api', expressRouter)

frontEndSetup(expressServer, {
	outputPath: resolve(process.cwd(), 'build'),
	publicPath: '/',
})

const customHost = argv.host || process.env.HOST
const host = customHost || null // Let http.Server use its default IPv6/4 host
const prettyHost = customHost || 'localhost'

expressServer.listen(port, host, (err) => {
	if (err) {
		return logger.error(err.message)
	}
	logger.appStarted(port, prettyHost)
})

