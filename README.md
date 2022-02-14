# StartBid - A Decentralized Auctioning Platform
Hack A Web Hackathon Submission, chosen problem statement: 3-FINTECH

## Submission
Our final application has been deployed at https://startbid.herokuapp.com/

View our video demo @ https://www.youtube.com/watch?v=ASj3A_qyBL0

View our deployed smart contract and its interactions on https://ropsten.etherscan.io/address/0xe6ccafb99015d50d631b2f310b50471eb411f8da

## Our Platform
### Introduction
Our platform involves the development of a decentralized auctioning platform focused on auctioning antique items, antique items are often priceless, and have very high value / worth depending on the item. Since antique items are worth a lot of money, security becomes an important concern because most of the platforms that offer auctions are centralized and thus important information like real-time bids can be easily manipulated by those platforms, so our platform relies on decentralization to solve the problem. However, decentralized platforms hand offer us very high security, but in an auction we dont need just security, we also need low latency. Our solution aims to solve this by ensuring that the auction happens with low latency, while at the same time we donn't compromise in the security of the auction. Also, our platform enables anyone with an ethereum address join our platform and auction their antique products. 

### But how does this work?
Our platform uses a MongoDB cloud Atlas Database in order to keep track of the current price of any item in the auction and makes use of sockets to ensure real-time updations of the current price of any auction along with the number of bids. Once a bid on any item is validated in our backend, the data is transmitted to all users across our platform through sockets with minimal latency. Once this happens, a transaction also simultaneously happens in our backend to record details about the bid in the blockchain ensuring high transparency and security. 

### Our core features
- Authentication page enabling anyone to sign up and login, along with SHA-256 encryption performed in backend to ensure security of passwords in the database. 
- Web3 authentication, which is carried out through our Web3 gateway by connecting wallet to the platform. 
- Listing an auction, along with initial bid rate, number of days, and details about the product to be auctioned. 
- Real time bidding and live updation of current auction price/bid count, and ability to view these across all products in real-time in the explore page and product page. 
- Smart contract level security - ensuring that a bid is valid, auction is valid before listing, and authenticating users before enabling them to collect the amount raised.
- Cryptocurrency supported, after an auction is over the winner can transmit the amount they bidded to our smart contract, which holds the ether until the auction owner can withdraw it, this reduces intermediaries since in centralized auctions, the money goes through various banks where each take a fraction as fee, along with the platform taking fees as well. 
- Minimal fees, our platform can charge a small fraction (ex: 1%) on each successful auction, contributing to business value. 

### Tech Stack
#### Frontend
- ReactJS
- HTML
- CSS
- Javascript 
#### Backend
- Node JS
- Express
- MongoDB
- Socket.io
#### Blockchain
- Web3js
- Solidity

### Our smart-contract
Our smart contract is present in the contract directory and also has been deployed and verified on the Ropsten test network. 
Contract Address: 0xE6CcAFB99015d50D631B2f310B50471EB411f8Da
View our contract interactions at https://ropsten.etherscan.io/address/0xe6ccafb99015d50d631b2f310b50471eb411f8da

## Platform Screenshots
### Authentication / Login Page
![login](https://github.com/bharathbabu68/Red-Ross/blob/main/screenshots/1.png)

### Connecting wallet to website
![connecting_wallet](https://github.com/bharathbabu68/Red-Ross/blob/main/screenshots/2.png)

### Main auctions page (Real time auctions)
![main_page](https://github.com/bharathbabu68/Red-Ross/blob/main/screenshots/3.png)
![main_page_2](https://github.com/bharathbabu68/Red-Ross/blob/main/screenshots/4.png)

### List new auction
![list_auc](https://github.com/bharathbabu68/Red-Ross/blob/main/screenshots/5.png)

### Auction Item Page
![item](https://github.com/bharathbabu68/Red-Ross/blob/main/screenshots/6.png)

### Blockchain Bid History
![history](https://github.com/bharathbabu68/Red-Ross/blob/main/screenshots/7.png)

### Our smart contract interactions
![smart_c](https://github.com/bharathbabu68/Red-Ross/blob/main/screenshots/8.png)

