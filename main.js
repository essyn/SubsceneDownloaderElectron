const { app, BrowserWindow, ipcMain,shell, Notification } = require("electron");
const path = require("path");
const os = require('os');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const unzipper = require('unzipper');
let mainWindow;
const loadMainWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile(path.join(__dirname, "index.html"));

}
app.on("ready", loadMainWindow);
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        loadMainWindow();
    }
});
ipcMain.on("deneme", (err, data) => {
    let filepath = path.join(app.getPath("downloads"), "subtitles");
    data.items.forEach(item => {
        DownloadFile(item);

    })
    shell.openPath(filepath)



})

function SaveFile(url, folderName) {
    axios({
        method: 'get',
        url: "https://subscene.com" + url,
        responseType: 'stream'
    })
        .then(response => {

            let filepath = path.join(app.getPath("downloads"), "subtitles");
            let a=fs.existsSync(filepath);
            if(!a){
                fs.mkdirSync(filepath);
            }
            let z=fs.existsSync(path.join(filepath,folderName));
            if(!z){
                fs.mkdirSync(path.join(filepath,folderName))
            }

            let filename = response.headers["content-disposition"].split("filename=")[1]
            

             const writer=fs.createWriteStream(path.join(filepath,folderName, filename));
             response.data.pipe(writer);
             
             writer.on('finish',()=>{
                // fs.createReadStream(path.join(filepath,folderName,filename))
                // .pipe(unzipper.Extract({path:path.join(filepath,folderName)}))


                mainWindow.webContents.send("complete",{name:filename})
             })
             writer.on('error',()=>console.log("not done"))
             


        })
        .catch((err) => {
            console.log(err)
            console.log("bir hata oluştu")
        })

}

function DownloadFile(fullUrl) {
    axios.get(fullUrl).then(data => {
        const $ = cheerio.load(data.data);
        let folderName = $("span[itemprop=name]").text().trim().replace(/\s+/g, "_").replace("-", "_").replace(/[^a-zA-Z0-9]/g,'_');
        let btnEl = $("a[id=downloadButton]");
        if (btnEl) {
            let downloadurl = btnEl.attr('href');
            SaveFile(downloadurl, folderName);
        }


    }).catch(() => {
        console.log("hata oluştu")
    })
}


