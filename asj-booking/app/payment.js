import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import Navbar from '../components/Navbar';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Payment() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [booking, setBooking] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push('/');
      } else {
        setUser(data.user);
        fetchBooking(data.user.id);
      }
    };
    checkUser();
  }, []);

  const fetchBooking = async (userId) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      setMessage('No booking found.');
    } else {
      setBooking(data);
    }
  };

  const handlePayment = async () => {
    if (!booking) return;

    const { error } = await supabase.from('payments').insert([
      { user_id: user.id, booking_id: booking.id, status: 'Paid' }
    ]);

    if (error) {
      setMessage('Payment failed. Try again.');
    } else {
      setMessage('Payment successful!');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center p-4 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Confirm Your Payment</h1>
        {booking ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-lg">Booking Date: {booking.date}</p>
            <p className="text-lg">Guests: {booking.guests}</p>
            <button
              onClick={handlePayment}
              className="mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            >
              Pay Now
            </button>
            {message && <p className="mt-3 text-red-500">{message}</p>}
          </div>
        ) : (
          <p>Loading booking details...</p>
        )}
      </div>
    </div>
  );
}
