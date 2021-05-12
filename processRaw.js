const fs = require('fs')
const path = require('path')

const dataPath = path.join(__dirname, 'data')

const rawFile = path.join(dataPath, 'passengers2020Raw.json')
const metaFile = path.join(dataPath, 'stationsMeta.json')
const outputFile = path.join(dataPath, 'stations.json')

Promise.all([
  fs.promises.readFile(rawFile, 'utf8').then((response) => JSON.parse(response)),
  fs.promises.readFile(metaFile, 'utf8').then((response) => JSON.parse(response))
])
  .then(([raw, meta]) => {
    return raw.map((station) => {
      const { weekday, saturday, sunday } = station
      const weekTotal = (5 * weekday) + saturday + sunday
      const daysOpen = (5 * !!weekday) + !!saturday + !!sunday
      const perOpenDay = Math.round(weekTotal / daysOpen)
      const { nameClean, lat, lon } = meta.find((metaStation) => metaStation.name === station.name)

      return {
        nameClean,
        ...station,
        weekTotal,
        daysOpen,
        perOpenDay,
        lat: Math.round(lat * 1000000) / 1000000,
        lon: Math.round(lon * 1000000) / 1000000
      }
    })
  })
  .then((output) => {
    fs.promises.writeFile(outputFile, JSON.stringify(output, null, 2))
  })
