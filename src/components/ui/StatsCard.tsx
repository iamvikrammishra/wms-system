import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  bgColor?: string;
  textColor?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  bgColor = 'bg-white', 
  textColor = 'text-gray-800' 
}) => {
  return (
    <div className={`${bgColor} rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className={`mt-1 text-2xl font-semibold ${textColor}`}>{value}</h3>
          
          {trend && (
            <p className={`mt-1 text-sm ${trend.isPositive ? 'text-green-500' : 'text-red-500'} flex items-center`}>
              <span className="mr-1">{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="ml-1 text-gray-400 text-xs">from last month</span>
            </p>
          )}
        </div>
        
        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;