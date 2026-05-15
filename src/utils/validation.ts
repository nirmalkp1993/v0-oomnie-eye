import { z } from 'zod'

const userFormBase = z.object({
  userName: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  age: z.coerce.number().min(16).max(100),
  mobileNumber: z.string().min(8, 'Mobile number is required'),
  role: z.string().min(1, 'Select a role'),
  groupIds: z.array(z.string()).min(1, 'Select at least one group'),
  status: z.enum(['Active', 'Inactive', 'Pending']),
  locationLabel: z.string().optional(),
})

export const userCreateFormSchema = userFormBase
  .extend({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const userEditFormSchema = userFormBase
  .extend({
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((d, ctx) => {
    if (d.password && d.password.length > 0) {
      if (d.password.length < 8) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Min 8 characters', path: ['password'] })
      }
      if (d.password !== d.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Passwords do not match',
          path: ['confirmPassword'],
        })
      }
    }
  })

export type UserCreateFormValues = z.infer<typeof userCreateFormSchema>
export type UserEditFormValues = z.infer<typeof userEditFormSchema>

export const groupFormSchema = z.object({
  groupName: z.string().min(2, 'Group name is required'),
  description: z.string().max(500).optional(),
})

export type GroupFormValues = z.infer<typeof groupFormSchema>

export const roleFormSchema = z.object({
  roleName: z.string().min(2, 'Role name is required'),
  description: z.string().max(500).optional(),
})

export type RoleFormValues = z.infer<typeof roleFormSchema>
