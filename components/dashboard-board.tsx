"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Zap, Users, Activity, DollarSign } from "lucide-react"

interface DashboardBoardProps {
  userLevel: number
  experience: number
  hasSubscription: boolean
  accessCount: number
}

export function DashboardBoard({ userLevel, experience, hasSubscription, accessCount }: DashboardBoardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <Card className="bg-card/80 backdrop-blur-sm border-primary/30 underwater-float">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium font-mono hologram-effect">ATLANTEAN TREASURY</CardTitle>
          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-primary atlantis-glow" />
        </CardHeader>
        <CardContent className="pb-3 sm:pb-4">
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary font-mono atlantis-glow">
            $42,069.00
          </div>
          <p className="text-xs text-muted-foreground">+20.1% from last tide</p>
          <Progress value={75} className="mt-2" />
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm border-secondary/30 underwater-float">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium font-mono hologram-effect">ACTIVE ATLANTEANS</CardTitle>
          <Users className="h-3 w-3 sm:h-4 sm:w-4 text-secondary atlantis-glow" />
        </CardHeader>
        <CardContent className="pb-3 sm:pb-4">
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-secondary font-mono atlantis-glow">
            {accessCount + 127}
          </div>
          <p className="text-xs text-muted-foreground">+{accessCount} new entries today</p>
          <Progress value={60} className="mt-2" />
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm border-accent/30 underwater-float">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium font-mono hologram-effect">ETHEREAL POWER</CardTitle>
          <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-accent atlantis-glow" />
        </CardHeader>
        <CardContent className="pb-3 sm:pb-4">
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-accent font-mono atlantis-glow">
            {experience}
          </div>
          <p className="text-xs text-muted-foreground">Energy level {userLevel}</p>
          <Progress value={(experience % 1000) / 10} className="mt-2" />
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm border-primary/30 underwater-float">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium font-mono hologram-effect">MARKET ACTIVITY</CardTitle>
          <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-primary atlantis-glow" />
        </CardHeader>
        <CardContent className="pb-3 sm:pb-4">
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary font-mono atlantis-glow">94.2%</div>
          <p className="text-xs text-muted-foreground">Depth scanner active</p>
          <Progress value={94} className="mt-2" />
        </CardContent>
      </Card>
    </div>
  )
}
