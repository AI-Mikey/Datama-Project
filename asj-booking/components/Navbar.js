"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">ASJ Backpackers</h1>
      <div className="space-x-4">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/bookings">Bookings</Link>
        <Link href="/home">Home</Link>
        <Link href="/payment">Payment</Link>
        <Link href="/reviews">Reviews</Link>
        <Link href="/profile">Profile</Link>
        <button 
          onClick={handleLogout} 
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
