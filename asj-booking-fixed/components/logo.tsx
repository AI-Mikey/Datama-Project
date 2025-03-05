import Image from "next/image"
import Link from "next/link"

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <div className="relative h-10 w-10">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/asj.bg.jpg-uZ2fnMR2lDBxdj4sSGVLJ9lgOnZKlo.jpeg"
          alt="ASJ Backpackers Place"
          fill
          className="object-contain"
        />
      </div>
      <span className="font-bold text-primary">ASJ Backpackers Place</span>
    </Link>
  )
}

