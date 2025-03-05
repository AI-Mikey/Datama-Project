"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser } from "@/lib/store"
import { useState } from "react"
import { Logo } from "@/components/logo"

export function Navbar() {
  const { userType, email, logout } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  // Don't show navbar on landing page or auth pages
  if (pathname === "/" || pathname.startsWith("/auth")) return null

  const isHost = userType === "host"
  const isGuest = userType === "guest"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo />
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {isHost && (
            <>
              <Link href="/host" className="text-sm font-medium transition-colors hover:text-primary">
                Dashboard
              </Link>
              <Link href="/host/properties" className="text-sm font-medium transition-colors hover:text-primary">
                My Properties
              </Link>
              <Link href="/host/bookings" className="text-sm font-medium transition-colors hover:text-primary">
                Bookings
              </Link>
            </>
          )}

          {isGuest && (
            <>
              <Link href="/guest" className="text-sm font-medium transition-colors hover:text-primary">
                Dashboard
              </Link>
              <Link href="/guest/properties" className="text-sm font-medium transition-colors hover:text-primary">
                Find Properties
              </Link>
              <Link href="/guest/bookings" className="text-sm font-medium transition-colors hover:text-primary">
                My Bookings
              </Link>
            </>
          )}

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              <span className="text-muted-foreground">{email}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </nav>

        {/* Mobile menu button */}
        <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4 grid gap-4">
            {isHost && (
              <>
                <Link
                  href="/host"
                  className="flex items-center gap-2 text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/host/properties"
                  className="flex items-center gap-2 text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Properties
                </Link>
                <Link
                  href="/host/bookings"
                  className="flex items-center gap-2 text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Bookings
                </Link>
              </>
            )}

            {isGuest && (
              <>
                <Link
                  href="/guest"
                  className="flex items-center gap-2 text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/guest/properties"
                  className="flex items-center gap-2 text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Find Properties
                </Link>
                <Link
                  href="/guest/bookings"
                  className="flex items-center gap-2 text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Bookings
                </Link>
              </>
            )}

            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              <span className="text-muted-foreground">{email}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="justify-start">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}

