(function () {
  var form = document.getElementById('lead-form');
  if (!form) return;

  var msg = document.getElementById('form-msg');
  var btn = document.getElementById('submit-btn');

  // Endpoint assembled at runtime to keep the address out of static scrapers.
  var box = ['emanuele', 'nicolai'].join('.');
  var host = ['gmail', 'com'].join('.');
  var ENDPOINT = 'https://formsubmit.co/ajax/' + box + '@' + host;

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    msg.textContent = '';
    msg.className = '';

    var nome = document.getElementById('nome').value.trim();
    var email = document.getElementById('email').value.trim();
    var azienda = document.getElementById('azienda').value.trim();
    var consenso = document.getElementById('consenso').checked;

    if (!nome || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msg.textContent = 'Inserisci nome e un indirizzo email valido.';
      msg.className = 'err';
      return;
    }
    if (!consenso) {
      msg.textContent = 'Per inviare la richiesta è necessario accettare l\'informativa privacy.';
      msg.className = 'err';
      return;
    }

    var honey = form.querySelector('[name="_honey"]');
    var payload = {
      _subject: 'Nuovo lead — Formazione AI',
      _template: 'table',
      _captcha: 'false',
      _honey: honey ? honey.value : '',
      nome: nome,
      email: email,
      azienda: azienda || '(non indicata)',
      consenso_privacy: 'sì — casella spuntata dall\'utente',
      data_invio: new Date().toISOString(),
      origine: 'formazione-ai sito — modulo "Resta aggiornato"'
    };

    btn.disabled = true;
    btn.textContent = 'Invio in corso…';

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (data) {
        if (data && (data.success === 'true' || data.success === true)) {
          form.reset();
          msg.textContent = 'Grazie! Ti avviseremo quando il corso sarà disponibile.';
          msg.className = 'ok';
        } else {
          throw new Error((data && data.message) || 'invio non riuscito');
        }
      })
      .catch(function () {
        var subject = encodeURIComponent('Aggiornamenti corso PMI Compliance AI Act');
        var body = encodeURIComponent(
          'Nome: ' + nome + '\nAzienda: ' + (azienda || '-') +
          '\n\nHo letto l\'informativa privacy e acconsento al trattamento dei miei dati per ricevere aggiornamenti sul corso.'
        );
        msg.innerHTML = 'Si è verificato un problema con l\'invio automatico. ' +
          'Puoi <a href="mailto:' + box + '@' + host + '?subject=' + subject + '&body=' + body +
          '">scriverci direttamente via email</a>: rispondiamo entro un giorno lavorativo.';
        msg.className = 'err';
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = 'Invia';
      });
  });
})();
