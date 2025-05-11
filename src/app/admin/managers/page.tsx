'use client'
import { trpcClient } from '@/trpc/clients/client'
import { Button } from '@/components/atoms/button'
import { useToast } from '@/components/molecules/Toaster/use-toast'
import { useRouter } from 'next/navigation'
import { revalidatePath } from '@/util/actions/revalidatePath'
import { DataTable } from '@/components/molecules/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { User } from '@prisma/client'
import { useState } from 'react'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/atoms/Dialog'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const createManagerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
})

type CreateManagerForm = z.infer<typeof createManagerSchema>

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString(),
  },
]

export default function ManageManagers() {
  const { data: managers, isLoading } = trpcClient.managers.listManagers.useQuery()
  const { mutateAsync: createManager } = trpcClient.managers.createManager.useMutation()
  const { toast } = useToast()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateManagerForm>({
    resolver: zodResolver(createManagerSchema),
  })

  const onSubmit = async (data: CreateManagerForm) => {
    try {
      await createManager(data)
      toast({
        title: 'Manager created successfully',
      })
      reset()
      setOpen(false)
      revalidatePath('/admin/managers')
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error creating manager',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Manage Managers</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Manager</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Manager</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Label title="Name" error={errors.name?.message}>
                <Input placeholder="Enter name" {...register('name')} />
              </Label>
              <Label title="Email" error={errors.email?.message}>
                <Input placeholder="Enter email" {...register('email')} />
              </Label>
              <Label title="Password" error={errors.password?.message}>
                <Input type="password" placeholder="Enter password" {...register('password')} />
              </Label>
              <Button type="submit" className="w-full">Create Manager</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={managers || []} isLoading={isLoading} />
    </div>
  )
} 