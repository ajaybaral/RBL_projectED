import { Component } from "react";
import { auctions } from "../Resources/auctions";
import { Row, Col, Image, Button, Container, Breadcrumb, BreadcrumbItem} from 'react-bootstrap';
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
            endtime:0
        };
    }
    componentDidMount()
    {
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
                console.log(prod2['price'])
                this.setState({product:prod2});
                this.setState({endtime:Date.now()})

         });
    }
    render(){
        return(
            <>
            <Container>
            <Row style={{marginTop:'20px'}}>   
                <Col>
                <Breadcrumb>
                    <BreadcrumbItem href="/explore">Explore</BreadcrumbItem>
                    <BreadcrumbItem active>{this.state.product.title}</BreadcrumbItem>
                </Breadcrumb>
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
                
                    
                    <h5> {this.state.product.description} </h5>
                    <h5>Category : {this.state.product.category} </h5> 
                    <hr /> 
                    <h3 style={{marginTop:'30px'}}> Current Bid : <strong style={{color:'green'}}>{this.state.product.price}</strong> <FaEthereum /></h3>
                    <h5> Bidding Rate : <strong> 15 ETH / Bid </strong></h5>
                    <h5> Bidders Rate : <strong> 7 / Hr </strong></h5>
                    <hr />
                    
                    <Row>
                        <Col md={3}>
                            <input onChange={(e)=>{
                                this.setState({amount:e.target.value})
                            }} type='number' style={{height:'45px',width:'100%', fontSize:'30px', display:'inline'}} >
                                
                            </input> 
                            
                        </Col>
                        
                        <Col md={7}>
                        <Button  className="btn-lg"
                            style={{width:'90%', backgroundColor:'#FFA0A0', fontWeight:'bolder', border:'none', color:'#21325E' }}
                            onClick = { () => {
                              
                                var s={news:this.state.amount,id:this.state.product._id};
                                if(this.state.amount<this.state.product.price)
                                alert("less")
                                else
                                socket.emit('change', s);
                                this.setState({starttime:Date.now()})

                            }}
                        > Make a Bid </Button>
                        
                        </Col>
                    </Row>

                    <h5 style={{marginTop: '20px'}}> Sugessted Bids : 
                    <strong> <a href = '#'>214 </a></strong>,
                    <strong> <a href = '#'>195 </a></strong>,
                    <strong> <a href = '#'>162 </a></strong>    
                    </h5>
                   <h1>{this.state.endtime-this.state.starttime}</h1>
                </Col>
            </Row>
            </Container>
            </>
        )
    };
}

export default MakeBid;