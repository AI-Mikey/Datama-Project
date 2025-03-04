import { useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleRegister = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error('Error registering:', error.message);
    } else {
      alert('Registration successful! Please log in.');
      router.push('/'); // Redirect to login page
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-xl font-bold text-center mb-4">Register</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
        />
        <button
          onClick={handleRegister}
          className="w-full p-2 text-white bg-green-500 rounded hover:bg-green-600"
        >
          Sign Up
        </button>
        <p className="mt-3 text-center">
          Already have an account? <a href="/" className="text-blue-500">Login</a>
        </p>
      </div>
    </div>
  );
}
