import { User, Prisma } from "@prisma/client";

// Atentar para o uso de uma DTO caso não estiver usando prisma
export interface UsersRepository {
  findByEmail(email:string): Promise<User | null>
  create(data: Prisma.UserCreateInput): Promise<User>
  findById(id: string): Promise<User | null>
}