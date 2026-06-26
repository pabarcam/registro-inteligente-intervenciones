const bcrypt = require('bcryptjs');
const db = require('../config/db');

const newPass = 'TalitaKum2026!';
const hash = bcrypt.hashSync(newPass, 12);

db.run('UPDATE terapeutas SET password = ? WHERE correo = ?', [hash, 'terapeuta@talita.com'], (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('password updated');
  process.exit(0);
});
