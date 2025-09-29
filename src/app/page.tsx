import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Metadata } from "next"
import { HomeContent } from "@/components/home-content"

// Force static rendering for better performance
export const dynamic = 'force-static'
export const revalidate = 300 // Revalidate every 5 minutes

export const metadata: Metadata = {
  title: "Kylee's Bible Blog - Bible Study Journey & Christian Insights",
  description: "Join Kylee's Bible study journey. Discover in-depth biblical insights, spiritual reflections, and practical applications of God's word. Support ministry goals and grow in faith together.",
  keywords: ["Bible study", "Christian blog", "biblical insights", "faith journey", "Scripture study", "spiritual growth", "ministry", "Christian community"],
  openGraph: {
    title: "Kylee's Bible Blog - Bible Study Journey & Christian Insights",
    description: "Join Kylee's Bible study journey. Discover in-depth biblical insights, spiritual reflections, and practical applications of God's word.",
    type: "website",
    locale: "en_US",
    siteName: "Kylee's Bible Blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kylee's Bible Blog - Bible Study Journey & Christian Insights",
    description: "Join Kylee's Bible study journey. Discover biblical insights and spiritual reflections.",
  },
  alternates: {
    canonical: "/",
  },
}

export default function Home() {

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Kylee's Blog</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Join me on my Bible study journey as I explore God&apos;s word, share insights,
          and grow in faith. Together, we can support ministry goals and build community.
        </p>
      </div>

      {/* Dynamic Content */}
      <HomeContent />
    </div>
  )
}