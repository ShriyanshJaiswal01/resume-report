import {useContext,useEffect} from "react";
import {AuthContext} from "../auth.context";
import {login,register,logout,getMe,sendRegisterOtp,verifyRegisterOtp,sendLoginOtp,verifyLoginOtp} from "../services/auth.api";

export const useAuth = () =>{
    const context = useContext(AuthContext)
    const {user, setUser, loading, setLoading} = context

    const handleLogin = async({email,password}) => {
        setLoading(true)
        try{
            const data = await login({email,password})
            if (data && data.user) {
                setUser(data.user)
                return true
            }
            return false
        }catch(err){
            const errMsg = err.response?.data?.message || err.message || "Login failed"
            alert(errMsg)
            return false
        }finally{
            setLoading(false)
        }
    }

    const handleRegister = async ({username,email,password}) => {
        setLoading(true)
        try{
            const data = await register({username,email,password})
            if (data && data.user) {
                setUser(data.user)
                return true
            }
            return false
        }catch(err){
            const errMsg = err.response?.data?.message || err.message || "Registration failed"
            alert(errMsg)
            return false
        }finally{
            setLoading(false)
        }
    }

    const handleLogout = async()=>{
        setLoading(true)
        try{
            const data = await logout()
            setUser(null)
        }catch(err){

        }finally{
            setLoading(false)
        }
        
        
    }

    const handleSendRegisterOtp = async ({username,email,password}) => {
        setLoading(true)
        try{
            await sendRegisterOtp({username,email,password})
            return true
        }catch(err){
            const errMsg = err.response?.data?.message || err.message || "Failed to send registration OTP"
            alert(errMsg)
            return false
        }finally{
            setLoading(false)
        }
    }

    const handleVerifyRegisterOtp = async ({username,email,password,otp}) => {
        setLoading(true)
        try{
            const data = await verifyRegisterOtp({username,email,password,otp})
            if (data && data.user) {
                setUser(data.user)
                return true
            }
            return false
        }catch(err){
            const errMsg = err.response?.data?.message || err.message || "Failed to verify registration OTP"
            alert(errMsg)
            return false
        }finally{
            setLoading(false)
        }
    }

    const handleSendLoginOtp = async ({email,password}) => {
        setLoading(true)
        try{
            await sendLoginOtp({email,password})
            return true
        }catch(err){
            const errMsg = err.response?.data?.message || err.message || "Failed to send login OTP"
            alert(errMsg)
            return false
        }finally{
            setLoading(false)
        }
    }

    const handleVerifyLoginOtp = async ({email,password,otp}) => {
        setLoading(true)
        try{
            const data = await verifyLoginOtp({email,password,otp})
            if (data && data.user) {
                setUser(data.user)
                return true
            }
            return false
        }catch(err){
            const errMsg = err.response?.data?.message || err.message || "Failed to verify login OTP"
            alert(errMsg)
            return false
        }finally{
            setLoading(false)
        }
    }

    useEffect(()=>{
        const getAndSetUser = async()=>{
            try{
                const data = await getMe()
                setUser(data.user)
            }catch(err){

            }finally{
                setLoading(false)
            }
            
            
        }

        getAndSetUser()
    },[])

    return {user,loading,handleRegister,handleLogin,handleLogout,handleSendRegisterOtp,handleVerifyRegisterOtp,handleSendLoginOtp,handleVerifyLoginOtp}
}