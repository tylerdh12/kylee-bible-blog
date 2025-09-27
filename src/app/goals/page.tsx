import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Ministry Goals - Support Kylee's Bible Study Mission",
  description: "Support Kylee's ministry goals and help further God's work. View current fundraising goals for Bible study resources, ministry outreach, and spreading God's love in the community.",
  keywords: ["ministry goals", "Christian fundraising", "Bible study support", "ministry donations", "Christian giving", "spiritual support"],
  openGraph: {
    title: "Ministry Goals - Support Kylee's Bible Study Mission",
    description: "Support Kylee's ministry goals and help further God's work. View current fundraising goals for Bible study resources and ministry outreach.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ministry Goals - Support Kylee's Bible Study Mission",
    description: "Support Kylee's ministry goals and help further God's work through Bible study resources and ministry outreach.",
  },
}

async function getGoals() {
  return prisma.goal.findMany({
    include: {
      donations: true,
    },
    orderBy: [
      { completed: 'asc' },
      { createdAt: 'desc' },
    ],
  })
}

export default async function GoalsPage() {
  const goals = await getGoals()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Ministry Goals</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Support Kylee&apos;s Bible study journey and ministry goals. Every contribution 
          helps further God&apos;s work and spreads His love.
        </p>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No goals have been set yet.</p>
            <p className="text-sm text-muted-foreground">Check back soon for upcoming ministry goals!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal: any) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100
            
            return (
              <Card key={goal.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="line-clamp-2">{goal.title}</CardTitle>
                    {goal.completed && (
                      <Badge variant="default" className="ml-2">
                        Completed
                      </Badge>
                    )}
                  </div>
                  {goal.description && (
                    <CardDescription className="line-clamp-3">
                      {goal.description}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">${goal.currentAmount.toFixed(2)}</span>
                      <span className="text-muted-foreground">${goal.targetAmount.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          goal.completed ? 'bg-green-500' : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-muted-foreground">
                        {progress.toFixed(1)}% completed
                      </span>
                      <span className="text-muted-foreground">
                        {goal.donations.length} donor{goal.donations.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {goal.deadline && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">
                        Deadline: {format(new Date(goal.deadline), 'PPP')}
                      </p>
                    </div>
                  )}

                  <div className="mt-auto">
                    {!goal.completed ? (
                      <Link href={`/donate?goal=${goal.id}`}>
                        <Button className="w-full">
                          Support This Goal
                        </Button>
                      </Link>
                    ) : (
                      <Button disabled className="w-full">
                        Goal Completed! 🎉
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <div className="text-center mt-12">
        <Card>
          <CardContent className="py-8">
            <h3 className="text-xl font-semibold mb-4">Want to Support in Other Ways?</h3>
            <p className="text-muted-foreground mb-4">
              You can also support Kylee&apos;s ministry through prayer, sharing her posts, 
              or connecting her with others who might benefit from her Bible studies.
            </p>
            <Link href="/donate">
              <Button variant="outline">
                Make a General Donation
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}