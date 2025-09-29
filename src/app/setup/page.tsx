'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function SetupPage() {
  const [email, setEmail] = useState('kylee@blog.com')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('Kylee Champion')
  const [setupKey, setSetupKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, setupKey }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: data.message })
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Setup failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Admin Setup</CardTitle>
            <CardDescription>
              Set up your admin account for Kylee's Bible Blog
            </CardDescription>
          </CardHeader>
          <CardContent>
            {message && (
              <div className={`mb-4 p-3 rounded-md border ${message.type === 'error' ? 'border-red-500 bg-red-50 text-red-700' : 'border-green-500 bg-green-50 text-green-700'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSetup} className="space-y-4">
              <div>
                <Label htmlFor="setupKey">Setup Key</Label>
                <Input
                  id="setupKey"
                  type="password"
                  value={setupKey}
                  onChange={(e) => setSetupKey(e.target.value)}
                  placeholder="Enter setup key"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Contact developer for setup key
                </p>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure password (8+ characters)"
                  required
                />
              </div>

              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Setting up...' : 'Create Admin Account'}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                After setup, go to{' '}
                <a href="/admin" className="text-primary hover:underline">
                  /admin
                </a>{' '}
                to log in
              </p>
              <div className="text-xs text-muted-foreground border-t pt-2">
                <p className="font-semibold">Production Note:</p>
                <p>Set ALLOW_ADMIN_SETUP=true in environment variables</p>
                <p>Or use: npm run create-admin in server console</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}