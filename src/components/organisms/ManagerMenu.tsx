import { Link } from '../molecules/CustomLink'

export const ManagerMenu = () => {
  return (
    <div className="flex flex-col w-full max-w-xs gap-2">
      <Link href="/manager">Dashboard</Link>
      <Link href="/manager/auditoriums">Auditoriums</Link>
      <Link className="pl-4" href="/manager/auditoriums/new-showtime">
        Create showtime
      </Link>
    </div>
  )
}