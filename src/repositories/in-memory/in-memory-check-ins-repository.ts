import {  Prisma, CheckIn } from "@prisma/client";
import { CheckInsRepository } from "../check-ins-repository";
import { randomUUID } from "crypto";

export class InMemoryCheckInsRepository implements CheckInsRepository {

  public items: CheckIn[] =[]

  async create(data: Prisma.CheckInUncheckedCreateInput){
    const checkIn = {
      id: randomUUID(),
      user_id: data.user_id,
      gym_id: data.gym_id,
      is_validated: data.is_validated ? new Date(data.is_validated): null,
      created_at: new Date(),
    }
    this.items.push(checkIn)
    return checkIn
  }
}