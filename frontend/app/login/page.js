import React from 'react'
import Link from 'next/link'
const login = () => {
  return (

    // container
    <div className='flex justify-center items-center h-screen flex-col '>
      <div className='flex justify-center items-center border border-gray-200 shadow-lg rounded-md p-5 flex-col '  >

      <h1 className='font-bold text-2xl'>Welcome back</h1>
      <p className='text-gray-400 text-xs'>Login to your account to continue shopping</p>

    {/* form */}
      <form
      className='flex flex-col m-2'
      >
        <label className='font-bold text-xs p-1 ml-3'>Email</label>
        <input type='email'
        placeholder='Email'
        className='border border-solid rounded-md border-gray-300 h-5 w-60 placeholder-gray-400 p-[10px] ml-4 text-xs'
        required
        />
        
        <label className='font-bold text-xs p-1 ml-3'>Password</label>
        <input
        type='password'
        placeholder='Password'
        className='border border-solid rounded-md border-gray-300 h-5 w-60 placeholder-gray-400 p-[10px] ml-4 text-xs'
        required
        />
        <button type='submit'
        className='border border-blue-700 rounded-md text-white m-4 w-60 bg-blue-700 text-sm font-bold p-1'>
          Login
        </button>
        <p className='text-gray-400 text-xs -mt-2 ml-8'><Link href='/register' className='text-purple-500'>Register an account</Link> <Link href='/forgot-password'>Forget password?</Link></p>
        
        <div className="flex items-center">
  <input
    id="remember"
    type="checkbox"
    className="w-4 h-3 mt-2 ml-7 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
  />
  <label htmlFor="remember" className="ml-2 mt-2 font-bold text-xs text-gray-800">
    Remember me
  </label>
</div>


      </form>
      </div>

    </div>
  )
}

export default login