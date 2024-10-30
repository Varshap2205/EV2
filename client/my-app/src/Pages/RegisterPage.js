import { useState } from "react";

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function register(ev) {
    ev.preventDefault();  // This prevents the page from refreshing when the form is submitted
    console.log("Form submission prevented");

    // Fetch API call to send form data to the backend
    const response = await fetch('http://localhost:4000/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' },
    });

    console.log("Response status:", response.status);
    
    // Check the response from the server
    if (response.status === 200) {
      alert('Registration successful');
    } else {
      alert('Registration failed');
    }
  }

  return (
    <form className="register" onSubmit={register}>
      <h1>Register</h1>
      <input 
        type="text" 
        placeholder="username" 
        value={username} 
        onChange={ev => setUsername(ev.target.value)} 
      />
      <input 
        type="password" 
        placeholder="password" 
        value={password} 
        onChange={ev => setPassword(ev.target.value)} 
      />
      <button type="submit">Register</button>
    </form>
  );
}
