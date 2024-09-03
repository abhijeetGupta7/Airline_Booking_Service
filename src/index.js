const express=require('express');
const { PORT } = require('./config/server-config');
const apiRouter = require('./routes');
const bodyParser=require("body-parser");

const app=express();

app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use("/api",apiRouter);

app.listen(PORT, ()=>{
    console.log(`Server is listening at ${PORT}`);
})
