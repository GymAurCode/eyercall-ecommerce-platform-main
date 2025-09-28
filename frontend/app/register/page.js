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

export default register