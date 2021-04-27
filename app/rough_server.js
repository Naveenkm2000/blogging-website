
express = require('express');  //beasause its easier than html//                 
fs = require('fs');                //read or write file
path = require('path');         //working with path
multer = require('multer');     //for uploading images into servver
bodyParser = require('body-parser');    //parse form data



app = express();      
app.use(express.static(path.join(__dirname , 'public')));
app.use(bodyParser.urlencoded({ extended: true })); 


app.get("/",function(req,res){  
    res.sendFile(path.join(__dirname , '/rough2.html'));    //send editor html file as responce when you get request on local host 8000
});

app.listen(8000,function(){                                 //losten on port 8000
    console.log("listening on port 8000");
});

storage = multer.diskStorage({                          //specify the storage and file name for multer to store the uploaded images
    destination : function (req,file,cb){
        cb(null,'uploads/')
    },
    filename:function(req,file,cb){
        cb(null,file.originalname)
    }
})

upload = multer({storage:storage})   

app.post('/uploads',upload.single('uploaded_file'),function(req,res,next){          //uploading single file
    res.status(204).send();                                                            //prevent refershing the page by sending 204 status
    fs.rename(req.file.destination+req.file.originalname,("public/images/"+req.body.file_title+".png"), () => { //rename and move the file to images folder
        console.log("\nFile Renamed!\n");

      });
})

navbar = fs.readFileSync("navbar.txt","utf-8")  //read navbar.txt

//below function writes html file by utilizing the inneer html of editor and send that as responce
app.post('/',function(req,res){
    data = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0">    <link rel="stylesheet" href="css/cssForAll.css"><title>';
    data = data+(req.body.title);
    data = data+'</title></head><body>';
    data = data+navbar
    data = data+(req.body.innerhtml);
    data = data+'</body></html>';
    title = "public/html/"+req.body.title+".html";
    fs.writeFileSync(title,data,function(){  //write the data to html file
        console.log("done!");
    });
    fs.copyFileSync("public/html/"+req.body.title+".html","data/"+req.body.title+".html")  //copy html file to data folder
    res.sendFile(path.join(__dirname , "data/"+req.body.title+".html")); //send the generated file as responce when submit button is clicked
});




