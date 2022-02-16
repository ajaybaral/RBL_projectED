import { Component } from "react";
import { Container, Row, Col, Card, Button, Dropdown ,Spinner,Modal,Form } from "react-bootstrap";
import Bulb from 'react-bulb';
import { auctions } from "../Resources/auctions";
import {abi} from "../Resources/abi";
import {AiFillHeart} from 'react-icons/ai';
import {FaEthereum} from 'react-icons/fa';
import {TiPlus} from 'react-icons/ti';
import {Link} from 'react-router-dom';
import io from 'socket.io-client'
import NavBar from './NavBar';
var endpoint="http://localhost:4000";
const Web3 = require('web3');

const socket = io.connect(endpoint); //new change

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
            connect_web3_modal:false,
            metamask_installed:false,
            not_logged_in:false,
            auction_listed_modal:false,
        };
        this.addproducts=this.addproducts.bind(this);
        this.connect=this.connect.bind(this);
        this.initialiseAddress=this.initialiseAddress.bind(this);
        this.unixToDate=this.unixToDate.bind(this);
    }
   
 
    componentDidMount = () => {
        var tempvalas = (JSON.parse(localStorage.getItem('user')))
        if(tempvalas==null){
            window.location.href="http://localhost:3000";
        }
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

        socket.on('message', data => {
            console.log("recieved");
            var currprodid = data["id"];
            var allprods=this.state.auctions;
            for(var i=0;i<allprods.length;i++){
                if(allprods[i]["_id"]==currprodid){
                    allprods[i]["bid_count"]=data["bidcount"];
                    allprods[i]["price"]=data["news"];
                    this.setState({auctions:allprods});
                    break;
                }
            }
         });

         socket.on('update', data => {
             console.log("Update received on update socket")
             this.setState({auctions:data});
         });

         var web3;
         const Web3 = require('web3');
         if(typeof window.web3 !== 'undefined'){
             web3 = new Web3(window.ethereum);
             console.log(web3);
             var address = "0xE6CcAFB99015d50D631B2f310B50471EB411f8Da";
             var contract = new web3.eth.Contract(abi, address);
             this.setState({contractval: contract});
             this.setState({web3: web3});
             web3.eth.getAccounts().then((accounts) => {
                if(accounts.length == 0){
                    this.setState({connect_web3_modal: true});
                }
                else{
                    this.initialiseAddress(web3);
                }
             });
         }
         else{
             this.setState({metamask_installed:true});
         }
 
         if(window.ethereum) {
             window.ethereum.on('accountsChanged', () => {
                 this.initialiseAddress(web3);
                 console.log("Account changed");
             });
         }
 
         
    }

    unixToDate(unix_timestamp) {
        unix_timestamp = parseInt(unix_timestamp);
        const timeStamp = unix_timestamp;
        const date = new Date(timeStamp).toLocaleDateString('en-UK');
        return date;
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
                        if((this.state.auctionFilterActive==="Live") && (parseInt(Date.now()) < auction.ending_date)){
                        return(
                            <Col key={auction._id} md={4} 
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
                                                <Button onClick = { () => {
                                                        window.location.replace(`explore/${auction._id}`);
                                                    }} variant='light' style={{width:'80%'}}> View History </Button>
                                            </Col>
                                        </Row>
                                        
                                </Card>    
                            </Col>
                        )
                                                }
                    if((this.state.auctionFilterActive==="Live") && (parseInt(Date.now()) < auction.ending_date)){
                        return(
                            <Col key={auction._id} md={4} 
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
                                                <Button onClick = { () => {
                                                        window.location.replace(`explore/${auction._id}`);
                                                    }} variant='light' style={{width:'80%'}}> View History </Button>
                                            </Col>
                                        </Row>
                                        
                                </Card>    
                            </Col>
                        )
                        }
                        else if((this.state.auctionFilterActive==="Ended") && (parseInt(Date.now()) > auction.ending_date)){
                            return(
                                <Col key={auction._id} md={4} 
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
                                            <Row style={{textAlign:'center', padding:'20px'}}>
                                                <Col md={12} style={{}}>
                                                    
                                                    <Button  
                                                        style={{width:'100%', backgroundColor:'#FFA0A0', border:'none', color:'#21325E' }}
                                                        onClick = { () => {
                                                            window.location.replace(`explore/${auction._id}`);
                                                        }}
                                                    > View status </Button>
                                                    
                                                </Col>
                                            </Row>
                                            
                                    </Card>    
                                </Col>
                            )
                            }
                            else if(this.state.auctionFilterActive==="All"){
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
                                                        <Button onClick = { () => {
                                                                window.location.replace(`explore/${auction._id}`);
                                                            }} variant='light' style={{width:'80%'}}> View History </Button>
                                                    </Col>
                                                </Row>
                                                
                                        </Card>    
                                    </Col>
                                )
                            }
                    })}
                </Row>
            );
        }
    }


    initialiseAddress(web3) {

        web3.eth.getAccounts().then((accounts) => {

            var account_addr = accounts[0];
            console.log(account_addr);
    
            this.setState({account_addr: accounts[0]});
    
            if(!account_addr) {
                
                this.setState({connectwalletstatus: 'Connect Wallet'});
                return;
            }
    
            const len = account_addr.length;
            const croppedAddress = account_addr.substring(0,6) + "..." + account_addr.substring(len-4, len);
    
            web3.eth.getBalance(account_addr).then((balance) => {
    
                var account_bal = (Math.round(web3.utils.fromWei(balance) * 100) / 100);
                var temp = "Connected :"  + croppedAddress + " (" + account_bal + " ETH)";
                this.setState({connectwalletstatus: temp});
                this.setState({connect_web3_modal: false});
                console.log(temp);
            });
        });
    }

    connect(web3) {

        window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .catch((err) => {
        if (err.code === 4001) {
            alert('You refused connection to our website. Please connect to MetaMask.');
            this.setState({connect_web3_modal: true});
        } else {
            console.error(err);
        }
        })
    }

    render(){
        
        return(
            <>
            <NavBar/>
            <Container>
            <Modal show={this.state.connect_web3_modal}>
                        <Modal.Header >
                        <Modal.Title>Connect to Web3</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                        <p>Hi, welcome to StartBid. Please click the below button to connect your wallet our website. Once metamask opens, simply click connect. </p>
                        </Modal.Body>
                        <Modal.Footer>
                        <Button variant="secondary" onClick={async() => {
                            var web3;
                            if(typeof window.web3 !== 'undefined'){
                                web3 = new Web3(window.ethereum);
                                this.setState({web3: web3});
                                this.connect(web3);
                                this.initialiseAddress(web3);

                                var address = "0xE6CcAFB99015d50D631B2f310B50471EB411f8Da";
 
                                var contract = new web3.eth.Contract(abi, address);
 
                                this.setState({contractval: contract});
                            }
                            else{
                                alert('No web3? Please install the metamask extension and refresh the page');
                                return;
                            }
                        }}>Connect Wallet</Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.auction_listed_modal}>
                        <Modal.Header >
                        <Modal.Title>Transaction Successful</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                        <p>Your product has been successfully listed in the auction.</p>
                        </Modal.Body>
                        <Modal.Footer>
                        <Button variant="secondary" onClick={()=>{this.setState({auction_listed_modal:false})
                    }}>
                        Close
                    </Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.metamask_installed}>
                        <Modal.Header >
                        <Modal.Title>No Metamask?</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                        <p>Hi, please install Metamask and reload the page. </p>
                        </Modal.Body>
                        <Modal.Footer>
                    </Modal.Footer>
                </Modal>
         
                <Row style={{paddingTop:'20px'}}>

                    <Col md={8}>
                    <h1
                    style={{ fontWeight:'bolder', paddingLeft: '20px'}}
                    > Start Bid  </h1>
                    </Col>

                    <Col md={4} style={{textAlign:'right'}}>
                    <Button className= "authenticate-btn-active"  
                        style={{height:'3rem'}} onClick={
                            () => {
                                var web3 = this.state.web3;
                                if(this.state.connectwalletstatus === 'Connect Wallet') {
                                this.connect(web3);
                                this.initialiseAddress(web3);
                                }
                                else {
                                    var tempact = this.state.account_addr;
                                    navigator.clipboard.writeText(tempact);
		                            this.setState({connectwalletstatus: 'Copied'});
		                            setTimeout(() => this.initialiseAddress(web3), 400);
                                }
                            }
                        }>{this.state.connectwalletstatus} 
                    </Button>
                    </Col>

                </Row>

                <hr></hr>
                
                <Row>
                <Col md={6}>

                {/* <h4 style={{marginLeft:'20px'}}>{this.state.auctionFilterActive} Auctions</h4>  */}
                <Dropdown style={{margin:'10px'}}>
                        <Dropdown.Toggle id="auction-filter"
                            style={{paddingLeft:'20px', paddingRight:'20px', backgroundColor:'#21325E'}}
                        >
                            {this.state.auctionFilterActive} Auctions
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item onClick={async()=>{await this.setState({auctionFilterActive:'Live'})}}>Live </Dropdown.Item>
                            <Dropdown.Item onClick={async()=>{await this.setState({auctionFilterActive:'Ended'})}}>Ended</Dropdown.Item>
                            <Dropdown.Item onClick={async()=>{await this.setState({auctionFilterActive:'All'})}}>All</Dropdown.Item>
                        </Dropdown.Menu>
                        </Dropdown>
                
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
                        <Form.Control  id="ending_date" type="text"  />
                        
                    </Form.Group>
                    
                    
                    <Button onClick={async()=>{
                        var title=document.getElementById("title").value;
                        var price=document.getElementById("Price").value;
                        var description=document.getElementById("Description").value;
                        var link=document.getElementById("link").value;
                        var ending_date=document.getElementById("ending_date").value;
                        ending_date=parseInt(ending_date);
                        console.log(ending_date);
                        ending_date=parseInt(Date.now())+(ending_date*86400000)
                        console.log(ending_date);
                        
                        var key={title:title,price:price,description:description,link:link,ending_date:ending_date};
                        console.log(key)     


                        this.setState({setshow:false})
                        var web3 = this.state.web3;
                        var account_addr = this.state.account_addr;
                        var contract = this.state.contractval;
                        contract.methods.list_new_auction(title, ending_date, price).send({from:account_addr})
                        .on('transactionHash', (hash)=> {
                            this.setState({auction_listed_modal:true});
                            socket.emit('add_auction', key);
                        })
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