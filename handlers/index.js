'use strict'

const fs = require('fs')
const { v4: uuid } = require('uuid')
const unoconv = require('awesome-unoconv');
const formats = require('../lib/data/formats.json')
const pkg = require('../package.json')

function convertFile(inputFile, format) {
  return new Promise((resolve, reject) => {
	console.log(`converting file ${inputFile} to format ${format}...`)
    unoconv
      .convert(inputFile, { buffer: true, format: 'pdf' })  // or format: 'html'
      .then(buffer => {
        console.log('finished converting')
        resolve(buffer.toString())
      })
      .catch(err => {
        console.error(`[error] failed to convert file ${inputFile} to format ${format}: ${err}`)
        fs.unlink(inputFile, error => {
          if (error) {
            console.error(error)
          } else {
            console.log(`${inputFile} deleted`)
          }
        })
        reject(err)
      })
  })
}

module.exports.handleUpload = function (request, h) {
  const convertToFormat = request.params.format
  const data = request.payload
  console.log(`Handling Upload of file ${data.file}`)
  if (data.file) {
    const nameArray = data.file.hapi.filename.split('.')
    const fileEndingOriginal = nameArray.pop()
    const temporaryName = uuid()
    const uploadsDirectory = process.cwd() + '/uploads'
    if (!fs.existsSync(uploadsDirectory)) {
      fs.mkdirSync(uploadsDirectory)
      console.log(`created uploads directory at : ${uploadsDirectory}`)
    }
    const pathPre = uploadsDirectory + '/' + temporaryName
    const fileNameTempOriginal = pathPre + '.' + fileEndingOriginal
    const file = fs.createWriteStream(fileNameTempOriginal)

    file.on('error', (error) => {
      console.error(`[error] file error: ${error}`)
    })

    data.file.pipe(file)

    return new Promise((resolve, reject) => {
        data.file.on('end', (err) => {
          if (err) {
            console.error(`[error] file on end error ${data.file}: ${err}`)
            reject(err)
          } else {
            convertFile(fileNameTempOriginal, convertToFormat)
              .then(result => resolve(h.response(result)))
              .catch(error => {
                reject(error)
              })
          }
        })
    })
  } else {
      console.error(`[error] file payload isn't valid ${data.file}`)
      return h.response().code(415)
  }
}

module.exports.showFormats = function showFormats(request, h) {
  return h.response(formats)
}

module.exports.showFormat = function showFormat(request, h) {
  const params = request.params
  const format = params ? formats[request.params.type] : false
  if (!format) {
    return h.response('Format type not found').code(404)
  } else {
    return h.response(format)
  }
}

module.exports.showVersions = function showVersions(request, h) {
  const versions = {}
  Object.keys(pkg.dependencies).forEach((item) => {
    versions[item] = pkg.dependencies[item]
  })
  return h.response(versions)
}

module.exports.healthcheck = (request, h) => {
  return h.response({ uptime: process.uptime() })
}
