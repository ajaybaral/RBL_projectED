import {Component} from 'react';
import Home from './Home';
import NavBar from './NavBar';
import MakeBid from './MakeBid';
import Authentication from './Authentication';
import {  BrowserRouter,  Switch, Route, Link, } from "react-router-dom";
class Main extends Component{
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
                        <Home />
                    </Route>
                    <Route path="/authenticate">
                        <Authentication/>
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