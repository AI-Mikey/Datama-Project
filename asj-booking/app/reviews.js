import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import Navbar from '../components/Navbar';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Reviews() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push('/');
      } else {
        setUser(data.user);
        fetchReviews();
      }
    };
    checkUser();
  }, []);

  const fetchReviews = async () => {
    const { data, error } = await supabase.from('reviews').select('*');
    if (error) {
      console.error('Error fetching reviews:', error.message);
    } else {
      setReviews(data);
    }
  };

  const submitReview = async () => {
    if (!reviewText) {
      setMessage('Please enter a review.');
      return;
    }

    const { error } = await supabase.from('reviews').insert([
      { user_id: user.id, review: reviewText, rating }
    ]);

    if (error) {
      setMessage('Error submitting review.');
    } else {
      setMessage('Review submitted!');
      setReviewText('');
      fetchReviews();
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center p-4 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Guest Reviews</h1>
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-lg font-semibold mb-2">Leave a Review</h2>
          <textarea
            className="w-full p-2 border rounded mb-3"
            placeholder="Write your review..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
          <label className="block mb-2">Rating:</label>
          <select
            className="w-full p-2 border rounded mb-3"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>{r} Stars</option>
            ))}
          </select>
          <button
            onClick={submitReview}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Submit Review
          </button>
          {message && <p className="mt-3 text-center text-green-500">{message}</p>}
        </div>

        <h2 className="text-xl font-semibold mt-6">All Reviews</h2>
        <div className="w-full max-w-md mt-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-4 rounded-lg shadow-md mb-3">
              <p className="text-gray-700">{review.review}</p>
              <p className="text-yellow-500">⭐ {review.rating} Stars</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
