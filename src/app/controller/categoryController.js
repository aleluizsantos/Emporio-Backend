const express = require('express');
const sharp = require('sharp'); 
const path = require('path'); 
const fs = require('fs');
const multer = require('multer');

const uploadConfig  = require('../config/upload');
const authMiddleware = require('../middleware/auth');
const Category = require('../models/category');

const router = express.Router();
const upload = multer(uploadConfig);

//Interceptador - toda requisição que chegar é verificado o token 
router.use(authMiddleware);

// -------------------------------------------------------------------------------------
// Listar todas a Categorias de Produtos
// -------------------------------------------------------------------------------------
router.get('/', async (req, res) => {
    try {
       const category = await Category.find();

       return res.send(category);

    } catch (error) {
        return res.status(400).send( { error: 'Error loading Category' } );
    }
});
// -------------------------------------------------------------------------------------
// Listar Categorias Específica de Produto
// -------------------------------------------------------------------------------------
router.get('/:categoryId', async (req, res) => {
    try {
        const category = await Category.findById(req.params.categoryId);

        return res.send(category);

    } catch (error) {
        return res.status(400).send( { error: 'Error loading Category.' } );
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
        //Capturar os dados recebidos do request
        const { title } = req.body;
        
        const nameSave =  name.replace(/ /g,'').toLowerCase();
        const filenameSave = `${nameSave}.jpg`;

        //Criação do Post
        const category = await Category.create({
            title,
            image: fileName,
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

        return res.send(category);

    } catch (error) {
        if(fs.existsSync(req.file.path)){
            fs.unlinkSync(req.file.path);
        }
        return res.status(400).send( { error: 'Error creating new Category' } );
    }
});
// -------------------------------------------------------------------------------------
// Atualizar Categoria de Produto
// -------------------------------------------------------------------------------------
router.put('/:categoryId', upload.single('image'), async (req, res) => {
    try {
        //Capturar os dados recebidos do request
        const { title } = req.body;
        const { filename: image } = req.file;

        //Desestruturar o arquivo separando nome da extensão
        const[nameTitle] = title.split(' ');
        const fileName = `${nameTitle}.jpg`;

        //Criação do Post
        const category = await Category.findByIdAndUpdate(req.params.categoryId,{
            title,
            image: fileName,
        }, { new: true, useFindAndModify: false });

        //Redimencionar a imagem recebida para tamanho 500pixel, qualidade 70%
        //utilizando a biblioteca Sharp e SALVAR o arquivo na pasta RESIZED
        await sharp(req.file.path)
            .resize(400)
            .jpeg({quality: 50})
            .toFile(path.resolve(req.file.destination, 'resized', fileName))

            //Excluir a imagem orignal enviada
            fs.unlinkSync(req.file.path);

        return res.send(category);

    } catch (error) {
        console.log(error);
        return res.status(400).send( { error: 'Error Updating new category' } );
    }
});
// -------------------------------------------------------------------------------------
// Deletar o Category
// -------------------------------------------------------------------------------------
router.delete('/:categoryId', async (req, res) => {
    try {
        // Buscar a categoria
        const category = await Category.findById(req.params.categoryId);
        // Buscar o caminho da imagem da categoria
        const pathImage = path.resolve(__dirname,'..','..','uploads','resized', category.image);
        //Excluir a image do servidor
        fs.unlinkSync(pathImage);
        // Remover categoria
        category.remove();

        return res.status(200).send({ success: 'ok' });
        
    } catch (error) {
        return res.status(400).send( { error: 'Error deleting Category.' } );
    }
});


module.exports = app => app.use('/category', router);