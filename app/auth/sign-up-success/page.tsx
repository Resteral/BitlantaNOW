import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl font-mono text-center">WELCOME TO BITLANTA!</CardTitle>
            <CardDescription className="text-center">Check your email to confirm your citizenship</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              You&apos;ve successfully registered as a citizen of Bitlanta. Please check your email to confirm your
              account before accessing the lost city.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
