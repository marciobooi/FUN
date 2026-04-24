"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"

import { getCountryName } from "../data/countryNames"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

const metricOptions = {
  consumptionRaw: {
    label: "Final consumption",
    description: "Final energy consumption in KTOE",
  },
  importsRaw: {
    label: "Imports",
    description: "Energy imports in KTOE",
  },
  productionRaw: {
    label: "Production",
    description: "Domestic energy production in KTOE",
  },
  availableRaw: {
    label: "Available energy",
    description: "Available energy in KTOE",
  },
}

const countryColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

const formatCompactNumber = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "No data"
  }

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

const formatKtoe = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "No data"
  }

  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value)} KTOE`
}

export function ChartAreaInteractive({ selectedCountries = [], selectedYear, data = {} }) {
  const [metricKey, setMetricKey] = React.useState("consumptionRaw")
  const activeMetric = metricOptions[metricKey]

  const chartData = React.useMemo(
    () => selectedCountries.map((countryCode, index) => {
      const countryData = data[countryCode] || {}
      const rawValue = countryData[metricKey]
      const value = Number.isFinite(rawValue) ? rawValue : null

      return {
        countryCode,
        countryName: getCountryName(countryCode),
        value,
        fill: countryColors[index % countryColors.length],
      }
    }),
    [data, metricKey, selectedCountries]
  )

  const countriesWithData = chartData.filter((item) => item.value !== null)
  const missingCountries = chartData.filter((item) => item.value === null)

  const chartConfig = {
    value: {
      label: activeMetric.label,
      color: "var(--chart-1)",
    },
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Selected Countries Snapshot</CardTitle>
        <CardDescription>
          {activeMetric.description} for {selectedYear || "the selected year"}
        </CardDescription>
        <CardAction className="flex flex-col items-stretch gap-2 sm:items-end">
          <ToggleGroup
            type="single"
            value={metricKey}
            onValueChange={(value) => value && setMetricKey(value)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-3! @[900px]/card:flex"
          >
            <ToggleGroupItem value="consumptionRaw">Consumption</ToggleGroupItem>
            <ToggleGroupItem value="importsRaw">Imports</ToggleGroupItem>
            <ToggleGroupItem value="productionRaw">Production</ToggleGroupItem>
            <ToggleGroupItem value="availableRaw">Available</ToggleGroupItem>
          </ToggleGroup>
          <Select value={metricKey} onValueChange={setMetricKey}>
            <SelectTrigger
              className="flex w-44 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[900px]/card:hidden"
              size="sm"
              aria-label="Select an energy indicator"
            >
              <SelectValue placeholder="Select an indicator" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="consumptionRaw" className="rounded-lg">Final consumption</SelectItem>
              <SelectItem value="importsRaw" className="rounded-lg">Imports</SelectItem>
              <SelectItem value="productionRaw" className="rounded-lg">Production</SelectItem>
              <SelectItem value="availableRaw" className="rounded-lg">Available energy</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
          <BarChart data={chartData} margin={{ top: 8, right: 12, left: 12, bottom: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="countryName"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={0}
              angle={selectedCountries.length > 3 ? -20 : 0}
              textAnchor={selectedCountries.length > 3 ? "end" : "middle"}
              height={selectedCountries.length > 3 ? 56 : 36}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatCompactNumber}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value) => [formatKtoe(value), activeMetric.label]}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.countryName || "Selected country"}
                />
              }
            />
            <Bar dataKey="value" radius={[10, 10, 0, 0]} name={activeMetric.label}>
              {chartData.map((entry) => (
                <Cell key={entry.countryCode} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>
            Showing {countriesWithData.length} of {selectedCountries.length} selected countries with data for {selectedYear || "the selected year"}.
          </p>
          {missingCountries.length > 0 && (
            <p>
              No data for: {missingCountries.map((item) => item.countryName).join(", ")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
