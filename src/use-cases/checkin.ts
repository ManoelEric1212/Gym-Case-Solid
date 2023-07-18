import { CheckIn} from "@prisma/client";
import { CheckInsRepository } from "../repositories/check-ins-repository";

interface CheckInUseCaseRequest {
  userId: string;
  gymId: string;
}
interface CheckInUseCaseResponse {
  checkIn: CheckIn;
}

export class CheckinUseCase {
  constructor(
    private checkInsrepository: CheckInsRepository,
  ){}

  async execute({userId, gymId}: CheckInUseCaseRequest): Promise<CheckInUseCaseResponse>{
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