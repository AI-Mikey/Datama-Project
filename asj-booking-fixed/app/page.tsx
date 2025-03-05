"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Home, User } from "lucide-react"
import Image from "next/image"

export default function HomePage() {
  const router = useRouter()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-secondary/10 to-white">
      <div className="max-w-5xl w-full text-center mb-8">
        <div className="flex justify-center mb-6">
          <div className="relative h-32 w-32">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/asj.bg.jpg-uZ2fnMR2lDBxdj4sSGVLJ9lgOnZKlo.jpeg"
              alt="ASJ Backpackers Place"
              fill
              className="object-contain"
            />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-4 text-primary">
          Welcome to ASJ Backpackers Place
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Find your perfect stay or list your property with us.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card className="w-full border-secondary/20 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <User className="h-6 w-6" />
              Guest Mode
            </CardTitle>
            <CardDescription>Browse and book properties for your next stay</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              As a guest, you can browse available properties, make bookings, and leave reviews for your stays.
            </p>
          </CardContent>
          <CardFooter className="flex gap-4">
            <Button onClick={() => router.push("/auth/login?type=guest")} variant="outline" className="w-full">
              Login
            </Button>
            <Button onClick={() => router.push("/auth/register?type=guest")} className="w-full">
              Register
            </Button>
          </CardFooter>
        </Card>

        <Card className="w-full border-secondary/20 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Home className="h-6 w-6" />
              Host Mode
            </CardTitle>
            <CardDescription>List and manage your properties</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              As a host, you can list your properties, manage bookings, and view reviews from guests.
            </p>
          </CardContent>
          <CardFooter className="flex gap-4">
            <Button onClick={() => router.push("/auth/login?type=host")} variant="outline" className="w-full">
              Login
            </Button>
            <Button onClick={() => router.push("/auth/register?type=host")} className="w-full">
              Register
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}

