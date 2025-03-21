const FormData = require('form-data');
const Mailgun = require('mailgun.js');

async function sendConfirmationMessage(name, email) {
  const apiKey = "";
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.API_KEY || apiKey,
    // When you have an EU-domain, you must specify the endpoint:
    // url: "https://api.eu.mailgun.net/v3"
  });
  try {
    const data = await mg.messages.create("sandboxb8963eb08f6c43918762d2f4b6494fe1.mailgun.org", {
      from: "Mailgun Sandbox <postmaster@sandboxb8963eb08f6c43918762d2f4b6494fe1.mailgun.org>",
      to: [email],
      subject: name + ", seu cadastro no VigiaEnchente foi concluído",
      text: name + "," + "\n\nSua conta foi criada com sucesso, e está apta a receber notificações.\n\nVigiaEnchente",
    });

    console.log(data); // logs response data
  } catch (error) {
    console.log(error); //logs any error
  }
}

module.exports = { sendConfirmationMessage };