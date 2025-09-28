<<<<<<< HEAD
"use client";
=======
import React from 'react'
import Link from 'next/link'
const register = () => {
  return (
        // container
        <div className='flex justify-center items-center h-screen flex-col '>
          <div className='flex justify-center items-center border border-gray-200 shadow-lg rounded-md px-7 py-13 flex-col '  >
    
          <h1 className='font-bold text-2xl'>Welcome</h1>
          <p className='text-gray-400 text-xs'>Create a new account</p>
    
        {/* form */}
          <form
          className='flex flex-col m-2'
          >
            <label className='font-bold text-xs p-1 ml-3'>Name</label>
            <input type='name'
            placeholder='Name'
            className='border border-solid rounded-md border-gray-300 h-5 w-60 placeholder-gray-400 p-[10px] ml-4 text-xs'
            required
            />
            <label className='font-bold text-xs p-1 ml-3'>Email</label>
            <input type='email'
            placeholder='Email'
            className='border border-solid rounded-md border-gray-300 h-5 w-60 placeholder-gray-400 p-[10px] ml-4 text-xs'
            required
            />
            <label className='font-bold text-xs p-1 ml-3'>Password</label>
            <input type='password'
            placeholder='Password'
            className='border border-solid rounded-md border-gray-300 h-5 w-60 placeholder-gray-400 p-[10px] ml-4 text-xs'
            required
            />
            
            <label className='font-bold text-xs p-1 ml-3'>Confirm Password</label>
            <input
            type='password'
            placeholder='Confirm Password'
            className='border border-solid rounded-md border-gray-300 h-5 w-60 placeholder-gray-400 p-[10px] ml-4 text-xs'
            required
            />
            <button type='submit'
            className='border border-blue-700 rounded-md text-white m-4 w-60 bg-blue-700 text-sm font-bold p-1'>
              Register
            </button>
            <p className='text-gray-400 text-xs -mt-2 ml-13'><Link href='/login' className='text-purple-500'>Already have an acocunt <span className='text-gray-400'>Login?</span></Link> </p>
            
          
    
    
          </form>
          </div>
    
        </div>
  )
}
>>>>>>> ee8c42afde82c4521866edec81fec6476fe21980

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

const Register = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(password !== confirmPassword){
      setError("Passwords do not match");
      return;
    }
    try{
      const res = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
      localStorage.setItem('token', res.data.token);
      router.push('/login'); // ya login page redirect
    }catch(err){
      setError(err.response?.data?.message || "Registration failed");
    }
  }

  return (
    <div className='flex justify-center items-center h-screen flex-col bg-white'>
      <div className='flex justify-center items-center border border-gray-200 shadow-lg rounded-md p-5 flex-col'>
        <h1 className='font-bold text-2xl text-black'>Welcome</h1>
        <p className='text-gray-400 text-xs'>Create a new account</p>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <form className='flex flex-col text-black m-2' onSubmit={handleSubmit}>
          <label className='font-bold text-xs p-1 ml-3'>Name</label>
          <input type='text' placeholder='Name' className='border border-solid rounded-md border-gray-300 h-5 w-60 placeholder-gray-400 p-[10px] ml-4 text-xs' value={name} onChange={e=>setName(e.target.value)} required/>

          <label className='font-bold text-xs p-1 ml-3'>Email</label>
          <input type='email' placeholder='Email' className='border border-solid rounded-md border-gray-300 h-5 w-60 placeholder-gray-400 p-[10px] ml-4 text-xs' value={email} onChange={e=>setEmail(e.target.value)} required/>

          <label className='font-bold text-xs p-1 ml-3'>Password</label>
          <input type='password' placeholder='Password' className='border border-solid rounded-md border-gray-300 h-5 w-60 placeholder-gray-400 p-[10px] ml-4 text-xs' value={password} onChange={e=>setPassword(e.target.value)} required/>

          <label className='font-bold text-xs p-1 ml-3'>Confirm Password</label>
          <input type='password' placeholder='Confirm Password' className='border border-solid rounded-md border-gray-300 h-5 w-60 placeholder-gray-400 p-[10px] ml-4 text-xs' value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} required/>

          <button type='submit' className='border border-blue-700 rounded-md text-white m-4 w-60 bg-blue-700 text-sm font-bold p-1'>Register</button>
          <p className='text-gray-400 text-xs -mt-2 ml-13'>
            <Link href='/login' className='text-purple-500'>
              Already have an account <span className='text-gray-400'>Login?</span>
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
