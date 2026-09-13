'use client'
import { use, useState } from "react";
import { Lock } from "lucide-react";
import { useUIStore } from "@/src/stores/ui.store";
import LoadingSpinner from "@/src/components/LoadingSpinner";

const ResetPassword = () => {
  interface FormData {
    newPassword: string;
    confirmPassword: string;
  };

  const [formData, setFormData] = useState<FormData>({
    newPassword: "",
    confirmPassword: "",
  })

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!formData.newPassword) {
      console.log("Password is required");
      return;
    }
    if (formData.newPassword.length < 6) {
      console.log("Password must be at least 6 characters");
      return;
    }
    if (!formData.confirmPassword) {
      console.log("Please confirm your password");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      console.log("Passwords do not match");
      return;
    }

    
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const formFields = [
    { name: 'newPassword', type: 'password', icon: Lock, placeholder: 'New Password' },
    { name: 'confirmPassword', type: 'password', icon: Lock, placeholder: 'Confirm Password' },
  ];

  return (
    <div className='w-full min-h-screen flex flex-row'>
      
      {/* Left Side - 4/7 for Logo and Pictures */}
      <div className="w-4/7 bg-gray-900 flex items-center justify-center">
        <div className="text-white text-4xl">
          {/* Add your logo and pictures here later */}
          Logo & Pictures
        </div>
      </div>

      {/* Right Side - 3/7 for Reset Password Form */}
      <div className='w-3/7 min-h-screen bg-gray-800 flex items-center justify-center p-8'>
        <div className='w-full'>
          <div className='mb-6 text-center'>
            <h1 className='text-3xl font-bold text-white mb-2'>Reset Password</h1>
            <p className='text-gray-400'>Enter your new password</p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            {formFields.map((field) => {
              const Icon = field.icon;
              const value = formData[field.name as keyof FormData];
              
              return (
                <div key={field.name}>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <Icon className='w-5 h-5 text-gray-400' />
                    </div>
                    <input
                      type={field.type}
                      name={field.name}
                      value={value || ""}
                      onChange={handleChange}
                      className='w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder={field.placeholder}
                    />
                  </div>
                </div>
              );
            })}

            {/* Submit Button */}
            <button
              type='submit'
              disabled={loading}
              className='w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6'
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>

          <div className='mt-6 text-center'>
            <p className='text-gray-400 text-sm'>
              Remember your password?{" "}
              <a href='/login' className='text-blue-500 hover:text-blue-400 font-medium'>
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>

      {useUIStore((state) => state.loading.auth) && (
        <LoadingSpinner />
      )}
      
    </div>
  )
}

export default ResetPassword