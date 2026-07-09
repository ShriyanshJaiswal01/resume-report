import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'


const login = () => {

  const { user, handleLogin } = useAuth()
  const navigate = useNavigate()
  
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Redirect authenticated users immediately to dashboard
  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  const handleSubmit = async(e) =>{
    e.preventDefault()
    setSubmitting(true)
    try {
      const success = await handleLogin({email,password})
      if(success){
        navigate('/')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if(submitting){
    return (
        <main><h1>Loading...</h1></main>
    )
  }

  return (
    <main>
        <div className="form-container">
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                    value={email}
                    onChange ={(e)=>{setEmail(e.target.value)}}
                    type="email" id="email" name='email' placeholder='Enter email address' required />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                    value={password}
                    onChange ={(e)=>{setPassword(e.target.value)}}
                    type="password" id='password' name='password' placeholder='Enter your password' required />
                </div>
                <button type="submit" className='button primary-button'>Login</button>
            </form>
            <p>Don't have an account? <Link to={'/register'}>Register</Link></p>
        </div>
    </main>
  )
}

export default login