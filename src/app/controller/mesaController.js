const express = require('express');
const authMiddleware = require('../middleware/auth');

const Mesa = require('../models/mesa');

const router = express.Router();
// -------------------------------------------------------------------------------------
// INTERCEPTADOR - toda requisição que chegar é verificado o token 
// -------------------------------------------------------------------------------------
router.use(authMiddleware);
// -------------------------------------------------------------------------------------
// Listar todas as Mesas
// -------------------------------------------------------------------------------------
router.get('/', async (req, res) => {
    try {
        // Busca todas as mesas cadastradas 
       const mesa = await Mesa.find();
        // retorna o objeto em forma de json
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
        // Buscar dados mesa pelo parametro @mesaId
        const mesa = await Mesa.findById(req.params.mesaId);
        // retorna o objeto em forma de json            
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
        // Recebendo os paramentro passado na requisição
        // @quantMesaAdd se não for passado assume valor de 1
        const { numberPlace, quantMesaAdd = 1 } = req.body;
        // Buscar todas as mesas que estão cadastradas.
        const mesa = await Mesa.find()
        // Realizar um filter nas mesas para obter o maior número de mesa.
        // armazena na variável @numberTable
        const nun = mesa
            .filter(m => m.numberTable >= 0)
            .reduce((lastTable, CurrTable) => {
                if(lastTable.numberTable > CurrTable.numberTable) return lastTable;
                return CurrTable;
            }, { numberTable: 0 })
        
        const numberTable = nun.numberTable;
        // Realiza o loop para criar as qunantidade de mesa(s) informada pelo usuário
        for (let i = 1; i <= quantMesaAdd; i++) {
            let nMesa = numberTable + i;
            await Mesa.create({
                numberPlace, 
                numberTable: nMesa,
            });
        }
        // retorna em forma de json a quantidade de mesas criada(s)
        return res.send({success: `Criado '${quantMesaAdd}' mesa no sistema` });

    } catch (error) {
        return res.status(400).send( { error: 'Error creating new table' } );
    }
});
// -------------------------------------------------------------------------------------
// Deletar o Mesa
// -------------------------------------------------------------------------------------
router.delete('/:mesaId', async (req, res) => {
    try {
        // Buscar a mesa pelo @mesaId passada como parametro
        const mesa = await Mesa.findById(req.params.mesaId);
        // Remover mesa
        mesa.remove();

        return res.status(200).send({ success: 'ok' });
        
    } catch (error) {
        return res.status(400).send( { error: 'Error deleting table.' } );
    }
});

module.exports = app => app.use('/mesa', router);