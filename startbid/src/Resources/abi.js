export const abi = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "auction_id",
                "type": "uint256"
            }
        ],
        "name": "listed_auction",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "auctions",
        "outputs": [
            {
                "internalType": "string",
                "name": "prod_title",
                "type": "string"
            },
            {
                "internalType": "bool",
                "name": "is_active",
                "type": "bool"
            },
            {
                "internalType": "bool",
                "name": "amount_status",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "unique_id",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "time_of_creation",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "time_of_deadline",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "starting_bid_rate",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "winning_bid_amt",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "auction_owner",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "bidders",
        "outputs": [
            {
                "internalType": "address",
                "name": "bid_placer",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "bidded_value",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "order",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "winner",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "title",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "days_to_deadline",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "starting_bid",
                "type": "uint256"
            }
        ],
        "name": "list_new_auction",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "auction_id",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "orderval",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "bidded_value",
                "type": "uint256"
            }
        ],
        "name": "make_bid",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "bid_placer",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "bidded_value",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "order",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "winner",
                        "type": "bool"
                    }
                ],
                "internalType": "struct Auction.bidder[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "auction_id",
                "type": "uint256"
            }
        ],
        "name": "make_payment",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "view_all_auctions",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "prod_title",
                        "type": "string"
                    },
                    {
                        "internalType": "bool",
                        "name": "is_active",
                        "type": "bool"
                    },
                    {
                        "internalType": "bool",
                        "name": "amount_status",
                        "type": "bool"
                    },
                    {
                        "internalType": "uint256",
                        "name": "unique_id",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "time_of_creation",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "time_of_deadline",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "starting_bid_rate",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "winning_bid_amt",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "auction_owner",
                        "type": "address"
                    }
                ],
                "internalType": "struct Auction.auction[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "auction_id",
                "type": "uint256"
            }
        ],
        "name": "view_all_transactions",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "bid_placer",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "bidded_value",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "order",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "winner",
                        "type": "bool"
                    }
                ],
                "internalType": "struct Auction.bidder[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "view_contract_balance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "auction_id",
                "type": "uint256"
            }
        ],
        "name": "withdraw_from_auction",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];