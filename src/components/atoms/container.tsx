import {BaseComponent} from '@/util/types'

export const Container = ({ children,className}:BaseComponent) => (
    <div className={`container mx-auto px-1 ${className}`}>
        {children}
    </div>
)