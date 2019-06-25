import React, { useState } from 'react'


const AuthorForm = (props) => {
    const [born, setBorn] = useState('')
    const [authorName, setAuthorName] = useState('')

    if (!props.show) {
        return null
    }

    const submit = async (e) => {
        e.preventDefault()
        
        console.log('updating author...')
        await props.editAuthor({
          variables: { name: authorName, born }
        })
    
        console.log('author updated!')
    
        setBorn('')
        setAuthorName('')
    }

    return (
    <div>
    <h2>Set birthyear</h2>
    <div>
          <form onSubmit={submit}>
            <div>
              name
              <input
                value={authorName}
                onChange={({ target }) => setAuthorName(target.value)}
              />
            </div>
            <div>
              born
              
              <input
                value={born}
                onChange={({ target }) => setBorn(Number(target.value))}
              />
            </div>
            <button type='submit'>update author</button>
          </form>
          </div>
          </div>
    )
    
    
}

export default AuthorForm
