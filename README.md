# API de Check-in de academias estilo Gympass

## Requisitos funcionais

- [X] Deve ser possível se cadastrar;
- [X] Deve ser possível se autenticar;
- [ ] Deve ser possível obter o perfil de um usuário logado;
- [ ] Deve ser possível obter o número de check-ins realizados pelo usuário logado;
- [ ] Deve ser possível o usuário obter seu histórico de check-ins;
- [ ] Deve ser possível usuário buscar academias próximas;
- [ ] Deve ser possível possível o usuário buscar academias pelo nome;
- [ ] Deve ser possível o usuário realizar check-in em uma academia;
- [ ] Deve ser possível validar o check-in de um usuário;
- [ ] Deve ser possível cadastrar uma academia;

## Regras de negócio

- [X] O usuário não pode se cadastrar com um e-mail duplicado;
- [ ] O usuário não pode fazer 2 check-ins no mesmo dia;
- [ ] O usuário não pode fazer check-in se não estiver perto(100m) da academia;
- [ ] O check-in só pode ser validado até 20 minutos após criado;
- [ ] O check-in só pode ser validado por uma dministrador;
- [ ] A academia só pode ser cadastrada por um administrador;

## Requisitos não funcionais

- [X] A senha do usuário precisa estar criptografada;
- [X] Os dados da aplicação precisam estar persistidos em um banco SQLite;
- [ ] Todas as listas devem estar paginas com 20 itens por página;
- [ ] O usuário deve ser identificado por um JWT (JSON Web Token);


## Banco de dados do projeto 

## Setup do projeto

```
npm init -y
```

### Instalação de libs

```
npm i typescript @types/node tsx tsup @types/bcryptjs -D
```

```
npm i fastify zod dotenv bcryptjs 
```

### Iniciando o typescript no projeto 

```
npx tsc --init
```

### Configurações dos scripts do projeto

```js
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsup src --out-dir build",
    "start": "node build/server.js"
  },

```

### Gerenciando versões exats do npm

Para termnos de manutenabilidade de um projeto node, faz-se necessário que as versões sejam sempre mantidas atualizadas. Desse modo, iremos criar um arquivo .npmrc para executar tal função.

```js
save-exact=true
```

### Variáveis de ambiente 

Para o gerenciamento de variáveis de ambiente irá ser feito uso da liv dotenv, bem como zod para validação das variáveis de ambiente. Para gerenciar as variáveis de ambiente, tanto de testes como de produção, pode-se criar um schema dessas variáveis, exemplo disso é a criação de uma variável .env.example.

- Arquivo .env.example ```NODE_ENV=dev```

Além disso, no projeto, pode-se criar um arquivo para incluir validações com a lib do zod de cada variável, bem como definir valores padrões.

![Env](https://user-images.githubusercontent.com/35776840/235824809-991d817b-eeba-4823-a28d-c0f6b4593cbf.JPG)

```js
import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
  PORT: z.coerce.number().default(3333),
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error('Invalid enviroment variable', _env.error.format())
  throw new Error('Invalid enviroment variable.')
}
export const env = _env.data

```

- Exemplo de utilização no código

```js

import { env } from './env'
import { app } from './app'

app
  .listen({
    port: env.PORT,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log('HTTP Server Running on port 3333')
  })

```
### Configurações do Eslint

Para instalação do Eslint, irá ser feito uso do padrão da RocketSeat, para isso deve ser feita a instalação do pacote com dependência de Dev: 
``` npm i eslint @rocketseat/eslint-config -D ```.
 
 - .eslintrc.json
 
 ```js
 
 {
  "extends":[
    "@rocketseat/eslint-config/node"
  ],
  "rules": {
    "camelcase": "off",
    "no-useless-constructor": "off"
  }
}
 
 ```
 - .eslintignore
 
 ```
node_modules
build
 ```
 
 ### Adicionando Prisma no projeto 
 
 - Instalando lib do prisma 
 
 ```
 npm i prisma -D
 ```
 
 - Iniciando o projeto do prisma
 
 ```
npx prisma init
npx prisma generate
 ```
 
 - Instalando cliente do prisma
 
 ```
npm i @prisma/client
 ```
 
- Migrations no banco
 
 ```
npx prisma migrate dev
 ```

 ### Criando modelos no banco
 
 Para a criação dos models, utiliza-se da extensão do prisma, para que a mesma faça uso dos tipos gerados pelo próprio prisma. Ex:
 ```js
 user User + autosave
 ```
 
 - Models do projeto 
 
 ```js

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(uuid())
  name          String
  email         String    @unique
  password_hash String
  created_at    DateTime  @default(now())
  CheckIns      CheckIn[]

  @@map("users")
}

model CheckIn {
  id           String    @id @default(uuid())
  created_at   DateTime  @default(now())
  is_validated DateTime?
  user         User      @relation(fields: [user_id], references: [id])
  user_id      String
  gym          Gym       @relation(fields: [gym_id], references: [id])
  gym_id       String

  @@map("check_ins")
}

model Gym {
  id          String    @id @default(uuid())
  title       String
  description String?
  phone       String
  latitude    Decimal
  longitude   Decimal
  CheckIns    CheckIn[]

  @@map("gyms")
}

 ```
 
 
 ### Estruturando Design Patterns
 
 - Inversão de dependência
 
 O princípio da inversão de dependência exemplifica que ao invés do caso de uso instanciar as dependências(repositórios), o mesmo deve receber as mesmas como parâmetro. Ou seja, a entidade que precisar do caso de uso é quem vai enviar as dependências. Passos: transformar o useCase em uma classe e receber as dependências no construtor.
 
 - UseCases
 Os casos de uso são códigos utilizados para implementar um requisito funcional, baseado na regra de negócio. No caso, o caso de uso tem que ser totalmente desacoplado da tecnologia utilizada para gerenciamento de banco, no nosso caso o Prisma. Assim, pode-se escrever um caso de uso para registro da seguinte maneira:
 
 ```js
import { hash } from "bcryptjs";
import { UsersRepository } from "../repositories/users-repository";
import { UserAlreadyExistsError } from "./errors/user-already-exists-error";

interface RegisterUseCaseRequest {
  name: string
  email: string
  password: string
}

export class RegisterUseCase {
  constructor (private usersRepository: UsersRepository) {}
  async execute({ name,email,password }:RegisterUseCaseRequest) {
    const password_hash = await hash(password, 6);
    const userWithSameEmail = await this.usersRepository.findByEmail(email)
    if(userWithSameEmail){
      throw new UserAlreadyExistsError()
    }
    await this.usersRepository.create({
      name,
      email,
      password_hash,
    })
  
  }
}
 ```
 
- Tipagem do UseCase 
A tipagem do useCase vem do arquivo users-repository que indica a interface de métodos e o retorno das mesmas.

```js

import { User, Prisma } from "@prisma/client";

// Atentar para o uso de uma DTO caso não estiver usando prisma
export interface UsersRepository {
  findByEmail(email:string): Promise<User | null>
  create(data: Prisma.UserCreateInput): Promise<User>
}

```

 - Repository Pattern
 
 Separar toda a operação do banco de dados em uma entidade denominada repositório.
 
 ```js
 import { prisma } from "../../lib/prisma";
import { Prisma } from '@prisma/client'
import { UsersRepository } from "../users-repository";


export class PrismaUsersRepository implements UsersRepository {
  async findByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where:{
        email,
      }
    })
    return user
  }

  async create(data: Prisma.UserCreateInput) {
    const user = await prisma.user.create({
      data,
    })
    return user
  }

}

 ```
 
 - Controllers
 
Os controllers são a implementação prática em um formato http dos casos de usos, ou seja implemento a requisição e envio para o servidor http, exemplo: 

```js
import { FastifyRequest, FastifyReply} from 'fastify'
import { z } from 'zod'
import { RegisterUseCase } from '../../use-cases/register'
import { PrismaUsersRepository } from '../../repositories/prisma/prisma-users-repository'
import { UserAlreadyExistsError } from '../../use-cases/errors/user-already-exists-error'
export async function register(request: FastifyRequest, reply: FastifyReply){
  const registerBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
  })
  const {name, email, password} = registerBodySchema.parse(request.body)

  try {
    const prismaUsersRepository = new PrismaUsersRepository();
    const registerUseCase = new RegisterUseCase(prismaUsersRepository)
    await registerUseCase.execute({name,email,password})
  } catch (err) {
    if(err instanceof UserAlreadyExistsError){
      return reply.status(409).send({message: err.message})
    }
    throw err
    
  }

  return reply.status(201).send()

}
```
### Lidando com erros na aplicação
- Criar um arquivo para os tipos de erros. Exemplo -> errors/user-already-exists-error.ts

```js
export class UserAlreadyExistsError extends Error{
  constructor(){
    super('E-mail already exists!')
  }
}
```

- No useCase  

```js
export class RegisterUseCase {
  constructor (private usersRepository: UsersRepository) {}
  async execute({ name,email,password }:RegisterUseCaseRequest) {
    const password_hash = await hash(password, 6);
    const userWithSameEmail = await this.usersRepository.findByEmail(email)
    if(userWithSameEmail){
      throw new UserAlreadyExistsError()
    }
    await this.usersRepository.create({
      name,
      email,
      password_hash,
    })
  
  }
}

```

- No controller

```js
export async function register(request: FastifyRequest, reply: FastifyReply){
  const registerBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
  })
  const {name, email, password} = registerBodySchema.parse(request.body)

  try {
    const prismaUsersRepository = new PrismaUsersRepository();
    const registerUseCase = new RegisterUseCase(prismaUsersRepository)
    await registerUseCase.execute({name,email,password})
  } catch (err) {
    if(err instanceof UserAlreadyExistsError){
      return reply.status(409).send({message: err.message})
    }
    throw err
    
  }
  return reply.status(201).send()
}

```
- Usando o Zod 

Podemos usar o Zod para tratar os erros não mapeados na aplicação, estruturando melhor  a saída do fornecida pelo Zod.

```js
app.setErrorHandler((error,_,reply)=>{
  if(error instanceof ZodError){
    return reply.status(400).send({message: 'Validation error.', issues: error.format()})
  }
  if(env.NODE_ENV !== "production"){
    console.error(error)
  } else {
    // Fazer um log para uma ferramenta externa como DataLog/NewRelic/Sentry
  }

  return reply.status(500).send({message: 'Internal server error!!'})

})
```

## Estruturando testes na aplicação 

**Testes unitários:** É a forma de se testar unidades individuais de código fonte. Unidades podem ser métodos, classes, funcionalidades, módulos, etc. Depende muito do que é a menor parte que seu Software pode ser testado.

**Testes de integração:** É a forma de se testar a combinação das unidades em conjunto.

Ou seja, os testes unitários nunca irão vir a ter relação com o banco de dados propriamente dito, seguindo a arquitetura projetada nesse projeto, ao passar um repository, estou testando o comportamento de integração do caso de uso com o prisma em si, ou seja, teste de integração.


Para essa plicação em específico, irá ser feito o uso do vitest, uma lib para estruturação de testes em geral.
Link para documentação: [Documentação vitest](https://vitest.dev/guide/features.html)

- Instalação do vitest 
```
npm i vitest vite-tsconfig-paths -D
```
- Configuração do ambiente vite.config.ts

```js
import {defineConfig} from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
})
```
- Configuração do script de test (No arquivo package.json)
```
 "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsup src --out-dir build",
    "start": "node build/server.js",
    "test": "vitest run",
    "test:watch": "vitest"
  },
```

- Estruturando um teste para o caso de uso de registro

Categorizando o teste: describe('Register Use Case')
Definindo escopo do teste, ou seja, o que deve acontecer: it('should hash user password upon registration')

Para iniciar um teste unitário, ao invés de enviar diretamente um repository com dependência no caso de uso, faz-se o uso da estrutura in-memoryy. [In-memory](https://martinfowler.com/eaaCatalog/repository.html) é uma estrutura que simula um repository com suas funcionalidades.

-Crinado um In-memory repository

```js
import { User, Prisma } from "@prisma/client";
import { UsersRepository } from "../users-repository";

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] =[]

  async findByEmail(email: string) {
    const user = this.items.find(item => item.email === email)
    if(!user) {
      return null
    }
    return user
  }

 async  create(data: Prisma.UserCreateInput) {
    const user = {
      id: 'user-1',
      name: data.name,
      email: data.email,
      password_hash: data.password_hash,
      created_at: new Date(),
    }
    this.items.push(user)
    return user
  }
}
```
-  Fazendo o uso do In-memory-repository no caso de teste

```js

import { describe, expect, it} from"vitest"
import { RegisterUseCase } from "./register"
import { compare } from "bcryptjs"
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository"
import { UserAlreadyExistsError } from "./errors/user-already-exists-error"

describe('Register Use Case', ()=>{
  it('should be able to register', async ()=>{
    const usersRepository = new InMemoryUsersRepository()
    const registerUseCase = new RegisterUseCase(usersRepository)
    const {user} = await registerUseCase.execute({
      name: 'João',
      email: 'joao@gmail.com',
      password: '123456',
    })

    expect(user.id).toEqual(expect.any(String))

  })
  it('should hash user password upon registration', async ()=>{
    const usersRepository = new InMemoryUsersRepository()
    const registerUseCase = new RegisterUseCase(usersRepository)
    const {user} = await registerUseCase.execute({
      name: 'João',
      email: 'joao@gmail.com',
      password: '123456',
    })
    const isPasswordCorrectlyHashed = await compare(
      '123456',
      user.password_hash,
    )
    expect(isPasswordCorrectlyHashed).toBe(true)

  })

  it('should not be able to register with same email twice', async ()=>{
    const usersRepository = new InMemoryUsersRepository()
    const registerUseCase = new RegisterUseCase(usersRepository)
    const email = 'joao@gmail.com'

    await registerUseCase.execute({
      name: 'João',
      email,
      password: '123456',
    })
    
    expect(()=>
      registerUseCase.execute({
        name: 'João',
        email,
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)

  })
})

```

- Gerando coverage de testes (metrificando a qualidade do teste em si )

Para metrificar a qualidade dos testes gerados na aplicação, se faz uso do coverage. Porém, antes é necessário configurar um novo script no package.json


```js
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsup src --out-dir build",
    "start": "node build/server.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
```

- Instalação do pacote referente:
```
npm i @vitest/coverage-c8 
```

Após rodar o npm run test:coverage, haverá um feedback de cobertura dos testes dos arquivos. Exemplo:

```
 ✓ src/use-cases/register.spec.ts (3)

 Test Files  1 passed (1)
      Tests  2 passed | 1 skipped (3)
   Start at  23:12:09
   Duration  4.60s (transform 370ms, setup 0ms, collect 491ms, tests 117ms, environment 1ms, prepare 1.32s)

 % Coverage report from c8
--------------------------------|---------|----------|---------|---------|-------------------
File                            | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------------------------|---------|----------|---------|---------|-------------------
All files                       |   92.18 |    71.42 |   83.33 |   92.18 |                   
 repositories/in-memory         |   96.15 |       75 |     100 |   96.15 |                   
  in-memory-users-repository.ts |   96.15 |       75 |     100 |   96.15 | 12                
 use-cases                      |   93.93 |    66.66 |     100 |   93.93 |                   
  register.ts                   |   93.93 |    66.66 |     100 |   93.93 | 21-22             
 use-cases/errors               |      60 |      100 |       0 |      60 |                   
  user-already-exists-error.ts  |      60 |      100 |       0 |      60 | 3-4               
--------------------------------|---------|----------|---------|---------|-------------------
```

- Ferramenta Vitest-UI

Instalação do pacote
```
npm i -D @vitest/ui
```

Configurando novo script: 
```js
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsup src --out-dir build",
    "start": "node build/server.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  },
```
## Criando fluxo para autenticação

-Estruturar o caso de uso de autenticação 

O caso de uso de autenticação segue o fluxo de executar uma função assíncrona execute(), que faz uso do repositoryUser, e faz-se algumas validações como: Existência do usuário e senha correta.

```js

import { compare } from "bcryptjs";
import { UsersRepository } from "../repositories/users-repository";
import { InvalidCredentialsError } from "./errors/invalid-credentials-error";
import { User } from "@prisma/client";

interface AuthenticateUseCaseRequest {
  email: string;
  password: string;

}
interface AuthenticateUseCaseResponse {
  user: User
}

export class AuthenticateUseCase {
  constructor(
    private usersRepository: UsersRepository,
  ){}

  async execute({email, password}: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse>{
    const user = await this.usersRepository.findByEmail(email);
    if(!user){
      throw new InvalidCredentialsError()
    }
    const doesPasswordMatches = await compare(password, user.password_hash)
    if(!doesPasswordMatches){
      throw new InvalidCredentialsError()
    }

    return {
      user,
    }

  }
}

```

- Estruturação do erro 

```js

export class InvalidCredentialsError extends Error {
  constructor(){
    super('Invalid credentials')
  }
}

```

- Criando estrutura de testes para o novo caso de uso

```js

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

```

- Controller de autenticação

```js
import { FastifyRequest, FastifyReply} from 'fastify'
import { z } from 'zod'
import { PrismaUsersRepository } from '../../repositories/prisma/prisma-users-repository'
import { AuthenticateUseCase } from '../../use-cases/authenticate'
import { InvalidCredentialsError } from '../../use-cases/errors/invalid-credentials-error'


export async function authenticate(request: FastifyRequest, reply: FastifyReply){
  const authenticateBodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  })
  const { email, password} = authenticateBodySchema.parse(request.body)

  try {
    const usersRepository = new PrismaUsersRepository();
    const authenticateUseCase = new AuthenticateUseCase(usersRepository)
    await authenticateUseCase.execute({email,password})
  } catch (err) {
    if(err instanceof InvalidCredentialsError){
      return reply.status(400).send({message: err.message})
    }
    throw err
    
  }
  return reply.status(200).send()

}

```

- Refatorando instâncias de testes 

Recriando variáveis repetitivas em memória antes de executar cada teste. Criar as variáveis de forma mútavel e global, sem inicializar apenas apontando o tipo da variável. Após isso, fazer uso da estrutura beforeEach do vitest.

```js


let usersRepository: InMemoryUsersRepository;
let registerUseCase: RegisterUseCase;
describe('Register Use Case', ()=>{

  beforeEach(()=> {
    usersRepository = new InMemoryUsersRepository()
    registerUseCase = new RegisterUseCase(usersRepository)
  })
  it('should be able to register', async ()=>{
    const {user} = await registerUseCase.execute({
      name: 'João',
      email: 'joao@gmail.com',
      password: '123456',
    })

    expect(user.id).toEqual(expect.any(String))

  })
  
```

## Implementação do factory pattern 

O Factory Pattern, é um pattern que constrói depepndências comuns, no caso do useCase, existe useCase que possuem várias dependências, ou seja vários repositorys. Nesse caso, separa-se uma função para fazer essa construção.

```js
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-repository";
import { RegisterUseCase } from "../register";

export function makeRegisterUseCase(){
  const prismaUsersRepository = new PrismaUsersRepository();
  const registerUseCase = new RegisterUseCase(prismaUsersRepository)
   return registerUseCase
}
```

- No controller:

````js
try {
    const registerUseCase = makeRegisterUseCase()
    await registerUseCase.execute({name,email,password})
  } catch (err) {
    if(err instanceof UserAlreadyExistsError){
      return reply.status(409).send({message: err.message})
    }
    throw err
    
  }
```
