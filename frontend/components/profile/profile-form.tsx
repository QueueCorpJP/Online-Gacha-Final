"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { useTranslations } from "@/hooks/use-translations"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { fetchProfile, updateProfile } from "@/redux/features/profileSlice"
import { ProfileImageUpload } from "./profile-image-upload"

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  postalCode: z
    .string()
    .min(1, "Postal code is required")
    .regex(/^\d{3}-?\d{4}$/, "Invalid postal code format"),
  address: z.string().min(1, "Address is required"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^0\d{1,4}-?\d{1,4}-?\d{4}$/, "Invalid phone number format"),
})

type ProfileFormData = z.infer<typeof profileFormSchema>

export function ProfileForm() {
  const dispatch = useDispatch<AppDispatch>()
  const { data: profile, loading } = useSelector((state: RootState) => state.profile)
  const { t } = useTranslations()
  const [profileImage, setProfileImage] = useState<string | null>(null)

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      postalCode: "",
      address: "",
      phone: "",
    },
  })

  useEffect(() => {
    dispatch(fetchProfile())
  }, [dispatch])

  useEffect(() => {
    if (profile) {
      form.reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        postalCode: profile.postalCode,
        address: profile.address,
        phone: profile.phone,
      })
      
      if (profile.profileUrl) {
        setProfileImage(profile.profileUrl)
      }
    }
  }, [profile, form])

  const formatPostalCode = (value: string) => {
    const numbers = value.replace(/[^\d]/g, "")
    if (numbers.length <= 3) return numbers
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}`
  }

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, "")
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
  }

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await dispatch(updateProfile(data)).unwrap()
      toast.success(t("profile.form.success"))
    } catch (error) {
      toast.error(t("profile.form.error"))
    }
  }

  const handleImageChange = (url: string | null) => {
    setProfileImage(url)
  }

  return (
    <div className="mx-auto rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-bold">{t("profile.form.title")}</h2>
      
      <div className="mb-8">
        <ProfileImageUpload 
          defaultImage={profileImage} 
          onImageChange={handleImageChange}
        />
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="firstName">{t("signup.form.firstName")}</Label>
                  <FormControl>
                    <Input {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="lastName">{t("signup.form.lastName")}</Label>
                  <FormControl>
                    <Input {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="postalCode">{t("profile.form.fields.postalCode")}</Label>
                <FormControl>
                  <Input
                    {...field}
                    disabled={loading}
                    onChange={(e) => {
                      field.onChange(formatPostalCode(e.target.value))
                    }}
                    placeholder="123-4567"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="address">{t("profile.form.fields.address")}</Label>
                <FormControl>
                  <Input {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="phone">{t("profile.form.fields.phone")}</Label>
                <FormControl>
                  <Input
                    {...field}
                    disabled={loading}
                    onChange={(e) => {
                      field.onChange(formatPhoneNumber(e.target.value))
                    }}
                    placeholder="090-1234-5678"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="bg-black hover:bg-gray-800 transition-colors"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("profile.form.submit")}
          </Button>
        </form>
      </Form>
    </div>
  )
}
