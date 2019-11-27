const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypt = require('crypto');

const User = require('../models/user');

const router = express.Router();
// -------------------------------------------------------------------------------------
//Função para Gerar o token, passando o parametro id, chaveSecreta e
//expira em 1 dia (86400)
// -------------------------------------------------------------------------------------
function generateToken( params = {} ) {
    return jwt.sign( params, process.env.AUTH_SECRET, {
            expiresIn: 86400,
        }
    );
}
// -------------------------------------------------------------------------------------
// Autenticação de usuário
// -------------------------------------------------------------------------------------
router.post('/authenticate', async (req, res) => {
    // Receber via req.body o email e password para o usuário logar e receber um token
    const { email, password } = req.body;

    if(email === '' || password === '')
        return res.status(400).send( { error: 'Email or password this empty' } );

    // Verificar se o email passado existe 
    // como definimos select: false no UserSchema para pegar o password
    //  usaremo .select('+password')
    const user = await User.findOne( { email } ).select('+password');

    // Verificação se o email não for localizado
    if(!user)
        return res.status(400).send({ error: 'User not found' });
    
    // //Realizar a verificação se a senha que foi enviada é a mesma que esta cadastrada
    if(!await bcrypt.compare(password, user.password))
        return res.status(400).send({ error: 'Invalid Password' })

    // Não exisbir o password na lista 
    user.password = undefined;

    // Caso o email for localizado retorna
    res.send( {
        user,
        token: generateToken( { id: user.id })
    });
});
// -------------------------------------------------------------------------------------
// Created um usuário
// -------------------------------------------------------------------------------------
router.post('/register', async (req, res) => {
    // Receber via req.body o email e o password do novo usuário
    const { email, password } = req.body;
    // Verificar se o email e o password foi preenchido
    if(email === '' || password === '')
        return res.status(400).send( { error: 'Password or email empty'  } );
    
    try {
        // Verificar se o email já existe
        if(await User.findOne( { email } ))
            return res.status(400).send( { error: 'User already exits' } );

        // Email não localizar Registrar
        const user = await User.create(req.body);
        // Não retornar o password mesmo criptografado
        user.password = undefined;

        return res.send( {
            user,
            token: generateToken( { id: user.id } )
        });


    } catch (error) {
        return res.status(400).send( { error: 'Registration failed' } );
    }

});
// -------------------------------------------------------------------------------------
// Forgot password - Esqueci minha Senha
// -------------------------------------------------------------------------------------
router.post('/forgot-password', async (req, res) => {
    // Receber via req.body o email 
    const { email } = req.body;
    
    try {
        // Consultar o email se esta cadastrado
        const user = await User.findOne( { email } );
        // Verificarção se existe o email
        if(!user)
            return res.status(400).send( { error: 'User not found' } );
        
        // Email existente - Gerar um TOKEN
        const token = crypt.randomBytes(20).toString('hex');
        // Definir uma data de expiração para o token
        const now = new Date();
        now.setHours(now.getHours() + 1);

        // Realizar o Update set o token e Data de Expiraçãoo
        await User.findOneAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now,
            }
        }, { useFindAndModify: false });

        return res.status(200).send();

    } catch (error) {
        return res.status(400).send({ error: 'Erro on forgot password, try again' });    
    }
});
// -------------------------------------------------------------------------------------
// Reset password
// -------------------------------------------------------------------------------------
router.post('/reset-password', async (req, res) => {
    const { email, token, password } = req.body;

    try {
        const user = await User.findOne({ email })
             .select('+passwordResetToken passwordResetExpires');
        
        //Usuario não localizado
        if(!user)
            return res.status(400).send({ error: 'User not found' });

        //Verificar se o token é igual a do usuario
        if(token !== user.passwordResetToken)
            return res.status(400).send({ error: 'Token invalid' });

        //Verificar se o token expirou
        const now = new Date();

        if(now > user.passwordResetExpires)
            return res.status(400).send({ error: 'Token expired, generate new one.' });

        user.password = password;

        await user.save();

        return res.status(200).send();

    } catch (error) {
        return res.status(400).send({ error: 'Erro on Reset password, try again' });
    }
});

module.exports = app => app.use('/auth', router);