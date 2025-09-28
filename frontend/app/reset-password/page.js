import React from 'react'
import Link from 'next/link'
const register = () => {
  return (
        // container
        <div className='flex justify-center items-center h-screen flex-col '>
          <div className='flex justify-center items-center border border-gray-200 shadow-lg rounded-md p-5 flex-col '  >
    
          <h1 className='font-bold text-2xl'>Reset Password</h1>
         
        {/* form */}
          <form
          className='flex flex-col m-2'
          >
            <label className='font-bold text-xs p-1 ml-3'>New Password</label>
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
             <Link href='/login'>  Reset Password </Link>
            </button>
            
          
    
    
          </form>
          </div>
    
        </div>
  )
}

export default register