'use client'

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { trpcClient } from '@/trpc/clients/client'

export function BookingStats({ auditoriumId }: { auditoriumId?: number }) {
  const { data: stats } = trpcClient.bookings.getBookingStats.useQuery({
    auditoriumId,
  })

  if (!stats) return null

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={stats}>
          <XAxis
            dataKey="date"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip />
          <Bar
            dataKey="bookings"
            fill="currentColor"
            radius={[4, 4, 0, 0]}
            className="fill-primary"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
