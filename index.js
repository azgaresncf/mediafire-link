const jsdom = require("jsdom");
const fetch = require('node-fetch');
const {
    JSDOM
} = jsdom;

function getLink(link) {
    const link_reg = new RegExp(/^(http|https):\/\/(?:www\.)?(mediafire)\.com\/[0-9a-z]+(\/.*)/gm)
    if (link.match(link_reg)) {
        return new Promise((resolve) => {
            fetch(link)
                .then(res => res.text())
                .then(body => {
                    const dom = new JSDOM(body);
                    resolve(dom.window.document.querySelector("#downloadButton").href)
                })
        })
    } else {
        throw new Error("Unknown link.")
    }
}
module.exports = getLink;