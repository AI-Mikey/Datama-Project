"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import Navbar from '../components/Navbar';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase.from('properties').select('*');
      if (error) {
        console.error('Error fetching properties:', error.message);
      } else {
        setProperties(data);
      }
    };
    fetchProperties();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center p-4 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Explore Backpacker Stays</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-white p-4 rounded-lg shadow-md">
              <img src={property.image_url} alt={property.name} className="w-full h-40 object-cover rounded-md" />
              <h2 className="text-xl font-semibold mt-2">{property.name}</h2>
              <p className="text-gray-600">{property.location}</p>
              <p className="text-gray-800 font-bold mt-1">${property.price_per_night} / night</p>
              <Link href="/bookings">
                <button className="mt-3 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                  Book Now
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
