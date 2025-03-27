import { Link } from '../molecules/CustomLink'
export const AdminMenu = () => {
  return (
    <div className="flex flex-col w-full max-w-xs gap-2 ">
      <Link href="/admin" className="text-orange-500">
        Dashboard
      </Link>
      <Link href="/admin/Auditorium">Auditorium</Link>
      <Link className="pl-4" href="/admin/Auditorium/new">
        Create auditorium
      </Link>
      <Link href="/admin/shows">Show</Link>
      <Link className="pl-4" href="/admin/Show/new">
        Create show
      </Link>
      <Link href="/admin/admins">Manage admins</Link>
      <Link href="/admin/manager">Manage manager</Link>
    </div>
  )
}
