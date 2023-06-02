import {describe,it,expect, beforeEach} from 'vitest'
import { InMemoryCheckInsRepository } from '../repositories/in-memory/in-memory-check-ins-repository';
import { CheckinUseCase } from './checkin';


let checkInsRepository: InMemoryCheckInsRepository;
let sut: CheckinUseCase;

describe('Get User profile use case', ()=>{
  beforeEach(()=>{
    checkInsRepository = new InMemoryCheckInsRepository()
    sut = new CheckinUseCase(checkInsRepository)
  })
  it('shold be able to check in', async ()=> {
    const { checkIn } = await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01'
    })
    expect(checkIn.id).toEqual(expect.any(String))
    
  })
  

})