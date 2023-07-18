import { Gym } from "@prisma/client";

// Atentar para o uso de uma DTO caso não estiver usando prisma
export interface GymsRepository {

  findById(id: string): Promise<Gym | null>
}