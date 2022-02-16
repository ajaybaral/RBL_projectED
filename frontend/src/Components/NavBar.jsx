import react, { Component } from "react";
import { Image } from "react-bootstrap";

import logo from "../Resources/logo.png";
import { Container, Navbar, Nav } from "react-bootstrap";


class NavBar extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <div>
         <Navbar expand="lg"
            style={{backgroundColor: '#21325E', color:'white'}} 

        >
          <Container fluid>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            
              <Navbar.Brand href="/explore" className="navbrandname">
              <Image style={{height:"60px",width:"60px"}} src={logo}
              
                /> 
              </Navbar.Brand>

              <Navbar.Brand href="/explore" className="navbrandname">
              <h2 style={{color:"white", fontWeight:'light'}}>StartBid</h2>
              </Navbar.Brand>
            
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav 
                style={{padding:"20px"}}
              className="ml-auto mr-3">
              <div className="navdiv navstyle ">
                  <Nav.Link 
                  style={{color:"white", fontWeight:"bolder", marginRight:'30px'}}
                  href="/explore" className=" navlinks">
                    Explore
                  </Nav.Link>
                </div>
               
                <div className="navdiv  navstyle ">
                  <Nav.Link 
                  style={{color:"white", fontWeight:"bolder", marginRight:'30px'}}
                   href="/bidstats" className=" navlinks">
                    My Bid Stats
                  </Nav.Link>
                </div>
                <div className="navdiv navstyle ">
                  <Nav.Link  
                  id="name"
                  style={{color:"white", fontWeight:"bolder", marginRight:'30px'}}
                  href="/" className=" navlinks" onClick={()=>{
                    localStorage.removeItem('user');
                  }}>
                    Logout
                  </Nav.Link>
                </div>
              
                {/* <div className="navdiv navstyle ">
                  <Nav.Link 
                  style={{color:"white", fontWeight:"bolder", marginRight:'0px'}}
                  href="/Support" className=" navlinks">
                    Support
                  </Nav.Link>
                </div> */}
                
                
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
       
      </div>
    );
  }
}

export default NavBar;
