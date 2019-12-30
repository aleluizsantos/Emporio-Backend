const mongoose = require('../../database');

const MesaSchema = new mongoose.Schema({
    numberTable: {
        type: Number,
        required: true,
    },
    numberPlace: {
        type: Number,
        required: true,
    },
    busy: {
        type: Boolean,
        default: false,
    },
    reserved: {
        type: Boolean,
        default: false,
    }   
});

const Mesa = mongoose.model('Mesa', MesaSchema);

module.exports = Mesa;