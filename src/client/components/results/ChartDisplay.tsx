import React, { memo, useDebugValue, useMemo, forwardRef, useRef, useImperativeHandle } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ErrorBar,
  Cell
} from 'recharts';
import { ChartDataset } from '@/shared/types/models';
import { formatCurrency } from '../inputs/NumericInput';

interface ChartDisplayProps {
  data: ChartDataset[];
  type: 'cost' | 'time';
}

export interface ChartDisplayRef {
  getSvgElement: () => SVGElement | null;
}

const ChartDisplayComponent: React.ForwardRefRenderFunction<ChartDisplayRef, ChartDisplayProps> = (props, ref) => {
  const { data, type } = props;
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    getSvgElement: () => containerRef.current?.querySelector('.recharts-wrapper svg') ?? null
  }));

  // Debug value to help track renders
  useDebugValue(`ChartDisplay-${type}-${data.length}`);

  // Memoize formatting functions
  const formatValue = useMemo(() => {
    return (value: number) => {
      if (type === 'cost') {
        return formatCurrency(value, 'AUD');
      }
      // Format time values with 1 decimal place and handle singular/plural
      const hours = Number(value).toFixed(1);
      return hours === "1.0" ? "1 hour" : `${hours} hours`;
    };
  }, [type]);

  const formatTooltip = useMemo(() => {
    return (value: number, name: string) => [formatValue(value), name];
  }, [formatValue]);

  // Memoize chart calculations
  const yAxisDomain = useMemo(() => {
    const max = Math.max(...data.map(d => d.value));
    return [0, max * 1.2]; // Add 20% padding to top
  }, [data]);

  return (
    <div ref={containerRef} className="w-full h-[300px] relative">
      <div className="h-full"> {/* Removed transition classes */}
        <ResponsiveContainer>
          <BarChart
            data={data} // Use data prop directly
            margin={{
              top: 20,
              right: 30,
              left: 60, // Increased left margin for currency labels
              bottom: 5
            }}
            barSize={40} // Control bar width
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#4B5563' }}
              tickLine={{ stroke: '#4B5563' }}
            />
            <YAxis
              domain={yAxisDomain}
              tick={{ fill: '#4B5563' }}
              tickLine={{ stroke: '#4B5563' }}
              tickFormatter={(value) => formatValue(value)}
            />
            <Tooltip
              formatter={formatTooltip}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem'
              }}
            />
            <Bar
              dataKey="value"
              fill="#3B82F6" // Default blue color
              fillOpacity={0.9}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.name.toLowerCase().includes('traditional')
                      ? '#EF4444' // Red for traditional
                      : entry.name.toLowerCase().includes('agentic')
                      ? '#3B82F6' // Blue for agentic
                      : '#10B981' // Green for others (time breakdowns)
                  }
                />
              ))}
              <ErrorBar
                dataKey="errorMargin"
                width={4}
                strokeWidth={2}
                stroke="#9CA3AF"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Create the forwarded ref and memoized component
export const ChartDisplay = memo(forwardRef(ChartDisplayComponent));
ChartDisplay.displayName = 'ChartDisplay';
