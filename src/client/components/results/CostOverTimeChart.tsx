import React, { forwardRef, memo, useRef, useImperativeHandle } from 'react';
import {
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area
} from 'recharts';


interface DataPoint {
  time: number;
  traditionalCost: number;
  traditionalCostUpper: number;
  traditionalCostLower: number;
  agenticCost: number;
  agenticCostUpper: number;
  agenticCostLower: number;
}

interface CostOverTimeChartProps {
  traditionalTime?: number; // Made optional
  traditionalCost?: number; // Made optional
  agenticTime: number;
  agenticCost: number;
  errorMargin?: number; // Percentage (0-100)
  isOngoing?: boolean; // Whether this is an ongoing operations run cost chart
}

export interface CostChartRef {
  getSvgElement: () => SVGElement | null;
}

const CostOverTimeChartComponent: React.ForwardRefRenderFunction<CostChartRef, CostOverTimeChartProps> = (
  { traditionalTime, traditionalCost, agenticTime, agenticCost, errorMargin = 10, isOngoing = false },
  ref
) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    getSvgElement: () => containerRef.current?.querySelector('.recharts-wrapper svg') ?? null
  }));

  // Determine time unit based on available data or context
  const timeUnit = isOngoing ? 'months' : (traditionalTime !== undefined && traditionalTime < 9 ? 'hours' : 'days');
  const timeMultiplier = isOngoing ? 1 : (traditionalTime !== undefined && traditionalTime < 9 ? 1 : 1/8);

  // Calculate error margins
  const errorMultiplier = errorMargin / 100;

  // Generate data points for the chart
  const generateDataPoints = (): DataPoint[] => {
    const dataPoints: DataPoint[] = [];

    // Determine the maximum time to show on the chart
    let maxTime: number;
    if (isOngoing) {
      maxTime = 36; // Show 3 years for ongoing
    } else if (traditionalTime !== undefined) {
      maxTime = Math.max(traditionalTime, agenticTime) * 1.1;
    } else {
      maxTime = agenticTime * 1.1; // Use only agentic time if traditional is not provided
    }

    // Calculate rates based on time period
    // Note: traditionalCost and agenticCost are used directly in calculations below

    // Generate data points with 3-month increments for ongoing costs
    const numPoints = isOngoing ? 12 : 15; // 12 points for 36 months (3-year timeline), or 15 points for project
    const timeStep = isOngoing ? 3 : (maxTime / numPoints);

    for (let i = 0; i <= numPoints; i++) {
      const time = i * timeStep;
      const displayTime = time * timeMultiplier; // Convert to days if needed

      // Calculate costs at this time point
      let currentTraditionalCost = 0; // Initialize with 0
      let currentAgenticCost;

      if (traditionalCost !== undefined) { // Only calculate if traditionalCost is provided
        if (isOngoing) {
          // For ongoing costs, accumulate monthly costs
          currentTraditionalCost = traditionalCost * (time / maxTime); // Scale by progress
        } else if (traditionalTime !== undefined) {
          // For one-off projects, use time-based completion
          currentTraditionalCost = traditionalCost * Math.min(time / traditionalTime, 1);
        }
      }

      // Calculate agentic cost
      if (isOngoing) {
        currentAgenticCost = agenticCost * (time / maxTime); // Scale by progress
      } else {
        currentAgenticCost = agenticCost * Math.min(time / agenticTime, 1);
      }

      dataPoints.push({
        time: Math.round(displayTime), // Round to whole numbers
        traditionalCost: currentTraditionalCost,
        traditionalCostUpper: currentTraditionalCost * (1 + errorMultiplier),
        traditionalCostLower: currentTraditionalCost * (1 - errorMultiplier),
        agenticCost: currentAgenticCost,
        agenticCostUpper: currentAgenticCost * (1 + errorMultiplier),
        agenticCostLower: currentAgenticCost * (1 - errorMultiplier)
      });
    }

    return dataPoints;
  };

  const data = generateDataPoints();

  const formatTooltipCurrency = (value: number, currency: 'USD' | 'AUD') => {
    return new Intl.NumberFormat('en-' + (currency === 'USD' ? 'US' : 'AU'), {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.round(value));
  };

  const formatTooltip = (value: number, name: string) => {
    // Only format if the value is actually present and relevant
    if (value === undefined || value === null || (name.startsWith('traditional') && traditionalCost === undefined)) {
       return null; // Don't show tooltip entry if data is missing or traditional is not provided
    }

    const usdValue = value * 0.66; // Approximate AUD to USD conversion

    // Map internal names to display names
    const nameMap: { [key: string]: string } = {
      'traditionalCost': 'Traditional',
      'traditionalCostUpper': 'Traditional Upper',
      'traditionalCostLower': 'Traditional Lower',
      'agenticCost': 'Agentic',
      'agenticCostUpper': 'Agentic Upper',
      'agenticCostLower': 'Agentic Lower'
    };

    const displayName = nameMap[name] || name;
    const formattedValue = `${formatTooltipCurrency(value, 'AUD')} AUD / ${formatTooltipCurrency(usdValue, 'USD')} USD`;

    return [formattedValue, displayName];
  };

  // Filter legend items based on whether traditionalCost is provided
  const renderLegend = (props: any) => {
    const { payload } = props;
    const filteredPayload = payload.filter((entry: any) => {
      if (entry.dataKey?.startsWith('traditional') && traditionalCost === undefined) {
        return false; // Hide traditional legend items if no traditional cost
      }
      // Hide lower bound legend items by default as they share color
      if (entry.dataKey?.endsWith('Lower')) {
         return false;
      }
       // Map internal names to display names for Legend
       const nameMap: { [key: string]: string } = {
         'traditionalCost': 'Traditional Cost',
         'traditionalCostUpper': 'Traditional Error Margin',
         'agenticCost': 'Agentic Cost',
         'agenticCostUpper': 'Agentic Error Margin'
       };
       entry.value = nameMap[entry.dataKey] || entry.value;
       // Use a specific color for error margin legend
       if (entry.dataKey?.endsWith('Upper')) {
         entry.color = entry.dataKey?.startsWith('traditional') ? '#FCA5A5' : '#93C5FD'; // Lighter shades for error margin
       }

      return true;
    });

    return <Legend payload={filteredPayload} />;
  };


  return (
    <div ref={containerRef} className="w-full h-[400px]">
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 90, // Increased left margin to accommodate labels
            bottom: 5
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            label={{
              value: `Time (${timeUnit})`,
              position: 'insideBottomRight',
              offset: -5
            }}
            tick={{ fill: '#4B5563' }}
            tickLine={{ stroke: '#4B5563' }}
            ticks={isOngoing ? [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36] : undefined}
          />
          <YAxis
            label={{
              value: 'Cost (AUD)',
              angle: -90,
              offset: -50, // Move label further left
              position: 'insideLeft',
              style: { fontSize: '12px' } // Reduce font size
            }}
            width={100} // Set fixed width for Y-axis
            tick={{ fill: '#4B5563' }}
            tickLine={{ stroke: '#4B5563' }}
            // Format Y-axis labels more concisely with whole numbers
            tickFormatter={(value) => {
              const aud = Math.round(value).toLocaleString('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
              return aud;  // Only show AUD for axis labels to save space
            }}
          />
          <Tooltip
            formatter={formatTooltip}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem'
            }}
          />
          {/* Use custom legend renderer, positioned at the bottom center */}
          <Legend
            content={renderLegend}
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: '20px' }} // Add spacing below chart
          />

          {/* Conditionally render Traditional Cost areas */}
          {traditionalCost !== undefined && (
            <>
              {/* Traditional Cost Upper Error Margin */}
              <Area
                type="monotone"
                dataKey="traditionalCostUpper"
                stroke="#FCA5A5" // Lighter red for error bound line
                strokeWidth={1} // Thinner line for error bound
                strokeDasharray="5 5"
                fill="none"
                dot={false}
                activeDot={false}
                name="Traditional Error Margin" // Consistent name
                legendType="line" // Represent as line in legend
                isAnimationActive={false}
              />
              {/* Traditional Cost */}
              <Area
                type="monotone"
                dataKey="traditionalCost"
                stroke="#EF4444" // Main red
                strokeWidth={2}
                fill="#FECACA" // Light red fill
                fillOpacity={0.3}
                dot={{ stroke: '#EF4444', strokeWidth: 0.5, r: 3 }}
                activeDot={{ stroke: '#EF4444', strokeWidth: 2, r: 5 }}
                name="Traditional Cost"
                isAnimationActive={false}
              />
              {/* Traditional Cost Lower Error Margin (for fill, not distinct line) */}
              <Area
                 type="monotone"
                 dataKey="traditionalCostLower"
                 stroke="none" // No line
                 fill="#FECACA" // Same fill as main area
                 fillOpacity={0.3}
                 dot={false}
                 activeDot={false}
                 legendType="none" // Hide from legend
                 isAnimationActive={false}
               />
            </>
          )}

          {/* Agentic Cost Upper Error Margin */}
           <Area
             type="monotone"
             dataKey="agenticCostUpper"
             stroke="#93C5FD" // Lighter blue for error bound line
             strokeWidth={1} // Thinner line
             strokeDasharray="5 5"
             fill="none"
             dot={false}
             activeDot={false}
             name="Agentic Error Margin" // Consistent name
             legendType="line" // Represent as line
             isAnimationActive={false}
           />

           {/* Agentic Cost */}
           <Area
             type="monotone"
             dataKey="agenticCost"
             stroke="#3B82F6" // Main blue
             strokeWidth={2}
             fill="#BFDBFE" // Light blue fill
             fillOpacity={0.4} // Slightly more opaque
             dot={{ stroke: '#3B82F6', strokeWidth: 0.5, r: 3 }}
             activeDot={{ stroke: '#3B82F6', strokeWidth: 2, r: 5 }}
             name="Agentic Cost"
             isAnimationActive={false}
           />
          {/* Agentic Cost Lower Error Margin (for fill) */}
           <Area
             type="monotone"
             dataKey="agenticCostLower"
             stroke="none" // No line
             fill="#BFDBFE" // Same fill as main area
             fillOpacity={0.4}
             dot={false}
             activeDot={false}
             legendType="none" // Hide from legend
             isAnimationActive={false}
           />

          {/* Reference lines */}
          {isOngoing ? (
            <>
              {/* Add reference lines for each year */}
              {traditionalCost !== undefined && [12, 24, 36].map(months => (
                <ReferenceLine
                  key={`trad-${months}`}
                  y={traditionalCost * months}
                  stroke="#EF4444"
                  strokeDasharray="3 3"
                  label={{
                    value: `Traditional Year ${months/12}`,
                    position: 'right',
                    fill: '#EF4444',
                    fontSize: 12
                  }}
                />
              ))}
              {/* Add Agentic reference lines for each year */}
              {[12, 24, 36].map(months => (
                <ReferenceLine
                  key={`agentic-${months}`}
                  y={agenticCost * months}
                  stroke="#3B82F6"
                  strokeDasharray="3 3"
                  label={{
                    value: `Agentic Year ${months/12}`,
                    position: 'right',
                    fill: '#3B82F6',
                    fontSize: 12
                  }}
                />
              ))}
            </>
          ) : (
            <>
              {/* Conditionally render Traditional Complete Reference Line */}
              {traditionalTime !== undefined && (
                <ReferenceLine
                  x={traditionalTime * timeMultiplier}
                  stroke="#EF4444"
                  strokeDasharray="3 3"
                  label={{
                    value: 'Traditional Complete',
                    position: 'top',
                     fill: '#EF4444', // Added fill color
                     fontSize: 12    // Added font size
                  }}
                />
              )}
              {/* Always render Agentic Complete Reference Line */}
              <ReferenceLine
                x={agenticTime * timeMultiplier}
                stroke="#3B82F6"
                strokeDasharray="3 3"
                label={{
                  value: 'Agentic Complete',
                  position: 'top',
                  fill: '#3B82F6',
                  fontSize: 12
                }}
              />
            </>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Create the forwarded ref and memoized component
export const CostOverTimeChart = memo(forwardRef(CostOverTimeChartComponent));
CostOverTimeChart.displayName = 'CostOverTimeChart';
