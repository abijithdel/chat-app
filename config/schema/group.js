const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({ 
    name: { type: String },
    img: { type: String },
    type: { type: String, default: 'Room'},
    members: [{
        user_id: {type: String},
        admin: {type: Boolean, default: false}
    }] ,
    message: [{
        username: { type: String },
        user_id: { type: String },
        message: { type: String }
    }]                             
});



module.exports = mongoose.model('grups', groupSchema);