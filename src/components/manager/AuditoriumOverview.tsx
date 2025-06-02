import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { trpcClient } from "@/trpc/clients/client"
import { Progress } from "@/components/ui/progress"

export function AuditoriumOverview({ auditorium }: { auditorium: any }) {
  const { data: screenStats } = trpcClient.manager.getScreenStats.useQuery(
    { auditoriumId: auditorium?.id },
    { enabled: !!auditorium?.id }
  )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-medium">Auditorium Details</h3>
          <div className="mt-2 space-y-2">
            <p><span className="font-medium">Name:</span> {auditorium?.name}</p>
            <p><span className="font-medium">Address:</span> {auditorium?.Address?.address}</p>
            <p><span className="font-medium">Phone:</span> {auditorium?.Managers[0]?.phone || 'Not set'}</p>
            <p><span className="font-medium">Website:</span> {auditorium?.Managers[0]?.website || 'Not set'}</p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium">Opening Hours</h3>
          <p className="mt-2">{auditorium?.Managers[0]?.openingHours || 'Not set'}</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Screen Details</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Screen</TableHead>
              <TableHead>Projection</TableHead>
              <TableHead>Sound System</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Occupancy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditorium?.Screens.map((screen: any) => {
              const stats = screenStats?.find(s => s.screenId === screen.id)
              return (
                <TableRow key={screen.id}>
                  <TableCell>Screen {screen.number}</TableCell>
                  <TableCell>{screen.projectionType}</TableCell>
                  <TableCell>{screen.soundSystemType}</TableCell>
                  <TableCell>₹{screen.price}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={stats?.occupancy || 0} className="w-[60px]" />
                      <span>{stats?.occupancy || 0}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 