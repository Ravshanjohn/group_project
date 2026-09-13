'use client'
import { useState } from "react";
import HandleSignUp from "./signup_components/HandleSignUp";
import PasswordStrength from "./signup_components/PasswordStrength";
import { auth_store } from "@/src/stores/auth.store";
import { toast } from "react-hot-toast";
import {Mail, Lock, User, Eye, EyeOff} from "lucide-react";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import { useUIStore } from "@/src/stores/ui.store";


const Signup = () => {
  interface FormData {
    first_name: string;
    last_name: string | null;
    email: string;
    password: string;
    confirmPassword: string;
  };

  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [showPasswords, setShowPasswords] = useState(false);

  const { signup, resendVerificationEmail } = auth_store();
  const { validateForm, getStrength } = HandleSignUp();

  const handleVerifyEmail = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if(!formData.email) {
      toast.error("Please enter your email to resend verification email");
      return;
    }
    await resendVerificationEmail(formData.email);
    return;
  };


  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    const success = validateForm(formData);

    if (getStrength(formData.password) < 3) {
      toast.error("Password is too weak");
      return;
    }

    // If form validation fails, prevent submission
    if(!success) return;

    useUIStore.getState().setLoading('auth', true);
    try {
      await signup(
        formData.first_name,
        formData.last_name || "",
        formData.email,
        formData.password,
        formData.confirmPassword
      );
    } finally {
      useUIStore.getState().setLoading('auth', false);
    }
    return;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const formFields = [
    { name: 'first_name',  type: 'text', icon: User, placeholder: 'First Name', isPassword: false },
    { name: 'last_name',  type: 'text', icon: User, placeholder: 'Last Name (Optional)', optional: true, isPassword: false },
    { name: 'email',  type: 'email', icon: Mail, placeholder: 'Email', isPassword: false },
    { name: 'password',  type: 'password', icon: Lock, placeholder: 'Password', showStrength: true, isPassword: true },
    { name: 'confirmPassword',  type: 'password', icon: Lock, placeholder: 'Confirm Password', isPassword: true },
  ];

  return (
    <div className='w-full min-h-screen flex flex-row'>
      
      {/* Left Side - 3/5 for Logo and Pictures */}
      <div className="w-4/7 bg-gray-900 flex items-center justify-center">
        <div className="text-white text-4xl">
          {/* Add your logo and pictures here later */}
          Logo & Pictures
        </div>
      </div>

      {/* Right Side - 2/5 for Signup Form */}
      <div className='w-3/7 min-h-screen bg-gray-800 flex items-center justify-center p-8'>
        <div className='w-full'>
          <div className='mb-6 text-center'>
            <h1 className='text-3xl font-bold text-white mb-2'>Create Account</h1>
            <p className='text-gray-400'>Join us today!</p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            {formFields.map((field) => {
              const Icon = field.icon;
              const value = formData[field.name as keyof FormData];
              const isPasswordField = field.isPassword;
              const inputType = isPasswordField ? (showPasswords ? 'text' : 'password') : field.type;
              
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
                      className='w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder={field.placeholder}
                    />
                    {isPasswordField && (
                      <button
                        type='button'
                        onClick={() => setShowPasswords(!showPasswords)}
                        className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300'
                      >
                        {showPasswords ? (
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

            <PasswordStrength password={formData.password} />
            

            {/* Submit Button */}
            <button
              type='submit'
              disabled={useUIStore((state) => state.loading.auth)}
              className='w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6'
            >
              {useUIStore((state) => state.loading.auth) ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Didn't receive a verification email?{" "}
              <button onClick={handleVerifyEmail} className="text-blue-500 hover:text-blue-400 font-medium">
                Resend Email
              </button>
            </p>
          </div>

          <div className='mt-6 text-center'>
            <p className='text-gray-400 text-sm'>
              Already have an account?{" "}
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

export default Signup