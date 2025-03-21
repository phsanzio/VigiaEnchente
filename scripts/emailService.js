const FormData = require('form-data');
const Mailgun = require('mailgun.js');

async function sendConfirmationMessage(name, email) {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.API_KEY || "22ca8000bc35950b03cdfe5f78ef23d1-3d4b3a2a-2a24eb68",
    // When you have an EU-domain, you must specify the endpoint:
    // url: "https://api.eu.mailgun.net/v3"
  });
  try {
    const data = await mg.messages.create("sandboxb95b89380cff4145bd5a640e5d7c8d96.mailgun.org", {
      from: "Mailgun Sandbox <postmaster@sandboxb95b89380cff4145bd5a640e5d7c8d96.mailgun.org>",
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