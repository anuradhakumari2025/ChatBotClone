const mongoose = require('mongoose')

const connectionToDB= ()=>{
  mongoose.connect(process.env.MONGODB_URI).then(()=>{
    console.log("Connected to db")
  }).catch((err)=>{
    console.log("Catch error connecting to db", err)
  })
}
module.exports = connectionToDB