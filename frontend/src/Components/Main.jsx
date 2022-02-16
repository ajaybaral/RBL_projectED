import {Component} from 'react';
import Home from './Home';
import NavBar from './NavBar';
import MakeBid from './MakeBid';
import Authentication from './Authentication';
import BidStats from './BidStats';
import {  BrowserRouter,  Switch, Route, Link, } from "react-router-dom";
class Main extends Component{

    constructor(props){
        super(props);
        this.state = {
           username:"dummy",
           cnt:0
        }
        this.setname=this.setname.bind(this);
        
      
    }
    setname(name)
    {
        this.setState({username:name});
    }
    render(){
        const getParam = ({match}) => {
            return(
                <>
                    <MakeBid productId={parseInt(match.params.productId)} />
                
                </>
    
            )
        }
        return(
            <>
               
                <BrowserRouter>
                <Switch>
                    <Route path="/explore/:productId">
                        {getParam}
                    </Route>
                    <Route path="/explore">
                        <Home username={this.state.username} />
                    </Route>
                    <Route path="/authenticate">
                        <Authentication func={this.setname}/>
                    </Route>

                    <Route path="/bidstats">
                        <BidStats/>
                    </Route>
                    
                    <Route path="/">
                        <Authentication func={this.setname}/>
                    </Route>
                
                
                </Switch>
                </BrowserRouter>
            
            </>
        );
    }
}

export default Main;