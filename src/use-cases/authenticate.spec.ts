import {describe,it,expect} from 'vitest'
import { AuthenticateUseCase } from './authenticate'
import { InMemoryUsersRepository } from '../repositories/in-memory/in-memory-users-repository'
import { hash } from 'bcryptjs'
import { InvalidCredentialsError } from './errors/invalid-credentials-error'


describe('Authenticate', ()=>{
  it('shold be able to authenticate', async ()=> {
    const usersRepository = new InMemoryUsersRepository()
    const authenticateUseCase = new AuthenticateUseCase(usersRepository)

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
    const usersRepository = new InMemoryUsersRepository()
    const authenticateUseCase = new AuthenticateUseCase(usersRepository)
    expect(()=>
      authenticateUseCase.execute({
        email: 'jhon@example.com',
        password: '123456',
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('shold not to be able to authenticate with wrong password', async ()=> {
    const usersRepository = new InMemoryUsersRepository()
    const authenticateUseCase = new AuthenticateUseCase(usersRepository)
    await usersRepository.create({
      name: 'Jhon ',
      email: 'jhon@example.com',
      password_hash: await hash('123456', 6),
    })
    expect(()=>
      authenticateUseCase.execute({
        email: 'jhon@example.com',
        password: '123',
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })
})