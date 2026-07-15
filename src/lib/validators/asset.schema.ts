import { z } from "zod"

export const assetFormSchema = z.object({
  assetTag: z.string().min(2, "Asset tag is required."),
  name: z.string().min(2, "Asset name is required."),
  type: z.enum(["server", "storage", "network", "workstation", "peripheral"]),
  status: z.enum(["in-service", "in-storage", "under-repair", "retired"]),
  customerName: z.string().min(1, "Customer name is required."),
  customerId: z.string().min(1, "Customer ID is required."),
  serialNumber: z.string().min(1, "Serial number is required."),
  manufacturer: z.string().min(1, "Manufacturer is required."),
  model: z.string().min(1, "Model is required."),
  ipAddress: z.string().min(1, "IP address is required."),
  location: z.string().min(1, "Location is required."),
  datacenter: z.string().min(1, "Datacenter is required."),
  allocationStatus: z.enum(["allocated", "unallocated", "reserved"]),
  purchaseDate: z.string().min(1, "Purchase date is required."),
  warrantyExpiry: z.string().min(1, "Warranty expiry is required."),
  cpu: z.string(),
  ramGb: z.number().min(0),
  storageGb: z.number().min(0),
  ownerId: z.string().min(1, "Owner is required."),
  notes: z.string(),
})

export type AssetFormValues = z.infer<typeof assetFormSchema>
