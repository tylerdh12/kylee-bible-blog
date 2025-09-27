import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Kylee - Bible Study Teacher & Christian Writer",
  description: "Learn about Kylee's faith journey and mission to make Bible study accessible to everyone. Discover her passion for biblical truth, spiritual growth, and building Christian community.",
  keywords: ["about Kylee", "Bible study teacher", "Christian writer", "faith journey", "biblical education", "Christian ministry"],
  openGraph: {
    title: "About Kylee - Bible Study Teacher & Christian Writer",
    description: "Learn about Kylee's faith journey and mission to make Bible study accessible to everyone. Discover her passion for biblical truth and spiritual growth.",
    type: "profile",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Kylee - Bible Study Teacher & Christian Writer",
    description: "Learn about Kylee's faith journey and mission to make Bible study accessible to everyone.",
  },
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">About Kylee</h1>
        <p className="text-xl text-muted-foreground">
          Welcome to my corner of the internet where faith meets daily life
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>My Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Hi! I&apos;m Kylee, a passionate Bible student on a journey to understand God&apos;s word more deeply 
              and share what I learn with others. This blog is my way of documenting insights, struggles, 
              and victories as I grow in faith.
            </p>
            <p className="text-muted-foreground mb-4">
              Whether you&apos;re a new believer or have been walking with Christ for years, I hope you&apos;ll 
              find encouragement and biblical truth here that speaks to your heart and draws you closer to our Savior.
            </p>
            <p className="text-muted-foreground">
              I believe that studying God&apos;s word should be accessible to everyone, regardless of their 
              background or level of biblical knowledge. That&apos;s why I write in a way that&apos;s easy to 
              understand while staying true to Scripture.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What You&apos;ll Find Here</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>In-depth Bible studies and verse-by-verse explorations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Personal reflections on how Scripture applies to daily life</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Prayer requests and testimonies of God&apos;s faithfulness</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Resources for deeper Bible study and spiritual growth</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Updates on ministry goals and how you can be involved</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>My Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            My heart&apos;s desire is to help others fall in love with God&apos;s word the way I have. 
            I want to make Bible study approachable, relevant, and transformative for people 
            from all walks of life.
          </p>
          <p className="text-muted-foreground mb-4">
            Through this platform, I hope to build a community where we can grow together, 
            encourage one another, and support each other in our faith journeys. I believe 
            that when we study God&apos;s word together, we gain insights we might miss on our own.
          </p>
          <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
            &ldquo;Your word is a lamp for my feet, a light on my path.&rdquo; - Psalm 119:105
          </blockquote>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Get Involved</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Join the Conversation</h4>
              <p className="text-muted-foreground text-sm mb-4">
                I&apos;d love to hear your thoughts on the posts and studies shared here. 
                Your insights and questions help make this community stronger.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Support the Ministry</h4>
              <p className="text-muted-foreground text-sm mb-4">
                If God has used this ministry to bless you, consider supporting our 
                goals to reach more people with His word.
              </p>
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <Link href="/goals">
              <Button>View Ministry Goals</Button>
            </Link>
            <Link href="/donate">
              <Button variant="outline">Make a Donation</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}