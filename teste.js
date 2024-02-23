const nodemailer = require("nodemailer");
const admin = require('firebase-admin');
const serviceAccount = require('./disparo-de-email-cf92a-firebase-adminsdk-9ed4t-46413fc575.json');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
        user: "gabrielsousa20070411@gmail.com",
        pass: "wuqm uvnc olte zgjt" // senha do stmp do gmail: wuqm uvnc olte zgjt
    }
});

// Inicializar o SDK do Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://disparo-de-email-cf92a-default-rtdb.firebaseio.com"
});

const db = admin.firestore();
const collectionRef = db.collection('/dados_para_salva');

let emails = [];

// Obter os e-mails da coleção
collectionRef.get()
    .then(snapshot => {
        if (snapshot.empty) {
            console.log('Nenhum documento encontrado.');
            return;
        }

        snapshot.forEach(doc => {
            const email = doc.data().email;
            emails.push(email);
        });

        console.log('E-mails:', emails.join(', '));

        // Função principal para enviar e-mails
        async function main() {
            const info = await transporter.sendMail({
                from: '"Fred Foo 👻" <gabrielsousa20070411@gmail.com>', // endereço do remetente
                to: emails.join(', '), // lista de destinatários
                subject: "Teste numero 2", // linha de assunto.
                text: "Hello world?", // corpo do e-mail em texto
                html: '<img src="https://564aa1b47df8c3eebfdbdf7a4d3fdf9d.serveo.net" width="1" height="1">' // <==  SEMPRE troca o url para minia

            });

            console.log("Email Enviado",);
        }

        main().catch(console.error);

    })
    .catch(error => {
        console.error("Erro ao obter dados:", error);
    });

        // var info = {};

    // colle.get()
    //     .then(snapshot => {
    //         if (snapshot.empty) {
    //             console.log('Nenhum documento encontrado em /dados.');
    //             return;
    //         }
    
    //         snapshot.forEach(doc => {
    //             info = doc.data();
    //         });
    
    //  ;       console.log('Dados recuperados:', info)
    //     })
    //     .catch(error => {
    //         console.error('Erro ao obter documentos de /dados:', error);
    //     });
t