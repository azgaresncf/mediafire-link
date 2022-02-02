//thanks to @pepzwee for fixing the code!
const jsdom = require('jsdom')
const axios = require('axios')
const { JSDOM } = jsdom

// some mediafire links are instant downloads
// and that will potentially crash our JSDOM parsing or make node run out of memory
// so this function makes sure that the given link returns "text/html" content-type
async function checkLinkResponseType(link) {
  const { headers } = await axios.head(link)

  // content type is something other than html
  if (!headers?.['content-type']?.includes('text/html')) {
    throw new Error(`Expected "text/html" but received "${headers['content-type']}"`)
  }

  return
}

async function getLink(link) {
  const validLink = new RegExp(/^(http|https):\/\/(?:www\.)?(mediafire)\.com\/[0-9a-z]+(\/.*)/gm)

  if (!link.match(validLink)) throw new Error('Unknown link')

  try {
    // make sure we are going to be handling html before requesting data
    await checkLinkResponseType(link)

    const { data } = await axios.get(link)

    const dom = new JSDOM(data)
    const downloadButton = dom.window.document.querySelector('#downloadButton')

    if (!downloadButton) throw new Error('Could not find download button')

    return downloadButton.href
  } catch (err) {
    if (err.response) {
      if (err.response.status === 404) {
        throw new Error('The key you provided for file access was invalid.')
      }

      throw new Error(`Mediafire returned status ${err.response.status}`)
    }

    throw err
  }
}

module.exports = getLink