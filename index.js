'use strict'

const routes = require('./routes')

exports.plugin = {
    pkg: require('./package.json'),
	name: 'unoconvWebservice',
	version: '1.0.0',
    register: async function (server, options) {
        server.route(routes);
    }
};
