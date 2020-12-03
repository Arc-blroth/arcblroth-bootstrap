const fs = require("fs")
const minify = require("@node-minify/core")
const gcc = require("@node-minify/terser")
const cleanCSS = require("@node-minify/clean-css")

try {
    if (fs.existsSync("build")) {
        fs.rmdirSync("build", { recursive: true })
    }
} catch (err) {
    console.warn(`Could not clear build folder.`)
}
fs.mkdirSync("build")

const cssFile = "arcblroth-bootstrap.css"
const jsFile = "arcblroth-bootstrap.js"
const throwIfErr = (e) => { if(e) { throw e } }
minify({
  compressor: cleanCSS,
  input: cssFile,
  output: "build/" + cssFile
}).then(s => {
    minify({
      compressor: gcc,
      input: jsFile,
      output: "build/" + jsFile,
    })
}).then(s => {
   fs.readFile("logo.png", "binary", (err0, logoData) => {
       throwIfErr(err0)
       fs.readFile("build/" + cssFile, "utf8", (err1, cssData) => {
           throwIfErr(err1)
           fs.readFile("build/" + jsFile, "utf8", (err2, jsData) => {
               throwIfErr(err2)
               jsData = jsData.replace(/!!!STYLE!!!/g, cssData)
                              .replace(/!!!LOGO!!!/g, Buffer.from(logoData, "binary").toString("base64"))
               fs.writeFile("build/" + jsFile, jsData, "utf8", throwIfErr)
           })
       })
   })
})