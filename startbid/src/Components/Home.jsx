import { Component } from "react";
import { Container, Row, Col, Card, Button, Dropdown ,Spinner,Modal,Form } from "react-bootstrap";
import Bulb from 'react-bulb';
import { auctions } from "../Resources/auctions";
import {AiFillHeart} from 'react-icons/ai';
import {FaEthereum} from 'react-icons/fa';
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
            setshow:false

        };
        this.addproducts=this.addproducts.bind(this);
      
    }
   
 
    componentDidMount = () => {
     
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

    addproducts()
    {
        if(this.state.b==0)
        {
            return( 
                <Spinner style={{marginLeft:"50%",marginTop:"20%",height:"70px",width:"70px"}}  animation="grow" role="status">
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
                                                <span style={{marginLeft:'10px'}}>12 
                                                
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
                                                <h5> Bid Ends In</h5>
                                                <h5 style={{fontWeight:'bolder'}}> 12:07 </h5>
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
    render(){
        
        return(
            <>
            <Container>
         
                <Row style={{padding:'20px'}}>
                    <Col md={6}>
                    <h1
                    style={{ fontWeight:'bolder'}}
                > Start Bid  </h1>
                    </Col>
                    <Col md={6} style={{textAlign:'right'}}>
                        <Button onClick={
                            () => {
                                const Web3 = require('web3');
                                // web3 lib instance
                                if(typeof window.web3 !== 'undefined'){
                                    const web3 = new Web3(window.ethereum);
                                    // get all accounts
                                    // const accounts = await web3.eth.getAccounts();
                                    console.log(web3);
                                }
                                else{
                                    alert('No web3? You should consider trying MetaMask!');
                                }
                            }
                        }>Connect Wallet</Button>
                        <Dropdown style={{margin:'10px'}}>
                        <Dropdown.Toggle id="auction-filter"
                            style={{paddingLeft:'20px', paddingRight:'20px', backgroundColor:'#21325E'}}
                        >
                            {this.state.auctionFilterActive}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item onClick={async()=>{await this.setState({auctionFilterActive:'All'})}}>All</Dropdown.Item>
                            <Dropdown.Item onClick={async()=>{await this.setState({auctionFilterActive:'Live'})}}>Live</Dropdown.Item>
                            <Dropdown.Item onClick={async()=>{await this.setState({auctionFilterActive:'Upcoming'})}}>Upcoming</Dropdown.Item>
                            <Dropdown.Item onClick={async()=>{await this.setState({auctionFilterActive:'Ended'})}}>Ended</Dropdown.Item>
                        </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                </Row>

                <h4 style={{marginLeft:'20px'}}>{this.state.auctionFilterActive} Auctions</h4> 
                <Button onClick={()=>{
                     this.setState({setshow:true})
                }}>Create new Auction</Button>

                
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
                    
                    
                    <Button onClick={()=>{
                        var title=document.getElementById("title").value;
                        var price=document.getElementById("Price").value;
                        var description=document.getElementById("Description").value;
                        var link=document.getElementById("link").value;
                        var tod=document.getElementById("tod").value;
                        
                        
                        var key={title:title,price:price,description:description,link:link,tod:tod};
                        console.log(key)
                                
                            fetch('http://localhost:8000/addauction',{
                            method: 'POST',
                            headers: {
                                'Content-Type' : 'application/json'
                            },
                            body:JSON.stringify(key)
                            });
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