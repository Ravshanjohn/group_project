'use client';
import { auth_store } from '@/src/stores/auth.store';
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react'

const VerifyEmailPage = () => {
  const { token } = useParams() as { token: string };
  const { verifyEmail } = auth_store();

  useEffect(() => {
    const verify = async () => {
      if (token) {
        await verifyEmail(token);
        return;
      };
      return;
    };
    verify();
  }, [token, verifyEmail])

  return (
    <div className='w-full min-h-screen flex bg-gray-900 items-center justify-center'>
      
      
      
      <div className="text-white text-4xl">
        {/* Add your logo and pictures here later */}
        Logo & Pictures
      </div>
    

    </div>
  )
}

export default VerifyEmailPage