import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import Navbar from '../../../components/Navbar';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push('/'); // Redirect to login if not authenticated
      } else {
        setUser(data.user);
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/'); // Redirect to login after logout
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        {user ? (
          <>
            <p className="mb-4">Welcome, {user.email}!</p>
            <button
              onClick={handleLogout}
              className="w-full p-2 text-white bg-red-500 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
    return (
      <div>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          <p>Welcome to ASJ Backpackers!</p>
        </div>
      </div>
    );
  }