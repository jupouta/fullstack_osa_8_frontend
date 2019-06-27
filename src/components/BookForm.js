import React from 'react'

const BookForm = (props) => {

    if (!props.show) {
        return null
    }

    if (props.books.loading) {
        return <div>loading...</div>
      }
    
    const books = props.books.data.allBooks
    const userGenre = props.userFound.data.me.favoriteGenre

    const newBooks = books.filter(book => book.genres.includes(userGenre))

    return (
        <div>
          <h2>recommendations</h2>
        <div>books in your favorite genre <b>{userGenre}</b></div>
          <table>
            <tbody>
              <tr>
                <th></th>
                <th>
                  author
                </th>
                <th>
                  published
                </th>
              </tr>
              {newBooks.map(a =>
                <tr key={a.title}>
                  <td>{a.title}</td>
                  <td>{a.author.name}</td>
                  <td>{a.published}</td>
                </tr>
              )}
            </tbody>
          </table>
          {}
    
        </div>
      )
}

export default BookForm