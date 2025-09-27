import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Donate - Support Kylee's Bible Study Ministry",
  description: "Support Kylee's ministry through donations. Help further Bible study resources, ministry outreach, and spreading God's love in the community. Every contribution makes a meaningful difference.",
  keywords: ["donate", "Christian giving", "ministry support", "Bible study funding", "Christian donations", "ministry goals"],
  openGraph: {
    title: "Donate - Support Kylee's Bible Study Ministry",
    description: "Support Kylee's ministry through donations. Help further Bible study resources, ministry outreach, and spreading God's love in the community.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Donate - Support Kylee's Bible Study Ministry",
    description: "Support Kylee's ministry through donations. Help further Bible study resources and ministry outreach.",
  },
}

export default function DonateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}