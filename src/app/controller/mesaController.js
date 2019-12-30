const express = require('express');
const authMiddleware = require('../middleware/auth');

const Mesa = require('../models/mesa');

const router = express.Router();

//Interceptador - toda requisição que chegar é verificado o token 
router.use(authMiddleware);

// -------------------------------------------------------------------------------------
// Listar todas as Mesas
// -------------------------------------------------------------------------------------
router.get('/', async (req, res) => {
    try {
       const mesa = await Mesa.find();

       return res.send( { mesa } )

    } catch (error) {
        return res.status(400).send( { error: 'Error loading Mesa' } );
    }
});
// -------------------------------------------------------------------------------------
// Listar uma Mesa Específica
// -------------------------------------------------------------------------------------
router.get('/:mesaId', async (req, res) => {
    try {
        const mesa = await Mesa.findById(req.params.mesaId);

        return res.send( { mesa } );

    } catch (error) {
        return res.status(400).send( { error: 'Error loading Mesa.' } );
    }
});
// -------------------------------------------------------------------------------------
// Criar Mesas
// -------------------------------------------------------------------------------------
router.post('/', async (req, res) => {
    try {
        const { numberPlace, quantMesaAdd = 1 } = req.body;

        const mesa = await Mesa.find()

        const nun = mesa
            .filter(m => m.numberTable >= 0)
            .reduce((lastTable, CurrTable) => {
                if(lastTable.numberTable > CurrTable.numberTable) return lastTable;
                return CurrTable;
            }, { numberTable: 0 })

        const numberTable = nun.numberTable;

        for (let i = 1; i <= quantMesaAdd; i++) {
            let nMesa = numberTable + i;
            await Mesa.create({
                numberPlace, 
                numberTable: nMesa,
            });
        }
        
        return res.send({success: `Criado '${quantMesaAdd}' mesa no sistema` });

    } catch (error) {
        console.log(error);
        return res.status(400).send( { error: 'Error creating new table' } );
    }
});
// -------------------------------------------------------------------------------------
// Deletar o Mesa
// -------------------------------------------------------------------------------------
router.delete('/:mesaId', async (req, res) => {
    try {
        // Buscar a categoria
        const mesa = await Mesa.findById(req.params.mesaId);
        // Remover Product
        mesa.remove();

        return res.status(200).send({ success: 'ok' });
        
    } catch (error) {
        return res.status(400).send( { error: 'Error deleting table.' } );
    }
});

module.exports = app => app.use('/mesa', router);