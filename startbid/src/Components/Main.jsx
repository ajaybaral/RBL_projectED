import {Component} from 'react';
import Home from './Home';
import NavBar from './NavBar';
import MakeBid from './MakeBid';
import Authentication from './Authentication';
import {  BrowserRouter,  Switch, Route, Link, } from "react-router-dom";
class Main extends Component{

    constructor(props){
        super(props);
        this.state = {
           username:""
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
                <NavBar />
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
                    
                    <Route path="/">
                        <Home /> 
                    </Route>
                
                
                </Switch>
                </BrowserRouter>
            
            </>
        );
    }
}

export default Main;