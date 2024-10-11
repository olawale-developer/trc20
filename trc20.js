const axios = require('axios');
// Initialize TronWeb
const tronGridAPI = 'https://nile.trongrid.io/v1/accounts/'


async function monitorTRC20Transactions(wallet_address, acct_number, bank_name, bank_code, receiver_name, db, transac_id, timers, crypto_sent, receiver_amount, current_rate) {
  try {
    // Make a request to get the last transaction for the specified wallet
    timers[transac_id]['response']  = await axios.get(`${tronGridAPI}${wallet_address}/transactions/trc20`, {
      params: {
        limit: 1,  // Get only the last transaction
        order_by: 'block_timestamp,desc'  // Order by the most recent first
      }
    });

    const transactions = timers[transac_id]['response'].data.data;
    if (transactions.length === 0) {
      console.log(`No TRC20 transactions found for wallet: ${wallet_address}`);
      return;
    }

    // Get the last transaction
      timers[transac_id]['lastTransaction']  = transactions[0];
    const { transaction_id, from, to, value, token_info, block_timestamp } = timers[transac_id]['lastTransaction'] ;
    const amount = value / 10 ** token_info.decimals;  // Convert based on token decimals
   
    // Convert transaction timestamp to a date
    timers[transac_id]['transactionDate']  = new Date(block_timestamp);
    // Get current time and time 10 minutes from now
  
    // Compare the transaction time with current time and next 10 minutes
    if (timers[transac_id]['transactionDate'] >= timers[transac_id]['currentTime'] && timers[transac_id]['transactionDate'] <= timers[transac_id]['futureTime']) {
       const actualAmount = amount.toFixed(8);
      const expectedamount = crypto_sent.replace(/[^0-9.]/g, "");
      
            if (actualAmount == expectedamount) {

                              const nairaAmount = receiver_amount.replace(/[^0-9.]/g, "");
                              const amount_sent = nairaAmount.split(".")[0];

              // Call external API or database action
                              clearInterval(timers[transac_id]['monitoringTimer'])
                              clearTimeout(timers[transac_id]['Timeout']);
                              mongoroApi(acct_number, bank_name, bank_code, receiver_name, db, transac_id, amount_sent);
                              setTrc20WalletFlag(wallet_address, db);
                              actualAmounts(transac_id, actualAmount, amount_sent, db);
                    
                            } else {
                              handleSmallAmount(actualAmount, expectedamount, current_rate, transac_id, acct_number, bank_name, bank_code, receiver_name, db, wallet_address, acct_number, bank_name, bank_code, receiver_name, db, transac_id, timers);
                            }
    } else {
      console.log('The last transaction did not happen within the last 10 minutes.');
    }
  } catch (error) {
    console.error('Error fetching TRC20 transactions:', error);
  }
}


function monitoringTimer(wallet_address, acct_number, bank_name, bank_code, receiver_name, db, transac_id, timers, crypto_sent, receiver_amount, current_rate) {
    timers[transac_id]['monitoringTimer'] = setInterval(() => {
       monitorTRC20Transactions(wallet_address, acct_number, bank_name, bank_code, receiver_name, db, transac_id, timers, crypto_sent, receiver_amount, current_rate)
    }, 120000);  // 2 minutes = 300,000 milliseconds
}


function handleSmallAmount(actualAmount, expectedamount, current_rate, transac_id, acct_number, bank_name, bank_code, receiver_name, db,wallet_address, acct_number, bank_name, bank_code, receiver_name, db, transac_id, timers) {
  const rate = current_rate.replace(/[^0-9.]/g, "");
  const naira = actualAmount * rate;
  let transactionFee;
   console.log('this function is working perfectly')
  if (naira <= 100000) {
    transactionFee = 500;
  } else if (naira <= 1000000) {
    transactionFee = 1000;
  } else if (naira <= 2000000) {
    transactionFee = 1500;
  }

  const num = 50
  const fifty = Number(num).toFixed(8)
  
  const nairaValue = naira - transactionFee;
  if (nairaValue > transactionFee) {
    if (actualAmount <= fifty) {
      const max = Number(actualAmount) + 5
      const maxAmount = max.toFixed(8)
      const min = Number(actualAmount) - 5
      const minAmount = min.toFixed(8)
      console.log('maxAmount:',maxAmount)
      console.log("minAmount:", minAmount)
      console.log("actualAmount:", actualAmount)
      console.log("expectedamount:", expectedamount)
      if (expectedamount <= maxAmount && expectedamount >= minAmount) {
        console.log('for smaller money ')
           handleAmountCal(wallet_address, acct_number, bank_name, bank_code, receiver_name, db, transac_id, timers, actualAmount,nairaValue)
      }else {
            console.log('This amount is too less for the transaction.');
       }

    } else if (actualAmount > fifty) {
      const max = Number(actualAmount) * 1.1
      const maxAmount = max.toFixed(8) 
      const min = Number(actualAmount) * 0.9
      const minAmount = min.toFixed(8)

      if (expectedamount <= maxAmount && expectedamount >= minAmount) {
         console.log('for bigger money ')
       handleAmountCal(wallet_address, acct_number, bank_name, bank_code, receiver_name, db, transac_id, timers, actualAmount,nairaValue)
      } else {
            console.log('This amount is too big for the transaction.');
       }
  }
  } else {
    console.log('This amount is too small for the transaction.');
  }
}


function handleAmountCal(wallet_address, acct_number, bank_name, bank_code, receiver_name, db, transac_id, timers, actualAmount,nairaValue) {
  
    const strNairaValue = nairaValue.toString();
    const amount = strNairaValue.replace(/[^0-9.]/g, "");
    const amt_sent = amount.split(".")[0];
    const amount_sent = `₦${amt_sent.toLocaleString()}`;

      clearTimeout(timers[transac_id]['Timeout']);
    clearInterval(timers[transac_id]['monitoringTimer'])
    mongoroApi(acct_number, bank_name, bank_code, receiver_name, db, transac_id, amt_sent);
    actualAmounts(transac_id, actualAmount, amount_sent, db);
    setTrc20WalletFlag(wallet_address, db);

}


function actualAmounts(transac_id, actualAmount,amount_sent,db) {
  const user = {
    actual_crypto: actualAmount,
    Settle_amount_sent: amount_sent
   };
     db.query(`UPDATE 2settle_transaction_table SET ? WHERE transac_id = ?`, [user, transac_id]);
}

async function mongoroApi(acct_number, bank_name, bank_code, receiver_name,db,transac_id,amount_sent) {
    console.log(receiver_name)
    const user = {
        accountNumber: acct_number,
        accountBank: bank_code,
        bankName: bank_name,
        amount: amount_sent,
        saveBeneficiary: false,
        accountName: receiver_name,
        narration: "Sirftiech payment",
        currency: "NGN",
        callbackUrl: "http://localhost:3000/payment/success",
        debitCurrency: "NGN",
        pin: "111111"
    };
    
    try {
        const response = await fetch('https://api-biz-dev.mongoro.com/api/v1/openapi/transfer', {
            method: 'POST', // HTTP method
            headers: {
                'Content-Type': 'application/json',    // Content type
                'accessKey': '117da1d3e93c89c3ca3fbd3885e5a6e29b49001a',
                'token': '75bba1c960a6ce7b608e001d9e167c44a9713e40'
            },
            body: JSON.stringify(user) // Data to be sent
        });

        const responseData = await response.json();

        if (!response.ok) {
            
         const messageDetails = [
          `Name: ${receiver_name}`,
          `Bank name: ${bank_name}`,
          `Account number: ${acct_number}`,
          `Receiver Amount: ${amount_sent}`,
        ];

        const menuOptions = [
          [{ text: 'Successful', callback_data: `Transaction_id: ${transac_id} Successful` }]
        ];

          
          
          console.log(menuOptions)
            // const message = `${messageDetails.join('\n')}}`
            //  await axios.post('http://127.0.0.1:5000/message', {
            //     message: message,
            //     menuOptions: menuOptions,
            //  })
            
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);

        }
        if (responseData) {
            console.log('working baby')
             const user = { status: 'Successful' };
         db.query(`UPDATE 2settle_transaction_table SET ? WHERE transac_id = ?`, [user, transac_id]);
        }
        console.log('Transaction successful:', responseData);
    } catch (error) {
        console.error('Error:', error);



    }
}

function setTrc20WalletFlag(wallet_address,db) {
     const user = { trc20_flag: 'true' };
     db.query(`UPDATE 2Settle_walletAddress SET ? WHERE tron_wallet = ?`, [user, wallet_address]);
}

// Start monitoring for TRC-20 token transfers
// monitorTRC20Transactions();

module.exports = {
  setTrc20WalletFlag,
    monitoringTimer
}
