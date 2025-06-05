import React from 'react';
import { 
  BarChart as RechartsBarChart,
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface BarChartProps {
  data: Array<Record<string, any>>;
  xAxisDataKey: string;
  bars: {
    dataKey: string;
    color: string;
    name?: string;
  }[];
  height?: number;
  stacked?: boolean;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium text-gray-700">{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

const BarChart: React.FC<BarChartProps> = ({
  data,
  xAxisDataKey,
  bars,
  height = 300,
  stacked = false,
}) => {
  return (
    <div className="w-full h-full bg-white rounded-lg p-4">
      <ResponsiveContainer width="100%\" height={height}>
        <RechartsBarChart
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey={xAxisDataKey}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {bars.map((bar, index) => (
            <Bar
              key={index}
              dataKey={bar.dataKey}
              name={bar.name || bar.dataKey}
              fill={bar.color}
              stackId={stacked ? 'stack' : undefined}
              radius={stacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;