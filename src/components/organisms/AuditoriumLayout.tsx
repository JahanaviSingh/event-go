import { useEffect, useRef } from 'react'

interface AuditoriumLayoutProps {
  rows: number
  columns: number
  className?: string
}

export const AuditoriumLayout = ({ rows, columns, className = '' }: AuditoriumLayoutProps) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || rows <= 0 || columns <= 0) return

    const svg = svgRef.current
    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // Clear previous content
    svg.innerHTML = ''

    // Calculate dimensions
    const padding = 40
    const usableWidth = width - (padding * 2)
    const usableHeight = height - (padding * 2)
    
    const seatWidth = Math.min(usableWidth / columns, 30)
    const seatHeight = Math.min(usableHeight / (rows + 1), 25) // +1 for screen space
    const startX = (width - (seatWidth * columns)) / 2
    const startY = padding + seatHeight // Leave space for screen

    // Draw curved screen
    const screenWidth = seatWidth * columns
    const screenCurve = 20
    const screenPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    screenPath.setAttribute(
      'd',
      `M ${startX} ${padding} 
       Q ${width/2} ${padding - screenCurve} 
         ${startX + screenWidth} ${padding}`
    )
    screenPath.setAttribute('stroke', '#1F2937')
    screenPath.setAttribute('stroke-width', '4')
    screenPath.setAttribute('fill', 'none')
    svg.appendChild(screenPath)

    // Add stylized SCREEN text
    const screenText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    screenText.setAttribute('x', (width / 2).toString())
    screenText.setAttribute('y', (padding - 25).toString())
    screenText.setAttribute('text-anchor', 'middle')
    screenText.setAttribute('font-size', '16')
    screenText.setAttribute('font-weight', 'bold')
    screenText.setAttribute('fill', '#1F2937')
    screenText.setAttribute('letter-spacing', '2')
    screenText.textContent = 'SCREEN'
    svg.appendChild(screenText)

    // Draw seats in straight rows
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const x = startX + (col * seatWidth)
        const y = startY + (row * seatHeight)

        // Draw seat
        const seat = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        seat.setAttribute('x', x.toString())
        seat.setAttribute('y', y.toString())
        seat.setAttribute('width', (seatWidth - 4).toString())
        seat.setAttribute('height', (seatHeight - 4).toString())
        seat.setAttribute('rx', '3')
        seat.setAttribute('fill', '#E5E7EB')
        seat.setAttribute('stroke', '#9CA3AF')
        seat.setAttribute('stroke-width', '1')
        svg.appendChild(seat)

        // Add seat number
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        text.setAttribute('x', (x + (seatWidth - 4) / 2).toString())
        text.setAttribute('y', (y + (seatHeight - 4) / 2).toString())
        text.setAttribute('text-anchor', 'middle')
        text.setAttribute('dominant-baseline', 'middle')
        text.setAttribute('font-size', '10')
        text.setAttribute('fill', '#4B5563')
        text.textContent = `${row + 1}-${col + 1}`
        svg.appendChild(text)
      }
    }

    // Add row labels on the left
    for (let row = 0; row < rows; row++) {
      const y = startY + (row * seatHeight) + (seatHeight - 4) / 2
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      label.setAttribute('x', (padding - 5).toString())
      label.setAttribute('y', y.toString())
      label.setAttribute('text-anchor', 'end')
      label.setAttribute('dominant-baseline', 'middle')
      label.setAttribute('font-size', '10')
      label.setAttribute('fill', '#6B7280')
      label.textContent = `Row ${row + 1}`
      svg.appendChild(label)
    }

    // Add column labels at the top
    for (let col = 0; col < columns; col++) {
      const x = startX + (col * seatWidth) + (seatWidth - 4) / 2
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      label.setAttribute('x', x.toString())
      label.setAttribute('y', (startY - 5).toString())
      label.setAttribute('text-anchor', 'middle')
      label.setAttribute('font-size', '10')
      label.setAttribute('fill', '#6B7280')
      label.textContent = `${col + 1}`
      svg.appendChild(label)
    }

  }, [rows, columns])

  return (
    <div ref={containerRef} className={`w-full h-[400px] bg-white rounded-lg border ${className}`}>
      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox="0 0 100% 100%"
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  )
} 