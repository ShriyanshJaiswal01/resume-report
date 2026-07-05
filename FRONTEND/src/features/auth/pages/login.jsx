import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'


const login = () => {

  const { user, handleSendLoginOtp, handleVerifyLoginOtp } = useAuth()
  const navigate = useNavigate()
  
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [showOtpScreen, setShowOtpScreen] = useState(false)
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
      if (!showOtpScreen) {
        const success = await handleSendLoginOtp({email,password})
        if(success){
          setShowOtpScreen(true)
        }
      } else {
        const success = await handleVerifyLoginOtp({email,password,otp})
        if(success){
          navigate('/')
        }
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
            <h1>{showOtpScreen ? "Enter OTP" : "Login"}</h1>
            {showOtpScreen && (
                <p className="otp-info">We have sent a verification code to <strong>{email}</strong>. Please check your inbox.</p>
            )}
            <form onSubmit={handleSubmit}>
                {!showOtpScreen ? (
                    <>
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
                        <button type="submit" className='button primary-button'>Send OTP</button>
                    </>
                ) : (
                    <>
                        <div className="input-group">
                            <label htmlFor="otp">One-Time Password</label>
                            <input
                            value={otp}
                            onChange ={(e)=>{setOtp(e.target.value)}}
                            className="otp-input"
                            type="text" id="otp" name='otp' placeholder='Enter 6-digit OTP' maxLength={6} required />
                        </div>
                        <button type="submit" className='button primary-button'>Verify &amp; Login</button>
                        <button type="button" className="text-button" onClick={() => setShowOtpScreen(false)}>
                            Back to login info
                        </button>
                    </>
                )}
            </form>
            {!showOtpScreen && (
                <p>Don't have an account? <Link to={'/register'}>Register</Link></p>
            )}
        </div>
    </main>
  )
}

export default login