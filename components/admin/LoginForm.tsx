import React from 'react';
import { useForm } from 'react-hook-form';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

type LoginFormData = {
  email: string;
  password: string;
};

export const LoginForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const { login } = useFirebaseAuth();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
    } catch (error) {
      console.error('Login failed:', error);
      // Handle login error (show message to user)
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input
          {...register('email', { required: 'Email is required' })}
          type="email"
          placeholder="Email"
          className="w-full p-2 bg-gray-700 text-white rounded"
        />
        {errors.email && <span className="text-red-500">{errors.email.message}</span>}
      </div>
      <div>
        <input
          {...register('password', { required: 'Password is required' })}
          type="password"
          placeholder="Password"
          className="w-full p-2 bg-gray-700 text-white rounded"
        />
        {errors.password && <span className="text-red-500">{errors.password.message}</span>}
      </div>
      <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">
        Login
      </button>
    </form>
  );
};