import { useState, useEffect, useRef } from 'react'
import { useFadeEffect } from './helpers/fadeEffect'
import LogoAnimation from './LogoAnimation'
import '../css/Home.css'

const Home = ({ controls }) => {
  const fadeInRef = useRef(null)
  const fadeInTriggerRef = useRef(null)

  // Handles logo animation scroll transition effect
  // effectRef needs to be passed to LogoAnimation below as:
  // <LogoAnimation effectRef={effectRef} />
  const { effectRef, updateFadeEffect } = useFadeEffect()

  const [backgroundColor] = useState('#000000')
  const [backgroundImage] = useState('none')

  useEffect(() => {
    setTimeout(() => {
      document.querySelector('.fade-in-up-element').classList.add('visible')
    }, 1000)

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        document.querySelector('.fade-in-up-element').classList.add('no-more')

        // update canvas on hide
        updateFadeEffect(1)
      }
    })

    observer.observe(fadeInRef.current)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        document
          .querySelector('.fade-in-up-element')
          .classList.remove('no-more')

        // update canvas on show
        updateFadeEffect(0)
      }
    })

    observer.observe(fadeInTriggerRef.current)
  }, [])

  return (
    <div
      style={{
        backgroundColor: backgroundColor,
        backgroundImage: `url(${backgroundImage})`,
      }}
      className="home__container hover-background"
    >
      <div
        style={{
          position: 'relative',
          top: '50vh',
          height: '20px',
        }}
        ref={fadeInTriggerRef}
        className="fadeInTrigger"
      />
      <div className="logo_knockout__holder fade-in-up-element">
        <div className="shrinker">
          <LogoAnimation effectRef={effectRef} controls={controls} />
        </div>
      </div>

      <div className="home__spacer" />

      <div className="project-anchor" id="projects" />
      <div
        style={{
          position: 'relative',
          top: '200px',
          height: '20px',
        }}
        ref={fadeInRef}
        className="fadeIn"
      />

      <div
        style={{
          height: '100vh',
        }}
      />
    </div>
  )
}

export default Home
