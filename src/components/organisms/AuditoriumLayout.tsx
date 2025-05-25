import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface AuditoriumLayoutProps {
  rows: number
  columns: number
  className?: string
}

interface SquareProps {
  row: number
  column: number
  className?: string
}

const Square = ({ row, column, className }: SquareProps) => {
  // Convert to letters for rows (A, B, C, etc.)
  const rowLetter = String.fromCharCode(65 + row)
  const seatNumber = column + 1

  return (
    <div
      className={cn(
        'w-6 h-6 border border-gray-300 rounded-sm bg-white hover:bg-gray-100 transition-colors relative group',
        className
      )}
    >
      <span className="absolute inset-0 flex items-center justify-center text-[8px] text-gray-500 group-hover:text-gray-700 transition-colors">
        {rowLetter}{seatNumber}
      </span>
    </div>
  )
}

interface GridProps {
  rows: number
  columns: number
  className?: string
}

const Screen = () => {
  return (
    <div className="relative mb-8">
      <div className="h-1 bg-gray-400 rounded-full" />
      <div className="absolute inset-x-0 -top-6 text-center">
        <span className="text-xs font-medium text-gray-500">SCREEN</span>
      </div>
    </div>
  )
}

const RowLabel = ({ number }: { number: number }) => {
  const rowLetter = String.fromCharCode(64 + number) // Convert to letters (A, B, C, etc.)
  return (
    <div className="w-8 text-xs text-gray-500 flex items-center justify-end pr-2 font-medium">
      {rowLetter}
    </div>
  )
}

const ColumnLabel = ({ number }: { number: number }) => {
  return (
    <div className="h-6 text-xs text-gray-500 flex items-center justify-center font-medium">
      {number}
    </div>
  )
}

export const Grid = ({ rows, columns, className }: GridProps) => {
  const renderRows = () => {
    const rowElements = []
    const sections = Math.ceil(columns / 10) // Create sections of 10 seats
    const seatsPerSection = Math.floor(columns / sections)

    for (let i = 0; i < rows; i++) {
      const columnElements = []
      let currentColumn = 0

      // Add row label
      columnElements.push(<RowLabel key="label" number={i + 1} />)

      // Create sections with aisles
      for (let section = 0; section < sections; section++) {
        // Add seats for this section
        for (let j = 0; j < seatsPerSection; j++) {
          // Calculate curve offset based on row position
          const curveOffset = Math.floor((i / rows) * 3) // Gradual curve from 0 to 3
          
          columnElements.push(
            <Square 
              key={`${i}-${currentColumn}`} 
              row={i} 
              column={currentColumn}
              className={cn(
                'transform',
                // Apply consistent curve offset
                curveOffset > 0 && `translate-x-${curveOffset}`,
                // Add spacing for premium seats
                i === 0 ? 'bg-blue-50 border-blue-200' : '',
                i === 1 ? 'bg-blue-50/50 border-blue-200' : ''
              )}
            />
          )
          currentColumn++
        }

        // Add aisle if not the last section
        if (section < sections - 1) {
          columnElements.push(
            <div key={`aisle-${i}-${section}`} className="w-4" />
          )
        }
      }

      rowElements.push(
        <div key={`row-${i}`} className="flex items-center">
          {columnElements}
        </div>
      )
    }

    return rowElements
  }

  const renderColumnLabels = () => {
    const labels = []
    for (let i = 0; i < columns; i++) {
      labels.push(<ColumnLabel key={i} number={i + 1} />)
    }
    return (
      <div className="flex pl-8 gap-1">
        {labels}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <Screen />
      {renderColumnLabels()}
      {renderRows()}
    </div>
  )
}

export const AuditoriumLayout = ({ rows, columns, className }: GridProps) => {
  return (
    <div className={cn('p-4 bg-gray-50 rounded-lg', className)}>
      <div className="mb-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded-sm" />
          <span>Premium Seats</span>
        </div>
      </div>
      <Grid rows={rows} columns={columns} />
    </div>
  )
} 