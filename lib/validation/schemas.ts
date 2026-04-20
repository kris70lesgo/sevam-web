import { z } from "zod";
import { AddressLabel, JobType } from "@/lib/generated/prisma/client";

export const AddressLabelSchema = z.enum([
  AddressLabel.HOME,
  AddressLabel.OFFICE,
  AddressLabel.OTHER,
]);

export const PincodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "pincode must be a 6 digit code");

export const LatitudeSchema = z.number().finite().min(-90).max(90);

export const LongitudeSchema = z.number().finite().min(-180).max(180);

export const JobTypeSchema = z.enum([
  JobType.PLUMBING,
  JobType.ELECTRICAL,
  JobType.PAINTING,
  JobType.CARPENTRY,
  JobType.CLEANING,
  JobType.AC_REPAIR,
  JobType.APPLIANCE_REPAIR,
  JobType.OTHER,
]);