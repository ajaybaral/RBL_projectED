import {Component} from 'react';
import { Button, Image, Row, Col, Container, Form} from 'react-bootstrap';
import globe from '../Resources/globe.png';
import key from '../Resources/key.png';
import clock from '../Resources/clock.png';
class Authentication extends Component{
    constructor(props){
        super(props);
        this.state = {
            currentState: 'Login',
            lusermail: '',
            lpassword: '',
            susermail: '',
            spassword: '',
            sconfirmpassword: '',
        }
        this.chooseLogin = this.chooseLogin.bind(this);
        this.handleLogin=this.handleLogin.bind(this);
    }
    componentDidMount = () => {
        setTimeout(() => {
            document.querySelector('.animate-image1').classList.add('change-image')
        }, 1000);
        setTimeout(() => {
            document.querySelector('.animate-image2').classList.add('change-image2')
        }, 1000);
        
        
    }
    handleSignup(){
        var newUser = {
            username: this.state.susermail.split("@")[0],
            password: this.state.spassword
        }
        fetch('http://localhost:8000/signup',{
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify(newUser),

        }).then((response) => {
            if(respose.ok) return response.json();
        }).then(async(res) => {
            if(res.success == 1){
                alert('Account Created Successfully \n Please Login to Continue');
            }
        })
    }
    handleLogin()
    {
        console.log(this.state.lusermail);
        var key={name:this.state.lusermail.split("@")[0],password:this.state.lpassword};
        
        fetch('http://localhost:8000/login',{
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body:JSON.stringify(key)
        }).then((res)=>{
            return res.json();
        }).then(async(res)=>{
            if(res.success==1)
            {
                document.querySelector("#name").innerHTML=this.state.lusermail.split("@")[0]
                await this.props.func(this.state.lusermail.split("@")[0]);
            }

        })
    }
    chooseLogin = () => {
        if(this.state.currentState === "Login"){
            return(
                <>
                    <Form>
                        <Form.Group>
                            <Form.Label style={{fontSize:"20px"}}>Email address</Form.Label>
                            <Form.Control style={{height:"45px"}} type="email" placeholder="Enter email" 
                                onChange={async(event) => {
                                    await this.setState({lusermail: event.target.value});
                                }}
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label style={{fontSize:"20px", marginTop:"30px"}}>Password</Form.Label>
                            <Form.Control style={{height:"45px"}}  type="password" placeholder="Password" 
                                onChange={async(event) => {
                                    await this.setState({lpassword: event.target.value});
                                }}
                            />
                        </Form.Group>
                        
                        
                        <Button variant="dark" style={{margin:"30px 20px 30px 0px", backgroundColor:"#262A53"}} 
                            onClick={this.handleLogin}
                        >
                            Login
                        </Button>

                    </Form>
                </>
            );
        }
        else{
            return(
                <>
                    <Form>
                        <Form.Group>
                            <Form.Label style={{fontSize:"20px"}}>Email address</Form.Label>
                            <Form.Control style={{height:"45px"}} type="email" placeholder="Your Email" 
                            onChange={async(event) => {
                                await this.setState({susermail: event.target.value});
                            }}
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label style={{fontSize:"20px", marginTop:"30px"}}>Password</Form.Label>
                            <Form.Control style={{height:"45px"}}  type="password" placeholder="Choose a Password"
                                onChange={async(event) => {
                                    await this.setState({spassword: event.target.value});
                                }}
                             />
                        </Form.Group>
                        
                        <Form.Group>
                            <Form.Label style={{fontSize:"20px", marginTop:"30px"}}>Confirm Password</Form.Label>
                            <Form.Control style={{height:"45px"}}  type="password" placeholder="Confirm it" 
                                onChange={async(event) => {
                                    await this.setState({sconfirmpassword: event.target.value});
                                }}
                            />
                        </Form.Group> 

                        <Button variant="dark" style={{margin:"30px 20px 30px 0px", backgroundColor:"#262A53"}}
                            onClick={this.handleSignup}
                        >
                            Create Account
                        </Button>
                    </Form>
                </>
            );
        }
    }
    login = async() => {
        await this.setState({currentState: "Login"})
        document.querySelector("#login-btn").classList.add("authenticate-btn-active");
        document.querySelector("#signup-btn").classList.remove("authenticate-btn-active");
       

    }
    signup = async() => {
        await this.setState({currentState: "Sign Up"})
        document.querySelector("#login-btn").classList.remove("authenticate-btn-active");
        document.querySelector("#signup-btn").classList.add("authenticate-btn-active");

    }

    render(){

        return(
        <>
            <Image src={globe} className="image" width='100%' height='auto' 
                style={{objectFit:'cover', position:'absolute', zIndex:'-1'}}
            />
            <Image src={key} className="animate-image1" width='100%' height='auto' 
                style={{objectFit:'cover', position:'absolute', zIndex:'-1', opacity:'1'}}
            />
            <Image src={clock} className="animate-image2" width='100%' height='auto' 
                style={{objectFit:'cover', position:'absolute', zIndex:'-1', opacity:'1'}}
            />
            <Row>
                <Col md={7} style={{padding:'80px', color:'white'}}>
                    <h1 
                    style={{fontSize:'500%', fontWeight:'bolder'}}>Value For Your Valuables.</h1> 
                    
                    <h5 style={{marginTop:'30px'}}> <span style={{fontSize:'40px'}}> 502416 </span>Happy Customers </h5>
                    <h5> <span style={{fontSize:'40px'}}> 20942548 </span> Antiques Sold </h5>

                    <h5 style={{marginTop:'100px'}} > Leading Platform to sell your Antiques </h5>
                    <h6> © Copyright Reserved by StartBid 2022 </h6>
                </Col>
                <Col md={5} style={{}}>
                    <Container fluid 
                    style={{borderRadius:'10px', backgroundColor:'white', width:'70%', padding:'20px', marginTop:'100px'}}>
                    <Row style={{marginTop:"30px", }}>
                        <Col md={6}> 
                            <Button onClick={this.login} className="btn-lg authenticate-btn authenticate-btn-active" id='login-btn'> 
                            Login </Button>
                        </Col>
                        <Col md={6}> 
                            <Button onClick={this.signup} className="btn-lg authenticate-btn"  id='signup-btn'> 
                            Sign Up </Button>
                        </Col>
                    </Row>
                    <hr />

                    {this.chooseLogin()}
                    </Container>
                   
                </Col>
            </Row>
           
            
        </>        
        );
    }
}

export default Authentication;