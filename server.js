'use strict'

const Hapi = require('@hapi/hapi')
const Inert = require('@hapi/inert')
const config = require('./config')
const unoconvService = require('./index')

console.log("Started tfk-api-unoconv with configuration: ")
for (var key in config) {
	console.log(`${key} -> ${config[key]}`)
}
const server = new Hapi.Server({
	port: parseInt(config.SERVER_PORT, 10),
	host: config.SERVER_HOST,
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
