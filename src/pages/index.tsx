import Head from 'next/head'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import { dehydrate, QueryClient, useQuery } from 'react-query'
import type { GetServerSideProps, NextPage } from 'next'
import Session, { Error as SessionError } from 'supertokens-node/recipe/session'
// import SuperTokensReact from 'supertokens-auth-react'

import Todos from '../components/Todos'
import AddTodo from '../components/AddTodo'
import withProps from '../utils/withProps'
import { api } from '../utils/axios'
import { ITodo } from '../interfaces'
import { getKnex } from '../utils/knex'
// import { frontendConfig } from '../config/frontendConfig'

function fetcher() {
  return api.get<{ todos: ITodo[] }>('/api/todo').then(r => r.data.todos)
}

// SuperTokensReact.init(frontendConfig())

const Home: NextPage = () => {
  const {
    data: todos,
    error,
    isLoading,
    isError,
  } = useQuery('/api/todo', fetcher, {
    onSuccess: data => {
      console.log('success:', data)
    },
  })

  if (isLoading) {
    return <h1>loading...</h1>
  }

  if (isError) {
    return <pre>{(error as Error).message}</pre>
  }

  return (
    <section>
      <Head>
        <title>Home</title>
      </Head>
      <Container
        component={MainPaper}
        maxWidth='sm'
        sx={{
          p: 2,
          borderRadius: 2,
        }}
      >
        <AddTodo />
        <Todos todos={todos!} />
      </Container>
    </section>
  )
}

const MainPaper = withProps(Paper, { elevation: 2, component: 'main' })

export const getServerSideProps: GetServerSideProps = async ctx => {
  console.log('gsp')
  try {
    const session = await Session.getSession(ctx.req, ctx.res)
    console.log('gsp')

    const queryClient = new QueryClient()

    await queryClient.prefetchQuery('/api/todo', async () => {
      const knex = getKnex()
      const todos = await knex('todos')
        .where('user_id', session?.getUserId()!)
        .orderBy('created_at', 'desc')
      return todos.map(({ _id, note, done, created_at }) => ({
        _id,
        note,
        done,
        createdAt: created_at.toISOString(),
      }))
    })

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
      },
    }
  } catch (error) {
    console.log(error)

    if (
      error instanceof SessionError &&
      error.type === SessionError.TRY_REFRESH_TOKEN
    ) {
      console.log('refresh')

      return { props: { fromSupertokens: 'needs-refresh' } }
    } else if (
      error instanceof SessionError &&
      error.type === SessionError.UNAUTHORISED
    ) {
      console.log('unauthorized')

      return {
        redirect: {
          destination: '/auth?rid=emailpassword',
          permanent: false,
        },
      }
    } else {
      console.log(error)

      throw error
    }
  }
}

export default Home
