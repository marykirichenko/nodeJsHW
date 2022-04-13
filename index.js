const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const fs = require('fs');
const { promisify } = require('util');
const asyncStat = promisify(fs.stat)
const path = require('path')
const filesFolder = path.join(__dirname,'files')

function checkFolder(){
 try{
        if(!fs.existsSync(filesFolder)){
            fs.mkdirSync(filesFolder)
        }
     }catch(err){
     throw err
     }
}

app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/api/files', function (req, res) {
    checkFolder()
    fs.readdir(filesFolder,(error,files)=>{
        if(error){
            if(error.code==='ENOENT'){
                res.status(400).json({
                    "message": "Client error"
                }).end();
            }
            else{
                res.status(500).json({
                    "message": "Server error"
                }).end();
            }
        }
        else{
            res.status(200).json({
                "message": "Success",
                "files": `${files}`
            })
        }
    })
});

async function getTime(fileName){
    const stats = await asyncStat(`${fileName}`)
    return stats.birthtime.toUTCString()
}

app.get('/api/files/:filename',(req, res) =>{
    checkFolder()
    const filePath = path.join(filesFolder,req.params['filename'])
    fs.readFile(filePath,(error,data)=>{
        if(error){
            if(error.code==='ENOENT'){
                res.status(400).json({
                    "message": `No file with '${req.params['filename']}' filename found`
                }).end();
            }
            else{
                res.status(500).json({
                    "message": "Server error"
                }).end();
            }
        }else{
            getTime(filePath).then((val) =>
            res.status(200).json({
                "message": "success",
                "filename": `${req.params['filename']}`,
                "content": `${data}`,
                "extension": `${path.extname(filePath)}`,
                "uploadedDate": `${val}`
            }).end())
        }

    })
});

app.post('/api/files',(req,res)=>{
    checkFolder()
    fs.writeFile(`${filesFolder}/${req.body.filename}`,`${req.body.content}`,(error)=>{
        if(error||req.body.filename===undefined||req.body.content===undefined){
                res.status(400).json({
                                   "message": "Params error"
                               }).end();

        }else{
        console.log(req.body.filename)
            res.status(200).json({
                "message": "File created successfully"
            }).end();
        }
    })

})

app.listen(8080,() => {
    console.log(`Server running `)
})

