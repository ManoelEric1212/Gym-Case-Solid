import {describe,it,expect, beforeEach} from 'vitest'
import { AuthenticateUseCase } from './authenticate'
import { InMemoryUsersRepository } from '../repositories/in-memory/in-memory-users-repository'
import { hash } from 'bcryptjs'
import { InvalidCredentialsError } from './errors/invalid-credentials-error'

let usersRepository: InMemoryUsersRepository;
let authenticateUseCase: AuthenticateUseCase;

describe('Authenticate', ()=>{
  beforeEach(()=>{
    usersRepository = new InMemoryUsersRepository()
    authenticateUseCase = new AuthenticateUseCase(usersRepository)
  })
  it('shold be able to authenticate', async ()=> {


    await usersRepository.create({
      name: 'Jhon ',
      email: 'jhon@example.com',
      password_hash: await hash('123456', 6),
    })

    const { user } = await authenticateUseCase.execute({
      email: 'jhon@example.com',
      password: '123456',
    })

    expect(user.id).toEqual(expect.any(String))

  })
  it('shold not to be able to authenticate with wrong email', async ()=> {

    await expect(()=>
      authenticateUseCase.execute({
        email: 'jhon@example.com',
        password: '123456',
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('shold not to be able to authenticate with wrong password', async ()=> {

    await usersRepository.create({
      name: 'Jhon ',
      email: 'jhon@example.com',
      password_hash: await hash('123456', 6),
    })
    await expect(()=>
      authenticateUseCase.execute({
        email: 'jhon@example.com',
        password: '123',
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })
})