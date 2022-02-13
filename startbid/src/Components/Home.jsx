import { Component } from "react";
import { Container, Row, Col, Card, Button, Dropdown ,Spinner,Modal,Form } from "react-bootstrap";
import Bulb from 'react-bulb';
import { auctions } from "../Resources/auctions";
import {AiFillHeart} from 'react-icons/ai';
import {FaEthereum} from 'react-icons/fa';
import {TiPlus} from 'react-icons/ti';
import {Link} from 'react-router-dom';

class Home extends Component{
    constructor(props){
        super(props);
        this.state = {
            bulbColor:['#00cc00', '#fafafa' ],
            bulbColorIndex: 0,
            auctionFilter: ['Live', 'Upcoming', 'Ended', 'All'],
            auctionFilterActive: 'Live',
            auctions:[],
            b:0,
            connectwalletstatus: 'Connect Wallet',
            account_addr: '',
            web3: null,
            setshow:false,
            contractval:'',

        };
        this.addproducts=this.addproducts.bind(this);
        this.connect=this.connect.bind(this);
        this.initialiseAddress=this.initialiseAddress.bind(this);
    }
   
 
    componentDidMount = () => {

        var web3;
        const Web3 = require('web3');
        // web3 lib instance
        if(typeof window.web3 !== 'undefined'){
            web3 = new Web3(window.ethereum);
            console.log(web3);
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

        var address = "0x6d7D3d587e2640285B9b3c3E9fd27b12e409934D";
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

        var contract = new web3.eth.Contract(abi, address);

        this.setState({contractval: contract});
     
        setInterval(async() => {
            await this.setState({bulbColorIndex: (this.state.bulbColorIndex+1)%2});
        }, 600);
        fetch('http://localhost:8000/home',{
        method: 'GET',
        headers: {
            'Content-Type' : 'application/json'
        }
        }).then((res)=>{
            if(res.ok)
            return res.json();
        }).then((res)=>{
            this.setState({auctions:res});
            this.setState({b:1});
          
            
        })
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
    unixToDate(unix_timestamp) {
        unix_timestamp=parseInt(unix_timestamp);
        var date = new Date(unix_timestamp * 1000);
        return date.getUTCDate().toString() + '/' + date.getUTCMonth().toString()+1 + '/' + date.getFullYear().toString();
    }

    addproducts()
    {
        if(this.state.b==0)
        {
            return( 
                <Spinner style={{marginLeft:"40%",marginTop:"10%",height:"70px",width:"70px"}}  animation="grow" role="status">
                </Spinner>
            )
        }
        else{
            return(
                <Row>
                    
                    {this.state.auctions.map((auction)=>{
                        return(
                            <Col md={4} 
                                style={{padding: '30px'}}>
                                <Card 
                                    style={{borderTop:"1px solid black"}}>
                                        <Card.Img 
                                            style={{height:"270px", objectFit:'cover'}}
                                            src={auction.link}/>
                                        <Row style={{marginTop: '20px'}}>
                                            <Col md={8}>
                                                <h4
                                                style={{paddingLeft:'20px',fontWeight:'bolder'}}
                                            >{auction.title}</h4>
                                            </Col>
                                            <Col md={4} style={{fontSize:'20px'}}>
                                                <AiFillHeart style={{color:'#FFA0A0'}}/>
                                                <span style={{marginLeft:'10px'}}>{auction.bid_count} 
                                                
                                                </span>
                                            </Col>
                                        </Row> 
                                        <Row style={{padding:'20px'}}>
                                            <Col md={6} style={{}}>
                                                <h5> Current Bid </h5>
                                                <h5 style={{fontWeight:'bolder'}}> {auction.price} ETH 
                                                <FaEthereum style={{color:'#21325E'}}/>
                                                </h5>
                                            </Col>
                                            <Col md={6}>
                                                <h5> Expiring on</h5>
                                                <h5 style={{fontWeight:'bolder'}}>{this.unixToDate(auction.ending_date)}</h5>
                                            </Col>
                                        </Row>
                                        <Row style={{textAlign:'center', paddingBottom:'20px'}}>
                                            <Col md={6} style={{}}>
                                                
                                                <Button  
                                                    style={{width:'80%', backgroundColor:'#FFA0A0', border:'none', color:'#21325E' }}
                                                    onClick = { () => {
                                                        window.location.replace(`explore/${auction._id}`);
                                                    }}
                                                > Place bid </Button>
                                                
                                            </Col>
                                            <Col md={6}>
                                                <Button variant='light' style={{width:'80%'}}> View History </Button>
                                            </Col>
                                        </Row>
                                        
                                        
                                        
                                </Card>    
                            </Col>
                        )
                    })}
                </Row>
            );
        }
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
                console.log(temp);
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
         
                <Row style={{paddingTop:'20px'}}>
                    <Col md={9}>
                    <h1
                    style={{ fontWeight:'bolder', paddingLeft: '20px'}}
                    > Start Bid  </h1>
                    </Col>
                    <Col md={3} style={{textAlign:'right'}}>
                    <Button className= "authenticate-btn-active" 
                        style={{height:'3rem'}} >{this.state.connectwalletstatus}
                    </Button>
                    </Col>
                </Row>
                
                <Row>
                <Col md={6}>

                <h4 style={{marginLeft:'20px'}}>Live Auctions</h4> 
                </Col>
                <Col md={6} style={{textAlign:'right'}}>
                <Button 
                    style={{backgroundColor:'#FFA0A0', color:'#21325E',border:'none'}}
                    onClick={()=>{
                     this.setState({setshow:true})
                }}> <span style={{fontSize:'20px'}} > <TiPlus /> </span>New Auction</Button>
                </Col>
                </Row>
                
                <Modal show={this.state.setshow}>
            <Modal.Header >
              <Modal.Title>Enter Auction's details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div >
                <Form>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Title</Form.Label>
                        <Form.Control id="title" type="text"  />
                        
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Price</Form.Label>
                        <Form.Control  id="Price" type="text"  />
                        
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Description</Form.Label>
                        <Form.Control  id="Description" type="text"  />
                        
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Enter Image Link</Form.Label>
                        <Form.Control  id="link" type="text"  />
                        
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Duration of Auction</Form.Label>
                        <Form.Control  id="tod" type="text"  />
                        
                    </Form.Group>
                    
                    
                    <Button onClick={async()=>{
                        var title=document.getElementById("title").value;
                        var price=document.getElementById("Price").value;
                        var description=document.getElementById("Description").value;
                        var link=document.getElementById("link").value;
                        var tod=document.getElementById("tod").value;
                        tod=parseInt(tod);
                        tod=Date.now()+(tod*86400000)
                        
                        var key={title:title,price:price,description:description,link:link,tod:tod};
                        console.log(key)
                                
                            await fetch('http://localhost:8000/addauction',{
                            method: 'POST',
                            headers: {
                                'Content-Type' : 'application/json'
                            },
                            body:JSON.stringify(key)
                            })
                            this.setState({setshow:false})
                            var account_addr = this.state.account_addr;
                            var contract = this.state.contractval;
                            contract.methods.list_new_auction(title, tod, price).send({from:account_addr}).then(function(result) {
                                alert("Transaction Successful");
                                this.initialiseAddress();
                            });
                            alert("hi");
                            window.location.href="http://localhost:3000/explore";
                        }} variant="primary" >
                        Submit
                    </Button>
                    </Form>
                </div>
            </Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={()=>{this.setState({setshow:false})}}>
            Close
          </Button>
         
            </Modal.Footer>
          </Modal>
                {this.addproducts()}
                
            </Container>
            </>
        );
    }
}

export default Home;