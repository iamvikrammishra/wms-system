import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  TooltipProps,
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  dataKey?: string;
  nameKey?: string;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
}

const CustomTooltip = ({
  active,
  payload,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium\" style={{ color: payload[0].color }}>
          {payload[0].name}
        </p>
        <p className="text-gray-700">{`Value: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

const PieChart: React.FC<PieChartProps> = ({
  data,
  dataKey = 'value',
  nameKey = 'name',
  height = 300,
  innerRadius = 60,
  outerRadius = 80,
}) => {
  return (
    <div className="w-full h-full bg-white rounded-lg p-4">
      <ResponsiveContainer width="100%\" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            dataKey={dataKey}
            nameKey={nameKey}
            animationDuration={500}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center" 
            wrapperStyle={{
              fontSize: '12px',
              paddingTop: '10px'
            }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChart;