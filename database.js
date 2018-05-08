const mysql = require('mysql');
const config = require('./configs/database');

let connection;
function recoverableConnection(config) {
  connection = mysql.createConnection(config);
  // The server is either down
  connection.connect((err) => {
    if (err) {
      // We introduce a delay before attempting to reconnect, to avoid a hot
      // loop, and to allow our node script to process asynchronous requests in
      // the meantime. If you're also serving http, display a 503 error.
      console.log('error when connecting to db:', err);
      setTimeout(recoverableConnection, 2000);
    }
  });

  connection.on('error', (err) => {
    console.log('db connection error', err);
    // Connection to the MySQL server is usually lost due to either server
    // restart, or a connnection idle timeout.
    // (the wait_timeout server variable configures this)
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
      recoverableConnection();
    } else {
      throw err;
    }
  });
}
recoverableConnection(config);
module.exports = connection;