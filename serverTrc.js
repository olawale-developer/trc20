const dotenv = require('dotenv');
dotenv.config();
const mysql = require('mysql2');
const { setTrc20WalletFlag, monitoringTimer } = require('./trc20')
const express = require('express')
const cors = require('cors');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

const app = express()
  
app.use(cors()); 

app.use(express.json());

let timers = {}; // Object to store timers

function startIdleTimer(transac_id,wallet_address,db) {
    timers[transac_id]['Timeout'] = setTimeout(() => {
        terminationMessage(transac_id,wallet_address,db);
    }, 1000000);  // 5 minutes = 300,000 milliseconds
}
// 600000
//1000000

// Function that notifies user when they are inactive for a while before terminating the chat, user can continue their transaction later when they provide transaction_id
function terminationMessage(transac_id,wallet_address,db) {
          const user = { status: 'UnSuccessful' };
  db.query(`UPDATE 2settle_transaction_table SET ? WHERE transac_id = ?`, [user, transac_id]);
  
  console.log('I HAVE TERMINATE THIS PROCESSING THANK YOU.........')
  setTrc20WalletFlag(wallet_address, db)
  clearInterval(timers[transac_id]['monitoringTimer'])
   console.log('---------------------------------------------------------------------------------------------------------------');
}

app.post("/Trc20Api", (req, res) => {
    // console.log(req.body)
  const { wallet_address,acct_number,bank_name,bank_code,receiver_name,transac_id,crypto_sent,receiver_amount,current_rate } = req.body.message;
  console.log(wallet_address)
  let walletAddress  =  wallet_address.trim()
           if (!timers[transac_id]) {
                    timers[transac_id] = {}
                    startIdleTimer(transac_id, walletAddress, db) 
                    const currentTime = new Date();
                   // console.log(currentTime)
                     timers[transac_id]['currentTime'] = new Date();
                     timers[transac_id]['futureTime'] = new Date(currentTime.getTime() + 10 * 60 * 1000);  // 10 minutes ahead
                    monitoringTimer(walletAddress, acct_number, bank_name, bank_code, receiver_name, db, transac_id, timers, crypto_sent, receiver_amount, current_rate) 
                  res.status(200).json({message: "Transaction successful!"});
            }else {
        res.status(400).json({ message: 'Transaction is already being monitored.' });
    }
}) 
  
app.listen(7000, () => console.log(`Server is ready in on port ${7000}`))



// function confirmationTimerForTrc20() { 
//     const status = 'Processing'; // Assuming processing is a string variable
//       const asset = 'USDT'
//      const network = 'TRC20'
//   db.query('SELECT * FROM 2settle_transaction_table WHERE status = ? AND crypto = ? AND network = ?', [status,asset,network], (err, results) => {
//     if (err) {
//       console.error('Error querying the database:', err);
//       return;
//     }
//       if (results.length > 0) {
//         results.forEach(({ wallet_address, acct_number, bank_name, crypto_sent, receiver_amount, receiver_name, transac_id, current_rate }) => {
//           let walletAddress  =  wallet_address.trim()
//                console.log(transac_id)
//              //  console.log(wallet_address)
//               db.query('SELECT * FROM 2settle_bank_details WHERE bank_name = ?', [bank_name], (err, result) => {
//                 if (err) {
//                   console.error('Error querying the database:', err);
//                   return;
//                 }
//                 if (result.length > 0) { 
//                    const arr = result.map((row) => row.bank_code)
//                   const bank_code = arr.toString()
                  
//                   if (!timers[transac_id]) {
//                     timers[transac_id] = {}
//                     startIdleTimer(transac_id, walletAddress, db) 
//                     const currentTime = new Date();
//                    // console.log(currentTime)
//                      timers[transac_id]['currentTime'] = new Date();
//                      timers[transac_id]['futureTime'] = new Date(currentTime.getTime() + 10 * 60 * 1000);  // 10 minutes ahead
//                     console.log(timers[transac_id]['currentTime'])
//                     console.log(timers[transac_id]['currentTime'])
//                     monitoringTimer(walletAddress, acct_number, bank_name, bank_code, receiver_name, db, transac_id, timers, crypto_sent, receiver_amount, current_rate) 
                      
//             }
                 
//                 }
//               })
          
         
// });
//     }

//   })
// }

// setInterval(confirmationTimerForTrc20, 30000)



