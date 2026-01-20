import React from 'react'
import { useState } from 'react'

const Input = () => {
    const [query, setQuery] = useState("")

    return (
        <div>
            <label className="text-light antialiased">Enter the search query in the following box</label>
            <br />
            <input
                type="text"
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter text here"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            {console.log(query)} {/* For debugging purposes */}
            
        </div>
    )
}

export default Input
