"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react"

export function SectionCards({ selectedCountries = [], selectedYear, data = {} }) {
  const countryCount = selectedCountries.length
  const dataCoverage = Object.keys(data).length

  return (
    <div
      className="grid grid-cols-1 gap-3 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4 lg:px-6 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card min-w-0">
        <CardHeader className="p-4 pb-3 lg:p-5 lg:pb-3">
          <CardDescription>Tracked Countries</CardDescription>
          <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl xl:text-3xl">
            {countryCount}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon />
              Selected
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs lg:text-sm p-4 pt-0 lg:p-5 lg:pt-0">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Countries included in this view{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Based on your current dashboard selection
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card min-w-0">
        <CardHeader className="p-4 pb-3 lg:p-5 lg:pb-3">
          <CardDescription>Reference Year</CardDescription>
          <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl xl:text-3xl">
            {selectedYear || 'N/A'}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon />
              Active year
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs lg:text-sm p-4 pt-0 lg:p-5 lg:pt-0">
          <div className="line-clamp-1 flex gap-2 font-medium">
            All charts use this year{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Every indicator below is filtered to the selected year
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card min-w-0">
        <CardHeader className="p-4 pb-3 lg:p-5 lg:pb-3">
          <CardDescription>Data Coverage</CardDescription>
          <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl xl:text-3xl">
            {dataCoverage}/{countryCount || 1}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon />
              {countryCount > 0 && dataCoverage === countryCount ? 'Complete' : 'Partial'}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs lg:text-sm p-4 pt-0 lg:p-5 lg:pt-0">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Data available for selected countries{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Shows how many selected countries have usable data</div>
        </CardFooter>
      </Card>
      <Card className="@container/card min-w-0">
        <CardHeader className="p-4 pb-3 lg:p-5 lg:pb-3">
          <CardDescription>Scenario Readiness</CardDescription>
          <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl xl:text-3xl">
            {countryCount > 0 ? 'Ready' : 'Waiting'}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {countryCount > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              {countryCount > 0 ? 'Ready to explore' : 'Select countries'}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs lg:text-sm p-4 pt-0 lg:p-5 lg:pt-0">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {countryCount > 0 ? 'You can now explore the dashboard' : 'Choose countries to begin'}{" "}
            {countryCount > 0 ? <TrendingUpIcon className="size-4" /> : <TrendingDownIcon className="size-4" />}
          </div>
          <div className="text-muted-foreground">Scroll down to view charts and comparisons</div>
        </CardFooter>
      </Card>
    </div>
  );
}
