import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { userFormSchema, type UserFormValues } from "@/lib/validators/user.schema"
import { roleOptions, departmentOptions, userStatusOptions } from "@/lib/constants"
import type { User } from "@/types/user.types"
import { createUser, updateUser } from "@/services/user.service"

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
  onSuccess: () => void
}

const emptyDefaults: UserFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  role: "user",
  department: "Infrastructure",
  jobTitle: "",
  phone: "",
  status: "active",
  location: "",
}

function toDefaults(user?: User | null): UserFormValues {
  if (!user) return emptyDefaults
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    department: user.department,
    jobTitle: user.jobTitle,
    phone: user.phone,
    status: user.status,
    location: user.location,
  }
}

export function UserFormDialog({ open, onOpenChange, user, onSuccess }: UserFormDialogProps) {
  const { toast } = useToast()
  const isEdit = !!user

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: emptyDefaults,
  })

  React.useEffect(() => {
    if (open) reset(toDefaults(user))
  }, [open, user, reset])

  const watched = watch()

  const onSubmit = async (values: UserFormValues) => {
    try {
      if (isEdit && user) {
        await updateUser(user.id, values)
        toast({ title: "User updated", description: `${values.firstName} ${values.lastName} was updated.` })
      } else {
        await createUser(values)
        toast({ title: "User created", description: `${values.firstName} ${values.lastName} has been added.` })
      }
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update user details and permissions." : "Create a new user account with role-based access."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>First Name</Label>
            <Input {...register("firstName")} />
            {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Last Name</Label>
            <Input {...register("lastName")} />
            {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label>Email</Label>
            <Input type="email" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={watched.role} onValueChange={(v) => setValue("role", v as UserFormValues["role"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {roleOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={watched.status} onValueChange={(v) => setValue("status", v as UserFormValues["status"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {userStatusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Department</Label>
            <Select value={watched.department} onValueChange={(v) => setValue("department", v as UserFormValues["department"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {departmentOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Job Title</Label>
            <Input {...register("jobTitle")} />
            {errors.jobTitle && <p className="text-xs text-destructive">{errors.jobTitle.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input {...register("phone")} placeholder="+1-555-123-4567" />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Location</Label>
            <Input {...register("location")} placeholder="New York, US" />
            {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
          </div>

          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isEdit ? "Save Changes" : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
