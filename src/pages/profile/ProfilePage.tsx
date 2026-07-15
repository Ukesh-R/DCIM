import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Building2, KeyRound, Mail, MapPin, Phone, ShieldCheck, UserCircle } from "lucide-react"

import { PageHeader } from "@/components/common/PageHeader"
import { StatusBadge } from "@/components/common/StatusBadge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { initials, formatDate } from "@/lib/format"
import { profileFormSchema, passwordFormSchema, type ProfileFormValues, type PasswordFormValues } from "@/lib/validators/user.schema"
import { updateUser } from "@/services/user.service"
import { changePassword } from "@/services/auth.service"

export function ProfilePage() {
  const { user, updateCurrentUser } = useAuth()
  const { toast } = useToast()

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    values: user
      ? {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          location: user.location,
          jobTitle: user.jobTitle,
        }
      : undefined,
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })

  if (!user) return null

  const onSaveProfile = async (values: ProfileFormValues) => {
    try {
      const updated = await updateUser(user.id, values)
      updateCurrentUser(updated)
      toast({ title: "Profile updated", description: "Your changes have been saved." })
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      })
    }
  }

  const onChangePassword = async (values: PasswordFormValues) => {
    try {
      await changePassword(values.currentPassword, values.newPassword)
      toast({ title: "Password updated", description: "Your password has been changed successfully." })
      passwordForm.reset()
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="View and manage your personal account information." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <Avatar className="size-20">
              <AvatarFallback className="text-xl">{initials(user.fullName)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{user.fullName}</p>
              <p className="text-sm text-muted-foreground">{user.jobTitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={user.role} />
              <StatusBadge status={user.status} />
            </div>
            <Separator className="my-2" />
            <div className="w-full space-y-2.5 text-left text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><Mail className="size-3.5" /> {user.email}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Phone className="size-3.5" /> {user.phone}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="size-3.5" /> {user.location}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Building2 className="size-3.5" /> {user.department}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><ShieldCheck className="size-3.5" /> Member since {formatDate(user.createdAt)}</div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserCircle className="size-4" /> Profile Information</CardTitle>
              <CardDescription>Update your personal details.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>First Name</Label>
                  <Input {...profileForm.register("firstName")} />
                  {profileForm.formState.errors.firstName && (
                    <p className="text-xs text-destructive">{profileForm.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Last Name</Label>
                  <Input {...profileForm.register("lastName")} />
                  {profileForm.formState.errors.lastName && (
                    <p className="text-xs text-destructive">{profileForm.formState.errors.lastName.message}</p>
                  )}
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Email</Label>
                  <Input type="email" {...profileForm.register("email")} />
                  {profileForm.formState.errors.email && (
                    <p className="text-xs text-destructive">{profileForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input {...profileForm.register("phone")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Location</Label>
                  <Input {...profileForm.register("location")} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Job Title</Label>
                  <Input {...profileForm.register("jobTitle")} />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" loading={profileForm.formState.isSubmitting}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><KeyRound className="size-4" /> Change Password</CardTitle>
              <CardDescription>Update your account password. This is simulated in the demo environment.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Current Password</Label>
                  <Input type="password" {...passwordForm.register("currentPassword")} />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-xs text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>New Password</Label>
                  <Input type="password" {...passwordForm.register("newPassword")} />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Confirm New Password</Label>
                  <Input type="password" {...passwordForm.register("confirmPassword")} />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" variant="outline" loading={passwordForm.formState.isSubmitting}>
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
