import { CheckIn, Prisma } from "@prisma/client";

// Atentar para o uso de uma DTO caso não estiver usando prisma
export interface CheckInsRepository {
  create(data: Prisma.CheckInUncheckedCreateInput): Promise<CheckIn>
  findByUserIdOnDate(userId: string, date: Date): Promise<CheckIn | null>
}