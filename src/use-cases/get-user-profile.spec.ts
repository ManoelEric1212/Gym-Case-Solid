import {describe,it,expect, beforeEach} from 'vitest'
import { InMemoryUsersRepository } from '../repositories/in-memory/in-memory-users-repository'
import { hash } from 'bcryptjs'
import { GetUserProfileUseCase } from './get-user-profile'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

let usersRepository: InMemoryUsersRepository;
let getUserProfileUseCase: GetUserProfileUseCase;

describe('Get User profile use case', ()=>{
  beforeEach(()=>{
    usersRepository = new InMemoryUsersRepository()
    getUserProfileUseCase = new GetUserProfileUseCase(usersRepository)
  })
  it('shold be able to get user profile', async ()=> {
    const createdUser = await usersRepository.create({
      name: 'Jhon',
      email: 'jhon@example.com',
      password_hash: await hash('123456', 6),
    })

    const { user } = await getUserProfileUseCase.execute({
      userId: createdUser.id
    })

    expect(user.id).toEqual(expect.any(String))
    expect(user.name).toEqual('Jhon')
  })
  it('shold not to be able to get user profile with wrong id', async ()=> {

    expect(()=>
      getUserProfileUseCase.execute({
        userId: 'non-existing-id'
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

})