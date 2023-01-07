const express=require('express');
const app=express();
const multer=require('multer');
const upload=multer();
const sanitizeHTML=require('sanitize-html');
const {MongoClient, ObjectId}=require('mongodb');
const fsextra=require('fs-extra');
const sharp=require('sharp');
const path=require('path');
const React=require('react');
const ReactDOMServer=require('react-dom/server');
const CricketerCard=require('./src/components/CricketerCard').default; 
const url='mongodb://localhost:27017';
var db; 

//when the app launches make sure the public/uploaded-photos folder exits
fsextra.ensureDirSync(path.join('public','uploaded-photos'));
app.set("view engine","ejs");
app.set("views","./views");
app.use(express.static('public')); 

app.use(express.json())
app.use(express.urlencoded({extended:false}))

function passwordProtected(req,res,next) { 
     res.set("WWW-Authenticate","Basic realm='Our Mern APP'");
     if(req.headers.authorization=="Basic YWRtaW46YWRtaW4=") { 
        next();
     }
     else { 
        console.log(req.headers.authorization);
         res.status(401).send("Try again");
     }
}

app.get('/',async (req,res)=>{
    const Cricketers=await db.collection("Cricketers").find().toArray();
    const generatedHTML=ReactDOMServer.renderToString(
        <div className='container'>
            {!Cricketers.length && <p> There are no cricketers yet. The admin needs to add a few.  </p>}
            <div className='cricketer-grid mb-3'>
            <p> <a href="/admin"> Login / Manage the Cricketers List. </a></p>
                {Cricketers.map(cricketer=> <CricketerCard key={cricketer._id} Name={cricketer.Name} Role={cricketer.Role} photo={cricketer.photo} id={cricketer._id} readOnly={true} />)}
            </div>
        </div>
    )
    res.render("Home",{generatedHTML});
})

app.use(passwordProtected);

app.get('/admin',(req,res)=>{ 
    res.render("Admin");
})

app.get('/cricketers',async (req,res)=>{ 
    const Cricketers=await db.collection("Cricketers").find().toArray();
    res.json(Cricketers);

})

app.post('/create-cricketer',upload.single("photo"),CleanUp, async  (req,res)=>{
    if(req.file) { 
        const filename=`${Date.now()}.jpg`
        await sharp(req.file.buffer).resize(844,456).jpeg({quality:60}).toFile(path.join('public','uploaded-photos',filename));
        req.cleanData.photo=filename;
    }
     const info=await db.collection("Cricketers").insertOne(req.cleanData)
     const newCricketer=await db.collection("Cricketers").findOne({_id: new ObjectId(info.insertedId)})
     res.send(newCricketer);
})

app.delete("/cricketer/:id",async(req,res)=>{
    if(typeof req.params.id!="string"){ 
        req.params.id="";
    }
    const doc=await db.collection('Cricketers').findOne({_id: new ObjectId(req.params.id)});
    if(doc.photo) { 
        fsextra.remove(path.join('public','uploaded-photos',doc.photo));
    }
    db.collection('Cricketers').deleteOne({_id: new ObjectId(req.params.id)})
    res.send("Thank you"); 
})

app.post("/update-cricketer",upload.single("photo"),CleanUp,async(req,res)=>{
    if(req.file) { 
        //if they are uploading a new photo
        const filename=`${Date.now()}.jpg`
        await sharp(req.file.buffer).resize(844,456).jpeg({quality:60}).toFile(path.join('public','uploaded-photos',filename));
        req.cleanData.photo=filename;
        const info=await db.collection("Cricketers").findOneAndUpdate({_id: new ObjectId(req.body._id)},{$set:req.cleanData});
        if(info.value.photo) { 
            fsextra.remove(path.join('public','uploaded-photos',info.value.photo));
        }
        res.send(filename);
    }
    else { 
        //if they are not uploading a new photo 
        db.collection("Cricketers").findOneAndUpdate({_id: new ObjectId(req.body._id)},{$set:req.cleanData});
        res.send(false);
    }
})

function CleanUp(req,res,next){ 
    if(typeof req.body.Name!="string") { 
        req.body.Name="";
    }
    if(typeof req.body.Role!="string") { 
        req.body.Role=""
    }
    if(typeof req.body._id!="string") { 
        req.body._id="";
    }

    req.cleanData= { 
        Name: sanitizeHTML(req.body.Name.trim(),{allowedTags:[],allowedAttributes:{}}),
        Role: sanitizeHTML(req.body.Role.trim(),{allowedTags:[],allowedAttributes:{}})
    } 
    next(); 
}

async function start() { 
    const client=new MongoClient('mongodb://localhost:27017/MernApp?&authSource=admin');
    await client.connect();
    db=client.db();
    app.listen(3000,()=>console.log("The server has started"));
}
start();

