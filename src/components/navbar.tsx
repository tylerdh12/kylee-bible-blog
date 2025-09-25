"use client"

import Link from "next/link"
import { ThemeToggle } from "./theme-provider"
import { Button } from "./ui/button"

export function Navbar() {
  return (
    <nav className="border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold">
              Kylee&apos;s Blog
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">
                Home
              </Link>
              <Link href="/posts" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">
                Posts
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">
                About
              </Link>
              <Link href="/goals" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">
                Goals
              </Link>
              <Link href="/donate" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">
                Donate
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/admin">
              <Button variant="outline" size="sm">
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}