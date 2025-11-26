import React, { useState } from 'react'
import LandingPage from './components/LandingPage'
import GeminiAnalyzer from './components/Analyzer'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('landing') // 'landing' or 'chat'

  // Function to navigate to chat interface
  const navigateToChat = () => {
    setCurrentPage('chat')
  }

  // Function to navigate back to landing page
  const navigateToLanding = () => {
    setCurrentPage('landing')
  }

  return (
    <div className="App">
      {currentPage === 'landing' ? (
        <LandingPage onGetStarted={navigateToChat} />
      ) : (
        <GeminiAnalyzer onBack={navigateToLanding} />
      )}
    </div>
  )
}

export default App

