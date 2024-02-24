const admin = require("firebase-admin");
const express = require('express');
const nodemailer = require("nodemailer");

const serviceAccount1 = require("./veficicadordeemail-firebase-adminsdk-sp5pc-1dab58b8be.json");
const serviceAccount2 = require('./disparo-de-email-cf92a-firebase-adminsdk-9ed4t-46413fc575.json');

const firebase1 = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount1),
    databaseURL: "https://veficicadordeemail-default-rtdb.firebaseio.com"
}, 'firebase1');

const firebase2 = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount2),
    databaseURL: "https://disparo-de-email-cf92a-default-rtdb.firebaseio.com"
}, 'firebase2');

const app = express();
const db1 = firebase1.database();
const ref = db1.ref("/contando/123");

const banco = firebase2.firestore();
const collectionRef = banco.collection('/dados_para_salva');
const colle = banco.collection('/dados');
const colle2 = banco.collection('/teste');

app.get('/', (req, res) => {
    console.log('E-mail aberto!');

    ref.transaction(currentValue => (currentValue || 0) + 1, (error, committed, snapshot) => {
        if (error) {
            console.error("Erro ao incrementar contador:", error);
        } else if (!committed) {
            console.log("Incremento não foi cometido. Valor já foi alterado por outra operação.");
        } else {
            console.log("Contador incrementado com sucesso! Novo valor:", snapshot.val());
        }
    });
    res.sendFile(__dirname + '/img/1x1-00000000.png');
});

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
        user: "gabrielsousa20070411@gmail.com",
        pass: "wuqm uvnc olte zgjt" // senha do stmp do gmail: wuqm uvnc olte zgjt
    }
});
app.get('/email', async (req, res) => {
    try {
        let info = {};
        const colleSnapshot = await colle.get();

        if (colleSnapshot.empty) {
            console.log('Nenhum documento encontrado em /dados.');
        } else {
            colleSnapshot.forEach(doc => {
                info = doc.data();
            });
        }

        console.log(info);

        const collectionSnapshot = await collectionRef.get();

        if (collectionSnapshot.empty) {
            console.log('Nenhum documento encontrado.');
        } else {
            const emailPromises = collectionSnapshot.docs.map(async doc => {
                const email = doc.data().email;
                const nome = doc.data().nome;

                // Substituir 'usuario' por 'nome' nas propriedades subject e message
                const subject = info.subject.replace(/usuario/g, nome);
                const message = info.message.replace(/usuario/g, nome);

                // Enviar e-mail personalizado para cada usuário
                const emailInfo = await transporter.sendMail({
                    from: '" Level marketing "<gabrielsousa20070411@gmail.com>',
                    to: email,
                    subject: subject,
                    text: `teste`,
                    html: `<p>${message}</p> <img src="${info.attachmentURL}" width="auto" height="auto"> `

                });

                console.log(`Email Enviado para ${nome} (${email})`);

                await colle.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        doc.ref.delete();
                    });
                });

                console.log(`Coleção /dados e seus documentos removidos após o envio do e-mail.`);
            });

            await Promise.all(emailPromises);
        }

        res.send('Esta é a segunda rota!' + __dirname + '/img/1x1-00000000.png');
    } catch (error) {
        console.error('Erro ao processar rota /email:', error);
        res.status(500).send('Erro ao processar rota /email');
    }
});

app.get('/teste', async (req, res) => {
    try {
        const colleSnapshot = await colle2.get();

        if (colleSnapshot.empty) {
            console.log('Nenhum documento encontrado em /dados.');
        } else {
            const infoArray = [];
            colleSnapshot.forEach(doc => {
                infoArray.push(doc.data());
            });

            const collectionSnapshot = await collectionRef.get();

            if (collectionSnapshot.empty) {
                console.log('Nenhum documento encontrado.');
            } else {
                for (const info of infoArray) {
                    const subject = info.subject;
                    const message = info.message;
                    const attachment = info.attachment;
                    const email_teste = info.email_teste;
                    const emailPromise = transporter.sendMail({
                        from: '"👻" <gabrielsousa20070411@gmail.com>',
                        to: email_teste, // Assuming email is a property in the user document
                        subject: subject.replace('usuario', 'nome'),
                        text: `teste`,
                        html: `<p>${message}</p> <img src="${info.attachmentURL}" width="auto" height="auto"> `
                    });
                    console.log(`Email Enviado para (${email_teste})`);

                    await colle2.get().then(snapshot => {
                        snapshot.forEach(doc => {
                            doc.ref.delete();
                        });
                    });

                    console.log(`Coleção /dados e seus documentos removidos após o envio do e-mail.`);
                }
            }
        }

        res.send('Esta é a segunda rota!' + __dirname + '/img/1x1-00000000.png');
    } catch (error) {
        console.error('Erro ao processar rota /email:', error);
        res.status(500).send('Erro ao processar rota /email');
    }
});


const port = process.env.PORT || 3100;

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
