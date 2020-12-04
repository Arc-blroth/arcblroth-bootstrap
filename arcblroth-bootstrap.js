"use strict"

/**
 * arcblroth-bootstrap.js
 *
 * A tiny but powerful script to load dependencies.
 * Intended for use in Arc'blroth's projects. Code
 * is licensed under MIT, logo is (c) Arc'blroth.
 *
 * @param {object} args - an object that maps the type of
 * a resource to an array of that resource. Resources
 * are loaded by their function in the "loaders" object,
 * with defaults for scripts and stylesheets.
 */
export function load(args) {
    
    function buildElement(type, classList = []) {
        let ele = document.createElement(type)
        if(classList.length > 0) {
            classList.forEach(clazz => {
               ele.classList.add(clazz) 
            })
        }
        return ele
    }
    
    function buildDiv(classList = []) {
        return buildElement("div", classList)
    }
    
    class ProgressBar {
        constructor() {
            this.track = buildDiv(["ui", "progressBar"])
            this.bar = buildDiv()
            document.body.append(this.track)
            this.track.append(this.bar)
            this.progress = 0
        }
        
        getProgress() {
            return this.progress
        }
        
        setProgress(progress) {
            this.progress = progress
            this.bar.style.width = (progress * 100) + "%"
        }
        
        remove() {
            this.track.removeChild(this.bar)
            this.track.parentElement.removeChild(this.track)
        }
    }
    
    function loadStylesheet(styleSrc) {
        return new Promise((resolve, reject) => {
            let styleTag = buildElement("link")
            let whenLoaded = () => {
                resolve(styleSrc)
            }
            styleTag.onload = whenLoaded
            styleTag.onreadystatechange = whenLoaded
            styleTag.onerror = () => {
                reject(styleSrc)
            }
            styleTag.rel = "stylesheet"
            styleTag.href = styleSrc
            document.head.append(styleTag)
        })
    }
    
    function loadScript(scriptSrc) {
        return new Promise((resolve, reject) => {
            let module = typeof scriptSrc == "object" && scriptSrc.module;
            scriptSrc = typeof scriptSrc == "string" ? scriptSrc : scriptSrc.src;
            let scriptTag = buildElement("script")
            let whenLoaded = () => {
                resolve(scriptSrc)
            }
            scriptTag.onload = whenLoaded
            scriptTag.onreadystatechange = whenLoaded
            scriptTag.onerror = () => {
                reject(scriptSrc)
            }
            scriptTag.src = scriptSrc
            document.body.append(scriptTag)
        })
    }
    
    function htmlToElement(html) {
        let template = document.createElement("template")
        html = html.trim()
        template.innerHTML = html
        return template.content.firstChild
    }
    
    function log(s) {
        console.log("[arcblroth-bootstrap.js]", s)
    }
    
    function err(s) {
        console.error("[arcblroth-bootstrap.js]", s)
    }
    
    (async function() {
        let styleEle = buildElement("style")
        document.body.append(styleEle)
        styleEle.innerText = "!!!STYLE!!!"
        
        let loadScreenBg = buildDiv(["ui", "loadScreenBg"])
        document.body.append(loadScreenBg)
        
        // Decode 
        let logo = buildElement("img", ["ui", "logo"])
        logo.src = "data:image/png;base64,!!!LOGO!!!"
        document.body.append(logo)
        
        // 20% stylesheets | 30% scripts | 50% assets
        let progressBar = new ProgressBar()
        progressBar.setProgress(0)
        
        function onError(res, error) {
            let errorMsg = `Failed to load ${res}, please reload and try again.`
            err(`Could not load all ${res}:`)
            err(error)
            progressBar.bar.style.backgroundColor = "#ff4a4a"
            // give the UI some time to render
            progressBar.bar.ontransitionend = () => {
                alert(errorMsg)
            }
            let posTxt = document.getElementById("pos")
            posTxt.innerHTML = errorMsg
            posTxt.classList.add("loadFail")
        }
        
        let onload = () => {}
        if(args.onload) {
            onload = args.onload
            delete args.onload
        }
        let loaders = []
        if(args.loaders) {
            loaders = args.loaders
            delete args.loaders
        }
        if(!loaders["scripts"]) loaders["scripts"] = loadScript
        if(!loaders["stylesheets"]) loaders["stylesheets"] = loadStylesheet
        
        let types = Object.keys(args)
        let typesLoaded = 0
        
        for(let i = 0; i < types.length; i++) {
            let type = types[i]
            try {
                let resourcesLoaded = 0
                await Promise.all(requiredStylesheets.map(s => loadStylesheet(s).then(p => {
                    progressBar.setProgress(++stylesheetsDone / (requiredStylesheets.length) * (1 / types) + typesLoaded / types)
                })))
            } catch(e) {
                onError(type, e)
                throw e
            }
            log(`Loaded all ${type}!`)
            typesLoaded++
        }
        
        progressBar.track.ontransitionend = () => {
            logoCanvas.style.opacity = "0%"
            loadScreenBg.style.opacity = "0%"
            progressBar.track.style.opacity = "0%"
            setTimeout(() => {
                window.removeEventListener("resize", onResizeHandler)
                logoCanvas.parentElement.removeChild(logoCanvas)
                progressBar.remove()
                loadScreenBg.parentElement.removeChild(loadScreenBg)
                styleEle.parentElement.removeChild(styleEle)
                onload()
            }, 1000)
            progressBar.track.ontransitionend = () => {}
        }
    })()
}