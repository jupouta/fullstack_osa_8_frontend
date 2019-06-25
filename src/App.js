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
    bookCount
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

const ALL_BOOKS_AND_USER = gql`
{
  allBooks {
    title
    author {
      name
    }
    published
  }
  me {
    username
    favoriteGenre
  }
}
`

// const ALL_BOOKS_FROM_GENRE = gql`

//   query allBooksWithGenre($genre: String) {
//     allBooks(genre: $genre) {
//       title
//       author {
//         name
//       }
//       published
//     }
//   }
// `

const USER_INFO = gql`
{
  me {
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
  const [userGenre, setUserGenre] = useState('')
  const client = useApolloClient()

  useEffect(() => {
    setToken(localStorage.getItem('library-user-token', token))
  }, [])

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  const login = useMutation(LOGIN)

  const result = useQuery(ALL_AUTHORS)
  const resultBooks = useQuery(ALL_BOOKS)
  const editAuthor = useMutation(EDIT_AUTHOR)
  const addBook = useMutation(CREATE_BOOK, {
    update: (store, response) => {
      const dataInStore = store.readQuery({ query: ALL_BOOKS })
      const addedBook = response.data.addBook
      
      if (!includedIn(dataInStore.allBooks, addedBook)) {
        console.log('book here in dataInStore')
        dataInStore.allBooks.push(addedBook)
        client.writeQuery({
          query: ALL_BOOKS,
          data: dataInStore
        })
      }
    }
  })
    //, {
    // update: (store, response) => {
    //   const dataInStore = store.readQuery({ query: ALL_BOOKS })
    //   console.log('read')
    //   dataInStore.allBooks.push(response.data.addBook)
    //   console.log('added')
    //   store.writeQuery({
    //     query: ALL_BOOKS,
    //     data: dataInStore
    //   })
    //   console.log('done')
    // }}
    
  const userFound = useQuery(USER_INFO)

  const includedIn = (set, object) => 
    set.map(p => p.id).includes(object.id)  

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

  // if (token) {
  //   useEffect(() => {
  //   const usrQuery = useQuery(USER_INFO)
  //   console.log(usrQuery.data)
  //   setUserGenre(usrQuery.data.favoriteGenre)
  //   }, [])
  // }

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
          if (!includedIn(dataInStore.allBooks, addedBook)) {
            console.log('book added to dataInStore...')
            dataInStore.allBooks.push(addedBook)
            client.writeQuery({
              query: ALL_BOOKS,
              data: dataInStore
            })
          }
        }}
      /> 

{/* 
      </ApolloConsumer>
      <ApolloConsumer>
        {(client => 
          <Query query={ALL_BOOKS_AND_USER}>
            {(result) => 
            <BookForm books={result} show={page === 'recommend'} />
            }
          </Query> 
        )}
      </ApolloConsumer> */}

    </div>
  )
}

export default App
