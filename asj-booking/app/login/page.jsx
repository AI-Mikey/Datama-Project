"use client";

import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
        <h1 className="text-3xl font-bold mb-4">Welcome to ASJ Backpackers!</h1>
        <p className="text-lg">Book your next adventure with us.</p>
      </div>
    </div>
  );
}
