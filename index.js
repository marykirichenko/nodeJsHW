const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const fs = require('fs');
const { promisify } = require('util');
const asyncStat = promisify(fs.stat)

app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/api/files', function (req, res) {
    fs.readdir(__dirname,(error,files)=>{
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
    fs.readFile(req.params['filename'],(error,data)=>{
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
            let extension = req.params['filename'].split('.')[1]
            getTime(req.params['filename']).then((val) =>
            res.status(200).json({
                "message": "success",
                "filename": `${req.params['filename']}`,
                "content": `${data}`,
                "extension": `${extension}`,
                "uploadedDate": `${val}`
            }).end())
        }

    })
});

app.post('/api/files',(req,res)=>{
    fs.writeFile(`${req.body.filename}`,`${req.body.content}`,(error)=>{
        if(error){
            if(error.code==='ENOENT'){
                res.status(400).json({
                    "message": "Please specify 'content' parameter"
                }).end();
            }
            else{
                res.status(500).json({
                    "message": "Server error"
                }).end();
            }
        }else{
            res.status(200).json({
                "message": "File created successfully"
            }).end();
        }
    })

})

app.listen(8080,() => {
    console.log(`Server running `)
})

