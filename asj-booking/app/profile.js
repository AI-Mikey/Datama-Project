import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import Navbar from '../components/Navbar';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push('/login');
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };

    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center p-4 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-lg"><strong>Email:</strong> {user?.email}</p>
            <button
              onClick={handleLogout}
              className="mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
