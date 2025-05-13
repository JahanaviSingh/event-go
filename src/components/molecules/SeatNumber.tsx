export interface ISeatNumberProps {
  number: number
}

export const SeatNumber = ({ number }: ISeatNumberProps) => {
  return (
    <div className="inline-flex items-center justify-center w-full h-full text-sm font-semibold">
      {number}
    </div>
  )
}