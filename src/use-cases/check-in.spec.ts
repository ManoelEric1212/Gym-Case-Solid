import {describe,it,expect, beforeEach, vi,afterEach} from 'vitest'
import { InMemoryCheckInsRepository } from '../repositories/in-memory/in-memory-check-ins-repository';
import { CheckinUseCase } from './checkin';
import { InMemoryGymsRepository } from '../repositories/in-memory/in-memory-gyms-repository';
import { Decimal } from '@prisma/client/runtime/library';



let checkInsRepository: InMemoryCheckInsRepository;
let gymsRepository: InMemoryGymsRepository;
let sut: CheckinUseCase;

describe('Check-in Use case', ()=>{
  beforeEach(()=>{
    checkInsRepository = new InMemoryCheckInsRepository()
    gymsRepository = new InMemoryGymsRepository()
    sut = new CheckinUseCase(checkInsRepository,gymsRepository)
    gymsRepository.items.push({
      id: 'gym-01',
      title: 'Minha academia',
      description: '',
      phone: '',
      latitude: new Decimal(12.1),
      longitude: new Decimal(12.1),
      
    })
    vi.useFakeTimers()
  })
  afterEach(()=>{
    vi.useRealTimers()
  })
  it('should be able to check in', async ()=> {

    
    const { checkIn } = await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: 0,
      userLongitude: 0,
    })
    expect(checkIn.id).toEqual(expect.any(String))
    
  })
  it('should not be to check in twice in the same day', async ()=> {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0,0))
    await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: 0,
      userLongitude: 0,
    })
    await expect(()=>
    sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: 0,
      userLongitude: 0,
    })).rejects.toBeInstanceOf(Error)
    
  })
  it('should to be able to check in twice but in different days', async ()=> {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0,0))
    await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: 0,
      userLongitude: 0,
    })
    vi.setSystemTime(new Date(2022, 0, 21, 8, 0,0))
    const { checkIn } = await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: 0,
      userLongitude: 0,
    })
    expect(checkIn.id).toEqual(expect.any(String))
    
  })
  
  

})