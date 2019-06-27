import React,{ useState, useEffect } from 'react'

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import AuthorForm from './components/AuthorForm'
import BookForm from './components/BookForm'
import { Query, ApolloConsumer, Mutation } from "react-apollo"
import { gql } from 'apollo-boost'
import LoginForm from './components/LoginForm'
import { useQuery, useMutation } from 'react-apollo-hooks' 
import { useApolloClient } from 'react-apollo-hooks'

import { Subscription } from 'react-apollo'


const BOOK_DETAILS = gql`
fragment BookDetails on Book {
  title
  published
  genres
}
`


const BOOK_ADDED = gql`
subscription {
  bookAdded {
    ...BookDetails
  }
}
${BOOK_DETAILS}
`


const ALL_AUTHORS = gql`
{
  allAuthors {
    name
    born
    bookCount {
      title
    }
    id
  }
}
`

const ALL_BOOKS = gql`
  query allBooks($author: String, $genre: String) {
    allBooks (author: $author, genre: $genre) {
      title
      author {
        name
      }
      published
      genres
    }
  }

`


const USER_INFO = gql`
{
  me {
    username
    favoriteGenre
  }
}
`

const CREATE_BOOK = gql`
mutation createBook($title: String!, $author: String!, $published: Int!, $genres: [String]) {
  addBook(
    title: $title,
    author: $author,
    published: $published,
    genres: $genres
  ) {
    title
    published
    genres
  }
}
`

const EDIT_AUTHOR = gql`
mutation editAuthor($name: String!, $born: Int!) {
  editAuthor(name: $name, setBornTo: $born)  {
    name
    born
    id
  }
}
`

const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`


const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const client = useApolloClient()

  useEffect(() => {
    const foundToken = window.localStorage.getItem('library-user-token')
    setToken(foundToken)
  }, [token])

  const logout = () => {
    setToken(null)
    window.localStorage.clear()
    client.resetStore()
  }

  const includedIn = (set, object) => 
    set.map(p => p.id).includes(object.id)

  const login = useMutation(LOGIN)

  const result = useQuery(ALL_AUTHORS)
  const resultBooks = useQuery(ALL_BOOKS)
  const editAuthor = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{query: ALL_AUTHORS}]
  })
  const addBook = useMutation(CREATE_BOOK, {
    refetchQueries: [{ query: ALL_BOOKS }, {query: ALL_AUTHORS}],
    update: (store, response) => {
      const dataInStore = store.readQuery({ query: ALL_BOOKS })
      console.log('the data in store', dataInStore)
      const authorsInStore = store.readQuery({ query: ALL_AUTHORS})
      const addedBook = response.data.addBook
      
      if (!includedIn(dataInStore.allBooks, addedBook)) {
        dataInStore.allBooks.push(addedBook)
        client.writeQuery({
          query: ALL_BOOKS,
          data: dataInStore
        })

        client.writeQuery({
          query: ALL_AUTHORS,
          data: authorsInStore
        })
      }
    }
    }
  )
    
  const userFound = useQuery(USER_INFO)



  if (!token) {
    return (
      <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('login')}>login</button>
      </div>
      <Authors authors={result} show={page === 'authors'}/>
      <Books books={resultBooks} show={page === 'books'}/>
      <LoginForm
          login={login}
          setToken={(token) => setToken(token)}
          show={page === 'login'}
        />

    </div>
    )
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={() => setPage('recommend')}>recommendations</button>
        <button onClick={logout}>logout</button>
      </div>
      <Authors authors={result} show={page === 'authors'}/>
      <AuthorForm editAuthor={editAuthor} show={page === 'authors'}/>
      <Books books={resultBooks} show={page === 'books'}/>
      <NewBook addBook={addBook} show={page=== 'add'}/>
      <BookForm books={resultBooks} userFound={userFound} show={page=== 'recommend'}/>
      <Subscription
        subscription={BOOK_ADDED}
        onSubscriptionData={({subscriptionData}) => {
          const addedBook = subscriptionData.data.bookAdded
 
          window.alert(addedBook.title + ' added')

          const dataInStore = client.readQuery({ query: ALL_BOOKS })
          const authorsInStore = client.readQuery({ query: ALL_AUTHORS })
          if (!includedIn(dataInStore.allBooks, addedBook)) {
            console.log('book added to dataInStore...')
            dataInStore.allBooks.push(addedBook)
            client.writeQuery({
              query: ALL_BOOKS,
              data: dataInStore
            })

            client.writeQuery({
              query: ALL_AUTHORS,
              data: authorsInStore
            })
          }
        }}
      />
    </div>
  )
}

export default App
