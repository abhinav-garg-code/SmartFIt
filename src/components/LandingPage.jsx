import React, { useState } from 'react'
import './LandingPage.css'

const LandingPage = ({ onGetStarted }) => {
  const [activeFeature, setActiveFeature] = useState('clothing-tryon')

  const features = [
    {
      id: 'clothing-tryon',
      title: 'Clothing Try-On',
      description: 'Change the clothing in any model photo using a reference image—whether it\'s from someone wearing the outfit or a product photo.'
    },
    
    {
      id: 'short-videos',
      title: 'Short Videos',
      description: 'Add motion to your try-ons and bring your fashion visuals to life.'
    },
    {
      id: 'ai-photo-editing',
      title: 'AI Photo Editing',
      description: 'Enhance and edit your fashion photos with AI-powered tools.'
    }
  ]

  const activeFeatureData = features.find(f => f.id === activeFeature)

  return (
    <div className="landing-page">
      {/* Header Section */}
      <header className="header">
        <div className="header-container">
          <div className="logo">
            {/* TODO: Replace with actual logo image */}
            <span className="logo-icon">👕</span>
            <span className="logo-text">SmartFIT</span>
          </div>
          
          {/* Navigate to the same target as the hero "Get started for free" button */}
          <button className="cta-button header-cta" onClick={onGetStarted}>Go to App</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <h1 className="hero-title">
            SmartFit Assistant: Real-Time Fashion Selection Guidance 
          </h1>
         
          {/* TODO: Replace with actual API call or navigation if needed */}
          {/* Currently navigates to AI Chat interface */}
          <button className="cta-button hero-cta" onClick={onGetStarted}>
            Get started for free
            <span className="arrow">→</span>
          </button>
          
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-container">
          {/* Feature Tabs */}
          <div className="feature-tabs">
            {features.map((feature) => (
              <button
                key={feature.id}
                className={`feature-tab ${activeFeature === feature.id ? 'active' : ''}`}
                onClick={() => setActiveFeature(feature.id)}
              >
                {feature.title}
              </button>
            ))}
          </div>

          {/* Active Feature Description */}
          <div className="feature-description">
            <p>{activeFeatureData.description}</p>
          </div>

          {/* Feature Examples - Image Gallery */}
          {/* TODO: Replace placeholder divs with actual images */}
          {/* Instructions:
              1. Uncomment the <img> tags below
              2. Replace "/path/to/image1.jpg" with your actual image paths
              3. Remove or hide the .image-placeholder divs
              4. Images should be placed in the public folder (e.g., public/images/)
              5. Update src to "/images/your-image.jpg" 
          */}
          <div className="feature-examples">
            <div className="example-image">
              {/* Uncomment and update image path: */}
              { <img src='\src\utils\WhatsApp Image 2025-11-12 at 17.16.27_1fa9cf09.jpg' alt="Example 1" /> }
              <div className="image-placeholder">
                <span>Example Image 1</span>
              </div>
            </div>
            <div className="example-image">
              {/* Uncomment and update image path: */}
              { <img src='src\utils\WhatsApp Image 2025-11-12 at 17.16.27_1fa9cf09.jpg' alt="Example 2" /> }
              <div className="image-placeholder">
                <span>Example Image 2</span>
              </div>
            </div>
            <div className="example-image">
              {/* Uncomment and update image path: */}
              { <img src='src\utils\WhatsApp Image 2025-11-12 at 17.16.27_1fa9cf09.jpg' alt="Example 2" /> }
              <div className="image-placeholder">
                <span>Example Image 3</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Background Image Section - Commented out for customization */}
      {/* 
      TODO: Add background image or gradient overlay here
      Uncomment and update the background-image URL in CSS
      Example:
      .landing-page::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url('/path/to/background-image.jpg');
        background-size: cover;
        background-position: center;
        opacity: 0.1;
        z-index: -1;
      }
      */}
    </div>
  )
}

export default LandingPage

