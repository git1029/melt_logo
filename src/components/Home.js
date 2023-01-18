import { useState, useEffect, useRef } from 'react'
import LogoAnimation from './LogoAnimation'
import '../css/Home.css'

const Home = (props) => {
  const fadeInRef = useRef(null)
  const fadeInTriggerRef = useRef(null)
  const effectRef = useRef(null)
  const [backgroundColor, setBackgroundColor] = useState('#000000')
  const [backgroundImage, setBackgroundImage] = useState('none')

  const updateEffect = (stage) => {
    if (effectRef.current) {
      if (effectRef.current.uniforms.uTransition.value.x !== stage) {
        const { uTransition, uTime, uFadeLast } = effectRef.current.uniforms
        uFadeLast.value = uTransition.value.y
        uTransition.value.x = stage
        uTransition.value.w = uTransition.value.z
        uTransition.value.z = uTime.value
        // console.log(
        //   stage === 1 ? 'hide' : 'show',
        //   uTransition.value,
        //   uTransition.value.z - uTransition.value.w,
        //   uFadeLast.value
        // )
      }
    }
  }

  useEffect(() => {
    setTimeout(() => {
      document.querySelector('.fade-in-up-element').classList.add('visible')
    }, 1000)

    const observer = new IntersectionObserver((entries) => {
      // When page intersecting with fadeIn (projects) hide canvas
      if (entries[0].isIntersecting) {
        document.querySelector('.fade-in-up-element').classList.add('no-more')

        updateEffect(1)
      }
    })

    observer.observe(fadeInRef.current)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      // When page intersecting with fadeInTrigger (top bar) show canvas
      if (entries[0].isIntersecting) {
        document
          .querySelector('.fade-in-up-element')
          .classList.remove('no-more')

        // if (effectRef.current) {
        //   if (effectRef.current.uniforms.uTransition.value.x !== 0) {
        //     const { uTransition, uTime, uFadeLast } = effectRef.current.uniforms
        //     uFadeLast.value = uTransition.value.y
        //     uTransition.value.x = 0
        //     uTransition.value.w = uTransition.value.z
        //     uTransition.value.z = uTime.value
        //     // console.log(
        //     //   'show',
        //     //   uTransition.value,
        //     //   uTransition.value.z - uTransition.value.w,
        //     //   uFadeLast.value
        //     // )
        //   }
        // }

        updateEffect(0)
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
          // backgroundColor: '#0000ff',
        }}
        ref={fadeInTriggerRef}
        className="fadeInTrigger"
      />
      <div className="logo_knockout__holder fade-in-up-element">
        <div className="shrinker">
          <LogoAnimation effectRef={effectRef} controls />
        </div>
      </div>

      <div className="home__spacer" />

      <div className="project-anchor" id="projects" />
      <div
        style={{
          position: 'relative',
          top: '200px',
          // backgroundColor: '#00ff00',
          height: '20px',
        }}
        ref={fadeInRef}
        className="fadeIn"
      />

      <div
        style={{
          height: '100vh',
          // backgroundColor: '#222222'
        }}
      />
    </div>
  )
}

export default Home
