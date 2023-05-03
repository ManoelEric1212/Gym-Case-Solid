# API de Check-in de academias estilo Gympass

## Requisitos funcionais

- [ ] Deve ser possível se cadastrar;
- [ ] Deve ser possível se autenticar;
- [ ] Deve ser possível obter o perfil de um usuário logado;
- [ ] Deve ser possível obter o número de check-ins realizados pelo usuário logado;
- [ ] Deve ser possível o usuário obter seu histórico de check-ins;
- [ ] Deve ser possível usuário buscar academias próximas;
- [ ] Deve ser possível possível o usuário buscar academias pelo nome;
- [ ] Deve ser possível o usuário realizar check-in em uma academia;
- [ ] Deve ser possível validar o check-in de um usuário;
- [ ] Deve ser possível cadastrar uma academia;

## Regras de negócio

- [ ] O usuário não pode se cadastrar com um e-mail duplicado;
- [ ] O usuário não pode fazer 2 check-ins no mesmo dia;
- [ ] O usuário não pode fazer check-in se não estiver perto(100m) da academia;
- [ ] O check-in só pode ser validado até 20 minutos após criado;
- [ ] O check-in só pode ser validado por uma dministrador;
- [ ] A academia só pode ser cadastrada por um administrador;

## Requisitos não funcionais

- [ ] A senha do usuário precisa estar criptografada;
- [ ] Os dados da aplicação precisam estar persistidos em um banco PostgresSQL;
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

Podemos usar o Zod para tratar os erros não mapeados na aplicação, estrturando melhor  a saída do fornecida pelo Zod.

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
