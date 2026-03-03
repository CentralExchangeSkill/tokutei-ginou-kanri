import { z } from "zod";

export const RoleSchema = z.enum(["ADMIN", "USER"]);
export type Role = z.infer<typeof RoleSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const WorkerSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  nationality: z.string(),
  visaType: z.string(),
  visaExpiryDate: z.string(),
  status: z.enum(["ACTIVE", "INACTIVE"]) 
});
export type Worker = z.infer<typeof WorkerSchema>;

export const CreateWorkerSchema = WorkerSchema.omit({ id: true });
export type CreateWorkerInput = z.infer<typeof CreateWorkerSchema>;
