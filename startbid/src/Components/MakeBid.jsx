import { Component } from "react";
import { auctions } from "../Resources/auctions";
import { Row, Col, Image, Button, Container, Breadcrumb, BreadcrumbItem, Modal} from 'react-bootstrap';
import {FaEthereum} from 'react-icons/fa';
import io from 'socket.io-client'
var endpoint="http://localhost:4000";

const socket = io.connect(endpoint);

class MakeBid extends Component{
    constructor(props){
        super(props);
        this.state = {
            product:{},
            amount:0,
            starttime:0,
            endtime:0,
            auction_bid_modal:false,
            latency:0,
            connectwalletstatus: 'Connect Wallet',
            account_addr: '',
            web3: null,
            setshow:false,
            contractval:'',
        };
    }

    componentDidMount()
    {
        var web3;
        const Web3 = require('web3');
        // web3 lib instance
        if(typeof window.web3 !== 'undefined'){
            web3 = new Web3(window.ethereum);
            // get all accounts
            // const accounts = await web3.eth.getAccounts();
            this.setState({web3: web3});
            this.connect(web3);
            this.initialiseAddress(web3);
        }
        else{
            alert('No web3? You should consider trying MetaMask!');
        }

        if(window.ethereum) {
            window.ethereum.on('accountsChanged', () => {
                this.initialiseAddress(web3);
                console.log("Account changed");
            });
        }

        
        var address = "0xa5d917241Cf5b3311727B6e897C32A11938Af979";
        const abi = [
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
                        "internalType": "string",
                        "name": "owner_name",
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
                        "internalType": "string",
                        "name": "name",
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
                                "internalType": "string",
                                "name": "owner_name",
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

        var contract = new web3.eth.Contract(abi, address);

        this.setState({contractval: contract});
        
        var key={id:this.props.productId};
        console.log(key);
        fetch('http://localhost:8000/product',{
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json'
            },
            body:JSON.stringify(key)
            }).then((res)=>{
                if(res.ok)
                return res.json();
            }).then((res)=>{
                this.setState({product:res});
                
                
            })
        socket.on('message', data => {
            console.log("recieved");
            var prod2=this.state.product;
        
                prod2["price"]=data['news'];
                prod2["bid_count"]=data['bidcount'];
                console.log(prod2['price'])
                this.setState({product:prod2});
                this.setState({endtime:Date.now()})
                var latencyval = this.state.endtime - this.state.starttime;
                this.setState({latency:latencyval});

         });
    }
    
    initialiseAddress(web3) {

        web3.eth.getAccounts().then((accounts) => {

            var account_addr = accounts[0];
    
            this.setState({account_addr: accounts[0]});
    
            if(!account_addr) {
                
                this.setState({connectwalletstatus: 'Connect Wallet'});
                return;
            }
    
            const len = account_addr.length;
            const croppedAddress = account_addr.substring(0,6) + "..." + account_addr.substring(len-4, len);
    
            web3.eth.getBalance(account_addr).then((balance) => {
    
                var account_bal = (Math.round(web3.utils.fromWei(balance) * 100) / 100);
                var temp = croppedAddress + " (" + account_bal + " ETH)";
                this.setState({connectwalletstatus: temp});
            });
        });
    }

    connect(web3) {

        window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then(this.initialiseAddress(web3))
        .catch((err) => {
        if (err.code === 4001) {
            alert('Please connect to MetaMask.');
        } else {
            console.error(err);
        }
        });
    }



    render(){
        return(
            <>
            <Container>
                
            <Row style={{marginTop:'20px'}}>   
                <Col md={9}>
                <Breadcrumb>
                    <BreadcrumbItem href="/explore">Explore</BreadcrumbItem>
                    <BreadcrumbItem active>{this.state.product.title}</BreadcrumbItem>
                </Breadcrumb>
                </Col>
                <Col md={3}>
                <Button style={{height:'3rem'}} >{this.state.connectwalletstatus}</Button>
                </Col>
            </Row>
            <Row style={{marginTop:'30px'}}>
                <Col md={5}>
                    <Image src={this.state.product.link} height='350px' width='350px'
                        style={{margin:'50px', objectFit:'cover'}}
                       />
                </Col>
                <Col md={7} style={{padding:'50px'}}>
                    <Row> 
                        <Col md={1} style={{}}>
                        
                        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="30" className="live-icon"
                            /> 
                        </svg></Col>
                        <Col md={11} style={{paddingLeft:'0px'}}>
                        <h1 style={{fontWeight:'bolder',paddingLeft:'0px'}}> 
                        
                        {this.state.product.title} </h1>
                        </Col>
                    </Row>

                            <Modal show={this.state.auction_bid_modal}>
                    <Modal.Header >
                    <Modal.Title>Invalid Bid</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    <p>Your bid is less than the current bid</p>
                    </Modal.Body>
                    <Modal.Footer>
                    <Button variant="secondary" onClick={()=>{this.setState({auction_bid_modal:false})
                    document.getElementById("bidinput").value="";
                }}>
                    Close
                </Button>
                
                    </Modal.Footer>
                </Modal>
                
                    
                    <h5> {this.state.product.description} </h5>
                    <hr /> 
                    <h3 style={{marginTop:'30px'}}> Current Bid : <strong style={{color:'green'}}>{this.state.product.price}</strong> <FaEthereum /></h3>
                    <h5> Number of bidders : <strong> {this.state.product.bid_count} </strong></h5>
                    <h5> Bidders Rate : <strong> 7 / Hr </strong></h5>
                    <hr />
                    
                    <Row>
                        <Col md={3}>
                            <input id="bidinput" onChange={(e)=>{
                                this.setState({amount:e.target.value})
                            }} type='number' style={{height:'45px',width:'100%', fontSize:'30px', display:'inline'}} >
                                
                            </input> 
                            
                        </Col>
                        
                        <Col md={7}>
                        <Button  className="btn-lg"
                            style={{width:'90%', backgroundColor:'#FFA0A0', fontWeight:'bolder', border:'none', color:'#21325E' }}
                            onClick = { () => {
                              
                                var s={news:this.state.amount,id:this.state.product._id,address:this.state.account_addr};
                                if(parseInt(this.state.amount)<parseInt(this.state.product.price))
                                this.setState({auction_bid_modal:true})
                                else
                                socket.emit('change', s);
                                this.setState({starttime:Date.now()})

                            }}
                        > Make a Bid </Button>
                        
                        </Col>
                    </Row>
                   <p>Measured latency: {this.state.latency} ms</p>
                </Col>
            </Row>
            </Container>
            </>
        )
    };
}

export default MakeBid;