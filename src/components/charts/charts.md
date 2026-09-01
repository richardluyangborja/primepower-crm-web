# FROM SHADCN DOCS

Introducing Charts. A collection of chart components that you can copy and paste into your apps.

Charts are designed to look great out of the box. They work well with the other components and are fully customizable to fit your project.

We use Recharts under the hood.

We designed the chart component with composition in mind. You build your charts using Recharts components and only bring in custom components, such as ChartTooltip, when and where you need it.

We do not wrap Recharts. This means you're not locked into an abstraction. When a new Recharts version is released, you can follow the official upgrade path to upgrade your charts.

The components are yours.

Updating to Recharts v3

If you're updating older chart code to Recharts v3:

- Use var(--chart-1) instead of hsl(var(--chart-1)) when you reference chart tokens from your CSS variables.
- Use ChartTooltip.defaultIndex for initial tooltip state only. Keep persistent active shapes in your own chart state.
- Remove layout from <Bar> when the parent <BarChart> already defines it.
- Keep a height, min-h-_, or aspect-_ on ChartContainer so ResponsiveContainer can measure on first render.

Important: Remember to set a min-h-[VALUE] on the ChartContainer component. This is required for the chart to be sresponsive.
