'use client'
import { useState } from "react";
import { auth_store } from "@/src/stores/auth.store";
import { toast } from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import { useUIStore } from "@/src/stores/ui.store";

const Login = () => {
  interface FormData {
    email: string;
    password: string;
  };

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  })

  const [showPassword, setShowPassword] = useState(false);

  const { login, forgotPassword } = auth_store();

  const handleForgotPassword = async (e: React.FormEvent): Promise<void> => {
    if (!formData.email.trim()) {
      toast.error("Please enter your email to reset password");
      return;
    }

    await forgotPassword(formData.email);
    return;
  };


  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }
    
    if (!formData.password) {
      toast.error("Password is required");
      return;
    }

    await login(formData.email, formData.password);
    return;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const formFields = [
    { name: 'email', type: 'email', icon: Mail, placeholder: 'Email', isPassword: false },
    { name: 'password', type: 'password', icon: Lock, placeholder: 'Password', isPassword: true },
  ];

  return (
    <div className='w-full min-h-screen flex flex-row'>
      
      {/* Left Side - 4/7 for Logo and Pictures */}
      <div className="w-4/7 bg-gray-950 flex items-center justify-center">
        <div className="text-white text-4xl">
          {/* Add your logo and pictures here later */}
          Logo & Pictures
        </div>
      </div>

      {/* Right Side - 3/7 for Login Form */}
      <div className='w-3/7 min-h-screen bg-black flex items-center justify-center p-8'>
        <div className='w-full'>
          <div className='mb-6 text-center'>
            <h1 className='text-3xl font-bold text-white mb-2'>Welcome Back</h1>
            <p className='text-gray-400'>Login to your account</p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            {formFields.map((field) => {
              const Icon = field.icon;
              const value = formData[field.name as keyof FormData];
              const inputType = field.isPassword ? (showPassword ? 'text' : 'password') : field.type;
              
              return (
                <div key={field.name}>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <Icon className='w-5 h-5 text-gray-400' />
                    </div>
                    <input
                      type={inputType}
                      name={field.name}
                      value={value || ""}
                      onChange={handleChange}
                      className='w-full pl-10 pr-4 py-2 border-3 border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder={field.placeholder}
                    />
                    {field.isPassword && (
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300'
                      >
                        {showPassword ? (
                          <EyeOff className='w-5 h-5' />
                        ) : (
                          <Eye className='w-5 h-5' />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Submit Button */}
            <button
              type='submit'
              disabled={useUIStore((state) => state.loading.auth)}
              className='w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6'
            >
              {useUIStore((state) => state.loading.auth) ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Forgot your password?{" "}
              <button onClick={handleForgotPassword} className="text-blue-500 hover:text-blue-400 font-medium">
                Reset Password
              </button>
            </p>
          </div> 

          <div className='mt-6 text-center'>
            <p className='text-gray-400 text-sm'>
              Don't have an account?{" "}
              <a href='/signup' className='text-blue-500 hover:text-blue-400 font-medium'>
                Sign up
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

export default Login;