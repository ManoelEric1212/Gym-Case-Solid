import { CheckIn} from "@prisma/client";
import { CheckInsRepository } from "../repositories/check-ins-repository";
import { GymsRepository } from "../repositories/gyms-repositort";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface CheckInUseCaseRequest {
  userId: string;
  gymId: string;
  userLatitude: number;
  userLongitude: number;
}
interface CheckInUseCaseResponse {
  checkIn: CheckIn;
}

export class CheckinUseCase {
  constructor(
    private checkInsrepository: CheckInsRepository,
    private gymsRepository: GymsRepository,
  ){}

  async execute({userId, gymId}: CheckInUseCaseRequest): Promise<CheckInUseCaseResponse>{

    const gym =  await this.gymsRepository.findById(gymId)
    if(!gym){
      throw new ResourceNotFoundError()
    }
    // Calcular a distancia entre o user e a academia 

    const checkInOnsameDate = await this.checkInsrepository.findByUserIdOnDate(userId, new Date())
    if(checkInOnsameDate){
      throw new Error()
    }
    const checkIn = await this.checkInsrepository.create({
      gym_id: gymId,
      user_id: userId
    })
    return {
      checkIn,
    }

  }
}