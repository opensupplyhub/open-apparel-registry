module.exports = name => ({
  host: process.env.ES_HOST,
  port: process.env.ES_PORT,
  protocol: "https",
  auth: process.env.ES_AUTH,
  // hydrate: true,
  // hydrateWithESResults: true,
  // hydrateOptions: { lean: true },
  bulk: {
    size: 10, // preferred number of docs to bulk index
    delay: 100 //milliseconds to wait for enough docs to meet size constraint
  },
  index: `${name}_${process.env.NODE_ENV === 'production' ? 'prod' : 'dev'}`
})
