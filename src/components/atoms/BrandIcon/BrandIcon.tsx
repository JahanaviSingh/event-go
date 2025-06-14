import { IconDeviceLaptop } from '@tabler/icons-react'

export interface IBrandIconProps {
  className?: string
  animate?: boolean
  shadow?: boolean
  height?: number
  width?: number
}

export const BrandIcon = ({
  className,
  animate = false,
  shadow = false,
  width = 24,
  height = 24,
}: IBrandIconProps) => {
  return (
    <div style={{ perspective: '20px' }}>
      <IconDeviceLaptop
        className={`${className}`}
        style={{ transform: 'rotateX(22deg' }}
      />
    </div>
  )
}
