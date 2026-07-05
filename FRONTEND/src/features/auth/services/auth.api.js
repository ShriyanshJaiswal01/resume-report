import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
    withCredentials:true
})

export async function register({username,email,password}){
    try{
        const response = await api.post('/api/auth/register',{
            username,email,password
        })
        return response.data
    }catch(err){
        console.log(err)
        throw err
    }
}

export async function login({email,password}){
    try{
        const response = await api.post('/api/auth/login',{
            email,password
        })
        return response.data
    }catch(err){
        console.log(err)
        throw err
    }
}

export async function logout(){
    try{
        const response = await api.get("/api/auth/logout")
        return response.data
    }catch(err){
        console.log(err)
        throw err
    }
}

export async function getMe(){
    try{
        const response = await api.get("/api/auth/get-me")
        return response.data
    }catch(err){
        console.log(err)
        throw err
    }
}

export async function sendRegisterOtp({username,email,password}){
    try{
        const response = await api.post('/api/auth/register/send-otp',{
            username,email,password
        })
        return response.data
    }catch(err){
        console.log(err)
        throw err
    }
}

export async function verifyRegisterOtp({username,email,password,otp}){
    try{
        const response = await api.post('/api/auth/register/verify-otp',{
            username,email,password,otp
        })
        return response.data
    }catch(err){
        console.log(err)
        throw err
    }
}

export async function sendLoginOtp({email,password}){
    try{
        const response = await api.post('/api/auth/login/send-otp',{
            email,password
        })
        return response.data
    }catch(err){
        console.log(err)
        throw err
    }
}

export async function verifyLoginOtp({email,password,otp}){
    try{
        const response = await api.post('/api/auth/login/verify-otp',{
            email,password,otp
        })
        return response.data
    }catch(err){
        console.log(err)
        throw err
    }
}