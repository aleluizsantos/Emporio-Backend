const express = require('express');
const sharp = require('sharp'); 
const path = require('path'); 
const fs = require('fs');
const multer = require('multer');

const uploadConfig  = require('../config/upload');
const authMiddleware = require('../middleware/auth');
const Product = require('../models/product');

const router = express.Router();
const upload = multer(uploadConfig);

//Interceptador - toda requisição que chegar é verificado o token 
router.use(authMiddleware);

// -------------------------------------------------------------------------------------
// Listar todas os Produtos
// -------------------------------------------------------------------------------------
router.get('/', async (req, res) => {
    try {
       const product = await Product.find();

       return res.send(product);

    } catch (error) {
        return res.status(400).send( { error: 'Error loading Product' } );
    }
});
// -------------------------------------------------------------------------------------
// Listar Product Produto Específico
// -------------------------------------------------------------------------------------
router.get('/:productId', async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);

        return res.send(product);

    } catch (error) {
        return res.status(400).send( { error: 'Error loading Product.' } );
    }
});
// -------------------------------------------------------------------------------------
// Listar todos Products de uma Categoria
// -------------------------------------------------------------------------------------
router.get('/category/:categoryId', async (req, res) => {
    try {
        const product = await Product.find({category: req.params.categoryId});

        return res.send(product);

    } catch (error) {
        return res.status(400).send( { error: 'Error loading Product.' } );
    }
});
// -------------------------------------------------------------------------------------
// Criar Categoria de Produto
// -------------------------------------------------------------------------------------
router.post('/', upload.single('image'), async (req, res) => {

    if (!req.file) {
        return res.send('Please select an image to upload');
    }

    try {
        const { name, description, price, category } = req.body;
        
        const nameSave =  name.replace(/ /g,'').toLowerCase();
        const filenameSave = `${nameSave}.jpg`;

        const product = await Product.create({
            category,
            name,
            image: filenameSave,
            description,
            price
        });
      
        if(fs.existsSync(req.file.path)){
            //Redimencionar a imagem recebida para tamanho 500pixel, qualidade 70%
            //utilizando a biblioteca Sharp e SALVAR o arquivo na pasta RESIZED
            await sharp(req.file.path)
                .resize(400)
                .jpeg({quality: 50})
                .toFile(path.resolve(req.file.destination, 'resized', filenameSave))

                //Excluir a imagem orignal enviada
                fs.unlinkSync(req.file.path);
        }
        
        return res.json(product);

    } catch (error) {
        if(fs.existsSync(req.file.path)){
            fs.unlinkSync(req.file.path);
        }
        return res.status(400).send( { error: 'Error creating new Category' } );
    }
});
// -------------------------------------------------------------------------------------
// Alterar Produto UPDATE
// -------------------------------------------------------------------------------------
router.put('/:productId', upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, category } = req.body;
        
        const nameSave =  name.replace(/ /g,'').toLowerCase();
        const filenameSave = `${nameSave}.jpg`;

        const product = await Product.findById(req.params.productId);
        
        name && (
            product.name = name,
            fs.unlinkSync(path.resolve(req.file.destination, 'resized', product.image))
        );
        description && (product.description = description);
        price && (product.price = price);
        category && (product.category = category);
        product.image = filenameSave;

        product.save();

        if(fs.existsSync(req.file.path)){
            //Redimencionar a imagem recebida para tamanho 500pixel, qualidade 70%
            //utilizando a biblioteca Sharp e SALVAR o arquivo na pasta RESIZED
            await sharp(req.file.path)
                .resize(400)
                .jpeg({quality: 50})
                .toFile(path.resolve(req.file.destination, 'resized', filenameSave))

                //Excluir a imagem orignal enviada
                fs.unlinkSync(req.file.path);
        }
        
        return res.json(product);

    } catch (error) {
        console.log(error);
        if(fs.existsSync(req.file.path)){
            fs.unlinkSync(req.file.path);
        }
        return res.status(400).send( { error: 'Error creating new Category' } );
    }
});
// -------------------------------------------------------------------------------------
// Deletar o Product
// -------------------------------------------------------------------------------------
router.delete('/:productId', async (req, res) => {
    try {
        // Buscar a categoria
        const product = await Product.findById(req.params.productId);
        // Buscar o caminho da imagem da Product
        const pathImage = path.resolve(__dirname,'..','..','uploads','resized', product.image);
        // Verificar se o arquivo existe
        if(fs.existsSync(pathImage)){
            //Excluir a image do servidor
            fs.unlinkSync(pathImage);
        }
        // Remover Product
        product.remove();

        return res.status(200).send({ success: 'ok' });
        
    } catch (error) {
        return res.status(400).send( { error: 'Error deleting Category.' } );
    }
});

module.exports = app => app.use('/product', router);