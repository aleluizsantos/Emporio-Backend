const express = require('express');
const authMiddleware = require('../middleware/auth')

const Category = require('../models/category');

const router = express.Router();

//Interceptador - toda requisição que chegar é verificado o token 
router.use(authMiddleware);

// -------------------------------------------------------------------------------------
// Listar todas a Categorias de Produtos
// -------------------------------------------------------------------------------------
router.get('/', async (req, res) => {
    try {
        //.populare('user') é para o mongo listar também os usuários do relacionamento
       const category = await Category.find();

       return res.send( { category } )

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

        return res.send( { category } );

    } catch (error) {
        return res.status(400).send( { error: 'Error loading Category.' } );
    }
});
// -------------------------------------------------------------------------------------
// Criar Categoria de Produto
// -------------------------------------------------------------------------------------
router.post('/', async (req, res) => {
    try {
        //Receber os parametros passados
        const { title } = req.body;
        const { filename: image } = req.file;

        //Desestruturar o arquivo separando nome da extensão
        const[name] = image.split('.');
        const fileName = `${name}.jpg`;

        //Além de receber todos os parametros no body temos que pegar o req.userId passado pelo middleware
        //...req.body, user: req.userId }
        const project = await Projects.create( { title, description, user: req.userId } );

        //Como o Tasks que é recebida é um array, vamos percorrer este array
        //Para que ele não salve antes de percorrer todas as interações usaremos
        //await Promise.All
        await Promise.all(tasks.map(async task => {
            const projectTask = new Task( { ...task, project: project._id } );

            await projectTask.save();
            project.tasks.push(projectTask);
        }));

        //Salvar tudo no projeto
        await project.save();

        return res.send( { project } );

    } catch (error) {
        //console.log(error);
        return res.status(400).send( { error: 'Error creating new project' } );
    }
});


module.exports = app => app.use('/category', router);