'use client'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Settings } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { UserButton } from "@clerk/nextjs"

export default function NavBar() {
  const { isSignedIn } = useAuth()
  return (
    <div className="bg-white border-b py-3 px-4 flex justify-between items-center">
      <Link href="/" className="text-lg font-semibold flex items-center gap-2">
        <span className="hidden sm:inline">Coupon System</span>
      </Link>

      <div className="flex gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/" className="flex items-center gap-1">
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
        </Button>

        {isSignedIn ? (<UserButton afterSignOutUrl="/" />) :
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin" className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              <span>Admin</span>
            </Link>
          </Button>}
      </div>
    </div>
  )
}

