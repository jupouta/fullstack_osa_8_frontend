import React, { useState } from 'react'

const BookForm = (props) => {
    //const [genre, setGenre] = useState('')

    if (!props.show) {
        return null
    }

    if (props.books.loading) {
        return <div>loading...</div>
      }
    
    const books = props.books.data.allBooks
    console.log(props.userFound)
    //const genres = books.map(book => book.genres)
    //setGenre('agile')
    const genre = 'agile'
    //if (props.userFound.data === {}) setGenre("agile")
    //else setGenre(props.userFound.data.favoriteGenre)
    const newBooks = books.filter(book => book.genres.includes(genre))

    return (
        <div>
          <h2>recommendations</h2>
        <div>books in your favorite genre <b>{genre}</b></div>
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