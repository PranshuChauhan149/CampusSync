import React from 'react'
import { TrendingUp, Users, BookOpen, Package, Activity } from 'lucide-react'

export default function StatCard({ icon: Icon, label, value, change, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
          {change && (
            <div className="flex items-center space-x-1 mt-2">
              <TrendingUp size={16} className="text-green-600" />
              <span className="text-sm text-green-600 font-medium">{change}% this month</span>
            </div>
          )}
        </div>
        <div className={`${colorClasses[color]} p-4 rounded-lg`}>
          <Icon size={28} />
        </div>
      </div>
    </div>
  )
}
