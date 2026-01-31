import React from 'react'
import { useState } from 'react'

const Input = () => {
    const [query, setQuery] = useState("")
    const [response, setResponse] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSearch = async () => {
        if (!query.trim()) {
            alert("Please enter a search query")
            return
        }

        setLoading(true)
        try {
            const res = await fetch('http://localhost:5000/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query })
            })

            const data = await res.json()
            if (res.ok) {
                setResponse(data.result)
            } else {
                setResponse(`Error: ${data.error}`)
            }
        } catch (error) {
            setResponse(`Error: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h1 className="text-blue-600 font-bold text-3xl">Enter the <span className="underline">search query</span> following </h1>
            <br />
            <input
                type="text"
                className="w-full rounded-md p-2 focus:outline-none focus:ring-2  outline-orange-600"
                placeholder="Enter query here"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
                onClick={handleSearch}
                disabled={loading}
                className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 disabled:bg-gray-400"
            >
                {loading ? 'Searching...' : 'Search'}
            </button>
            
            {response && (
                <div className="mt-4 p-4 bg-gray-100 rounded-md">
                    <h2 className="font-bold mb-2">Response:</h2>
                    <p className="whitespace-pre-wrap">{response}</p>
                </div>
            )}
        </div>
    )
}

export default Input
