import React,{useState,useEffect} from "react"
import ReactDOM from "react-dom"
import Axios from "axios"
import CreateNewForm from "./components/CreateNewForm"
import CricketerCard from "./components/CricketerCard"
 
function App() { 
    const [Cricketers,setCricketers]=useState([])
    useEffect(()=>{
        async function go() { 
            const response=await Axios.get('/cricketers'); 
            setCricketers(response.data);
        }
        go()
    },[])
    return ( 
        <div className="container"> 
            <p> <a href="/">&laquo; Back to public homepage </a></p>
            <CreateNewForm setCricketers={setCricketers}/>
            <div className="cricketer-grid">
            {Cricketers.map(function(cricketer){ 
                return <CricketerCard key={cricketer._id} Name={cricketer.Name} Role={cricketer.Role} photo={cricketer.photo} id={cricketer._id} setCricketers={setCricketers} />
            })}
            </div>
        </div>
    )
}

ReactDOM.render(<App/>,document.getElementById('root')); 