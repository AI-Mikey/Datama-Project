import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import Navbar from './components/Navbar';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Bookings() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState('');

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

  const handleBooking = async () => {
    if (!date) {
      setMessage('Please select a date.');
      return;
    }

    const { data, error } = await supabase.from('bookings').insert([
      { user_id: user.id, date, guests }
    ]);

    if (error) {
      setMessage('Error booking. Try again.');
    } else {
      setMessage('Booking successful!');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Book Your Stay</h1>
        {user ? (
          <>
            <label className="block mb-2">Select Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 mb-3 border rounded"
            />
            <label className="block mb-2">Number of Guests:</label>
            <input
              type="number"
              value={guests}
              min="1"
              onChange={(e) => setGuests(e.target.value)}
              className="w-full p-2 mb-3 border rounded"
            />
            <button
              onClick={handleBooking}
              className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              Book Now
            </button>
            {message && <p className="mt-3 text-center text-red-500">{message}</p>}
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}

export default function Bookings() {
    return (
      <div>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
          <h1 className="text-2xl font-bold mb-4">Book Your Stay</h1>
          <p>Select your dates and confirm your booking.</p>
        </div>
      </div>
    );
  }