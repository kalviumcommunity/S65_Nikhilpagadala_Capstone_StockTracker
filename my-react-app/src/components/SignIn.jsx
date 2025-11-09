import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const navigate = useNavigate();
  const [apiMessage, setApiMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (formData) => {
    setIsLoading(true);
    setApiMessage(null);

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Store token in localStorage
       localStorage.setItem('accessToken', data.accessToken);
       localStorage.setItem('refreshToken', data.refreshToken);

        setApiMessage({ text: data.message || 'User created successfully!', isError: false });
      setTimeout(() => navigate('/Homepage'), 1000);

      } else {
        setApiMessage({ text: data.error || 'Registration failed', isError: true });
      }
    } catch (error) {
      setApiMessage({ text: 'Registration failed. Please try again.', isError: true });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full md:w-1/2 bg-black text-white p-8 md:p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-3xl font-bold mb-8">Create Account</h1>

          {apiMessage && (
            <div className={`mb-4 p-3 rounded-lg relative ${apiMessage.isError ? 'bg-red-900 text-red-100' : 'bg-green-900 text-green-100'}`}>
              {apiMessage.text}
              <button
                onClick={() => setApiMessage(null)}
                className="absolute top-1 right-2 text-xl hover:text-white"
                aria-label="Close message"
              >
                &times;
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                className={`w-full px-4 py-3 bg-gray-900 text-white rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-700'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter your email"
              />
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
              <input
                type="text"
                {...register('username', { required: 'Username is required' })}
                className={`w-full px-4 py-3 bg-gray-900 text-white rounded-lg border ${errors.username ? 'border-red-500' : 'border-gray-700'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter your Username"
              />
              {errors.username && <p className="mt-1 text-sm text-red-400">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  }
                })}
                className={`w-full px-4 py-3 bg-gray-900 text-white rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-700'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter your password"
              />
              {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-70"
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
