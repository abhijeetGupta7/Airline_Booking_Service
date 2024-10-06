const express=require('express');
const { PORT } = require('./config/server-config');
const apiRouter = require('./routes');
const bodyParser=require("body-parser");
const CRONS = require('./utils/common/node-crons');
const { connectQueue } = require('./config/queue-config');

const app=express();

app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use("/api",apiRouter);

app.listen(PORT, async ()=>{
    console.log(`Server is listening at ${PORT}`);
    CRONS();
    await connectQueue();
})
