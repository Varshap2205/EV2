import { useEffect,useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "./UserContext";

export default function Header(){
    const {setUserInfo,userInfo}=useContext(UserContext);
    useEffect(()=>{
        fetch('http://localhost:4000/profile',{
            credentials:'include',
        }).then(response=>{
            response.json().then(userInfo=>{
                setUserInfo(userInfo)
            });
        })
    },[setUserInfo]);

    async function logout(event){
        try{
        event.preventDefault();
        const response=await fetch('http://localhost:4000/logout',{
            credentials:'include',
            method:'POST',
        })
        // setUserInfo(null)

        if(response.ok){
            setUserInfo(null)
        }
        else{
            throw new Error('logout failed')
        }
    }
        catch (error) {
            console.error('Error during logout:', error);
          }
    }

 

    const username=userInfo?.username;
    return(
    <header>
    <Link to="/" className="logo">EchoVerse</Link>
    <nav>
        {username && (
            <>
            <Link to='/create'>Create new post</Link>
            <a href="/"onClick={logout}>Logout</a>
            </>
        )}
        {!username && (
            <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            </>
        )}
      
    </nav>
    </header>
    )
}