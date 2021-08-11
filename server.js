'use strict'

const Hapi = require('@hapi/hapi')
const Inert = require('@hapi/inert')
const config = require('./config')
const unoconvService = require('./index')
const server = new Hapi.Server({
	port: parseInt(config.SERVER_PORT, 10),
	host: 'localhost',
	routes: {
		cors: {
			credentials: true
		}
	}
})

module.exports.start = async function () {
    await server.register([unoconvService, Inert]);
	await server.start()
};
module.exports.stop = () => {
  server.stop(() => {
    console.log('Server stopped')
  })
}
