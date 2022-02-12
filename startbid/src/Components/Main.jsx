import { Component } from "react";
import { Container, Form, Button, Row, Col,Image,Table} from "react-bootstrap";
import io from 'socket.io-client'
var endpoint="http://localhost:4000"


const socket = io.connect(endpoint)

class Main extends Component{
    constructor(props){
        super(props);
        this.state={
          a:5
            
        }
      
    }
    
    componentDidMount()
    {
        socket.on('message', data => {
            console.log("recieved");
            this.setState({a:data.news});
        });

    }
   
   render(){
       return(
           <>
           <Button onClick={()=>{
              var q=this.state.a+10;
               var s={news:q};
               socket.emit('change', s);
               
           }}>Click</Button>
        <h1>{this.state.a}</h1>
        </>
       );
   }
}


export default Main;