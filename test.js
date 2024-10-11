// async function monitorTRC20Transactions(wallet_address, acct_number, bank_name, bank_code, receiver_name, db, transac_id, timers, crypto_sent, receiver_amount, current_rate) {
//     try {
//         // Fetch the TRC20 token contract
//         const contract = await tronWeb.contract().at(tokenContractAddress);
//         console.log(`Monitoring transactions for TRC20 wallet: ${wallet_address}`);

//         timers[transac_id]['keepWatching'] = true; // Set flag to control the watcher

//         // Fetch the latest block number
//         let latestBlock = await tronWeb.trx.getCurrentBlock();
//         let startBlock = latestBlock.block_header.raw_data.number;

//         // Loop through the blocks starting from the latest block
//         while (timers[transac_id]['keepWatching']) {
//             try {
//                 // Fetch the block by number
//                 let block = await tronWeb.trx.getBlock(startBlock);
                
//                 if (block && block.transactions) {
//                     for (let tx of block.transactions) {
//                         // Check if the transaction contains a TRC20 transfer
//                         if (tx.raw_data.contract[0].parameter.value.contract_address === tokenContractAddress) {
//                             const { from, to, value } = tx.raw_data.contract[0].parameter.value;
//                             const toAddress = tronWeb.address.fromHex(to);
                            
//                             console.log(`Checking transaction for wallet: ${toAddress} in block ${startBlock}`);

//                             if (toAddress.trim() === wallet_address.trim()) {
//                                 const actualAmount = tronWeb.toBigNumber(value).div(1e6).toFixed(8);
//                                 const expectedamount = crypto_sent.replace(/[^0-9.]/g, "");

//                                 if (actualAmount == expectedamount) {
//                                     const amount = receiver_amount.replace(/[^0-9.]/g, "");
//                                     const amount_sent = amount.split(".")[0];

//                                     // Call external API or database action
//                                     mongoroApi(acct_number, bank_name, bank_code, receiver_name, db, transac_id, amount_sent);
//                                     setTrc20WalletFlag(wallet_address, db);
//                                     actualAmounts(transac_id, actualAmount, amount_sent, db);
                                    
//                                     timers[transac_id]['keepWatching'] = false;
//                                     console.log(`TRC-20 Tokens received: 
//                                         From: ${from}, 
//                                         To: ${toAddress}, 
//                                         Amount: ${actualAmount} USDT`);
//                                     break; // Exit the loop once the transaction is found
//                                 } else {
//                                     handleSmallAmount(actualAmount, expectedamount, current_rate, transac_id, acct_number, bank_name, bank_code, receiver_name, db, wallet_address, acct_number, bank_name, bank_code, receiver_name, db, transac_id, timers, current_rate);
//                                 }
//                             }
//                         }
//                     }
//                 }

//                 // Move to the next block
//                 startBlock += 1;
//             } catch (blockError) {
//                 console.error(`Error fetching block ${startBlock}:`, blockError);
//             }
//         }
//     } catch (error) {
//         console.error('Error monitoring TRC20 transactions:', error);
//     }
// }

// const axios = require('axios');

// const options = {
//   method: 'GET',
//   url: 'https:///v1/contracts/TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf/tokens',
//   headers: {accept: 'application/json'}
// };

// axios
//   .request(options)
//   .then(function (response) {
//     console.log(response.data);
//   })
//   .catch(function (error) {
//     console.error(error);
//   });



const axios = require('axios');

// // // TronGrid API endpoint for querying transaction history
// // const tronGridAPI = 'https://nile.trongrid.io/v1/accounts/'

// // async function getTRC20Transactions(walletAddress) {
// //   try {
// //     // Make a request to get all transactions for the specified wallet
// //     const response = await axios.get(`${tronGridAPI}${walletAddress}/transactions/trc20`, {
// //       params: {
// //         limit: 200  // Specify the number of transactions to retrieve
// //       }
// //     });

// //       const transactions = response.data.data;
      
// //     if (transactions.length === 0) {
// //       console.log(`No TRC20 transactions found for wallet: ${walletAddress}`);
// //       return;
// //     }

// //     // Iterate over each transaction and print details
// //     transactions.forEach((tx) => {
// //       const { transaction_id, from, to, value, token_info, block_timestamp } = tx;
// //       const amount = value / 10 ** token_info.decimals;  // Convert based on token decimals

// //       // Convert timestamp to a readable date
// //       const transactionDate = new Date(block_timestamp).toUTCString();

// //       console.log(`Transaction ID: ${transaction_id}`);
// //       console.log(`From: ${from}`);
// //       console.log(`To: ${to}`);
// //       console.log(`Token: ${token_info.symbol}`);
// //       console.log(`Amount: ${amount}`);
// //       console.log(`Date: ${transactionDate}`);
// //       console.log('-------------------------------------------');
// //     });
// //   } catch (error) {
// //     console.error('Error fetching TRC20 transactions:', error);
// //   }
// // }


 const currentTime = new Date();
 const futureTime = new Date(currentTime.getTime() + 10 * 60 * 1000);  // 10 minutes ahead
const walletAddress = 'TGTPw1nL4RFERsaMBNJZ2ZrtBh88jkU2Ps';

// TronGrid API endpoint for querying transaction history
// const tronGridAPI = 'https://api.trongrid.io/v1/accounts/';
const tronGridAPI = 'https://nile.trongrid.io/v1/accounts/'

async function checkLastTRC20Transaction() {
  try {
    // Make a request to get the last transaction for the specified wallet
    const response = await axios.get(`${tronGridAPI}${walletAddress}/transactions/trc20`, {
      params: {
        limit: 1,  // Get only the last transaction
        order_by: 'block_timestamp,desc'  // Order by the most recent first
      }
    });

    const transactions = response.data.data;
    if (transactions.length === 0) {
      console.log(`No TRC20 transactions found for wallet: ${walletAddress}`);
      return;
    }

    // Get the last transaction
    const lastTransaction = transactions[0];
    const { transaction_id, from, to, value, token_info, block_timestamp } = lastTransaction;
    const amount = value / 10 ** token_info.decimals;  // Convert based on token decimals
   
    // Convert transaction timestamp to a date
    const transactionDate = new Date(block_timestamp);
    const actualAmount = amount.toFixed(8);
    console.log(actualAmount)
    // Get current time and time 10 minutes from now

    console.log('currentTime:', currentTime)
    console.log('futureTime:', futureTime)
    // console.log('transactionDate:', transactionDate)
    // Compare the transaction time with current time and next 10 minutes
    if (transactionDate >= currentTime && transactionDate <= futureTime) {


      console.log(`The last transaction happened within the last 10 minutes:`);
      console.log(`Transaction ID: ${transaction_id}`);
      console.log(`From: ${from}`);
      console.log(`To: ${to}`);
      console.log(`Token: ${token_info.symbol}`);
      console.log(`Amount: ${amount}`);
      console.log(`Date: ${transactionDate}`);
      console.log('-------------------------------------------');
    } else {
      console.log('The last transaction did not happen within the last 10 minutes.');
    }
  } catch (error) {
    console.error('Error fetching TRC20 transactions:', error);
  }
}

// Replace with the wallet address you want to query
// const walletAddress = 'TGTPw1nL4RFERsaMBNJZ2ZrtBh88jkU2Ps';
// checkLastTRC20Transaction(walletAddress);

setInterval(checkLastTRC20Transaction, 30000)



// async function monitorTRC20Transactions(wallet_address, acct_number, bank_name, bank_code, receiver_name, db, transac_id, timers, crypto_sent, receiver_amount, current_rate) {
//     try {
//         // Fetch the TRC20 token contract
       
//         console.log(`Monitoring transactions for TRC20 wallet: ${wallet_address}`);

//         timers[transac_id]['keepWatching'] = true; // Set flag to control the watcher

//         // Fetch the latest block number
//         let latestBlock = await tronWeb.trx.getCurrentBlock();
//         let startBlock = latestBlock.block_header.raw_data.number;

//         // Loop through the blocks starting from the latest block
//         while (timers[transac_id]['keepWatching']) {
//             try {
//                 // Fetch the block by number
//                 let block = await tronWeb.trx.getBlock(startBlock);
//                 console.log(startBlock)
//                console.log('---------------------------------------------------------------------------------------------------------------');
//               if (block && block.transactions) {
//                    console.log('working perfectly....')
//                     for (let tx of block.transactions) {
//                       // Check if the transaction contains a TRC20 transfer
//                       const contract = tx.raw_data.contract[0];
          
//                   //    console.log('Transaction contract:', contract);  // Log the full contract to inspect the structure
//                            console.log(`Checking transaction for TriggerSmartContract...................................`);
//                         // Check if the contract is of type 'TriggerSmartContract' (for TRC20 token transfers)
//                       if (contract.type === 'TriggerSmartContract') {
//                         // Now check if contract_address exists
//                         const contractAddress = tronWeb.address.fromHex(contract.parameter.value.contract_address || '');
//                         console.log('Contract Address:', contractAddress)
//                           console.log(`Checking transaction for tokenContractAddress...................................`);
//                         if (contractAddress === tokenContractAddress) {
                          
//                           const { owner_address, contract_address, data } = contract.parameter.value;
//                           const methodSignature = data.substring(0, 8); // 'a9059cbb' for Transfer function
//                           const toAddressHex = '41' + data.substring(32, 72); // Extract 32 bytes for the to_address
//                           const toAddress = tronWeb.address.fromHex(toAddressHex);
                            
//                           console.log(`Checking transaction for wallet: ${toAddress} in block ${startBlock}`);

//                           if (toAddress.trim() === wallet_address.trim()) {
//                             const actualAmount = tronWeb.toBigNumber(value).div(1e6).toFixed(8);
//                             const expectedamount = crypto_sent.replace(/[^0-9.]/g, "");

//                             if (actualAmount == expectedamount) {
//                               const amount = receiver_amount.replace(/[^0-9.]/g, "");
//                               const amount_sent = amount.split(".")[0];

//                               // Call external API or database action
//                               mongoroApi(acct_number, bank_name, bank_code, receiver_name, db, transac_id, amount_sent);
//                               setTrc20WalletFlag(wallet_address, db);
//                               actualAmounts(transac_id, actualAmount, amount_sent, db);
                                    
//                               timers[transac_id]['keepWatching'] = false;
//                               console.log(`TRC-20 Tokens received: 
//                                         From: ${from}, 
//                                         To: ${toAddress}, 
//                                         Amount: ${actualAmount} USDT`);
//                               break; // Exit the loop once the transaction is found
//                             } else {
//                               handleSmallAmount(actualAmount, expectedamount, current_rate, transac_id, acct_number, bank_name, bank_code, receiver_name, db, wallet_address, acct_number, bank_name, bank_code, receiver_name, db, transac_id, timers, current_rate);
//                             }
//                           }
//                         }
//                       }
//                     }
//                 }

//                 // Move to the next block
//                 startBlock += 1;
//             } catch (blockError) {
//                 console.error(`Error fetching block ${startBlock}:`, blockError);
//             }
//         }
//     } catch (error) {
//         console.error('Error monitoring TRC20 transactions:', error);
//     }
// }



// Replace with the wallet address you want to query
// const walletAddress = 'TGTPw1nL4RFERsaMBNJZ2ZrtBh88jkU2Ps';
// getTRC20Transactions(walletAddress);


// const tronWeb = new TronWeb({
//   // fullHost: 'https://api.trongrid.io', // Tron Grid public API
//   fullHost: 'https://nile.trongrid.io', // Nile testnet URL
// });

// // Replace with your TRC20 token contract address and wallet address
// const walletAddress = 'YOUR_TRON_WALLET_ADDRESS'; // Address to monitor

// // const tokenContractAddress = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // TRC-20 token contract address
//  const tokenContractAddress = 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf'; // TRC-20 token contract address
