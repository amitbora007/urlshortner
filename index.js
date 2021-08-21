const express = require('express');
//const helmet = require('helmet');
const morgan = require('morgan');   // logger
const cors = require('cors');
const yup = require('yup');         //schema validation
const {nanoid} = require('nanoid');
const monk = require('monk');

require('dotenv').config();

const db = monk(process.env.MONGO_URI);
const urls = db.get('urls');
//urls.createIndex('slug');
urls.createIndex({slug:1}, {unique: true});



const app = express();

//app.use(helmet());
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());
app.use(express.static('./public'));

const schema = yup.object().shape({
    slug: yup.string().trim().matches(/[\w\-]/i),
    url: yup.string().trim().url().required(),
});

// ------------------------------------- Starting Server-------------------------------
const server = app.listen(5000, function () {
    console.log('Server is running at port 5000..');
});

// --------------------------------------Api routes-------------------------------------

app.get('/', async(req,res,next)=>{
    try{
        const url = await urls.find();
        console.log(url);
        if (url) {
            res.json(url);
        }
        res.json(`message: no data`);
     }
     catch(error) {
        next(error);
     }
});

app.get('/:id', async(req, res)=>{
     const {id: slug} = req.params;
     try{
        const url = await urls.findOne({slug});
        if (url) {
            res.redirect(url.url);
        }
        res.redirect(`/?error=${slug} not found`);
     }
     catch(error) {
        res.redirect('/?error=link not found');
     }
});

app.post('/', async(req, res, next)=>{
    let {slug,url} = req.body;
    try{
        await schema.validate({
            slug , url,
        });

        if (!slug){
            slug = nanoid(5);
        }
        // else {
        //     const exists = await urls.findOne({slug});
        //     if (exists) {
        //         throw new Error('Slug Already Exists!!')
        //     }
        // }
        slug = slug.toLowerCase();
        const newUrl = {
            url, slug,
        };
    
       const created = await urls.insert(newUrl);
       res.json(`Result: localhost:5000/${slug} is created`);
    }
    catch(error){
        next(error);
    }
});

app.delete('/', async(req, res, next)=>{
    let {slug} = req.body;
    slug = slug.toLowerCase();
    
    try{
        const removed = await urls.remove({slug});
        if (removed) {
            res.json(`Result: localhost:5000/${slug} is removed`);
        }
        res.json(`${slug} not found`);
     }
     catch(error) {
        res.json(`UNEXPECTED BEHAVIOR`);
     }
});

app.use((error, req, res, next)=>{
    if (error.status) {
        res.status(error.status);
    }
    else {
        res.status(500);
    }
    res.json({
        message: error.message,
        stack: process.env.NODE_ENV === 'dev'? 'development': 'prod',
    })
});
