import { useState, useEffect, useRef } from 'react'
// import { useFadeEffect } from './helpers/fadeEffect'
import LogoAnimation from './LogoAnimation'
import '../css/Home.css'

const Home = ({ controls }) => {
  const fadeInRef = useRef(null)
  const fadeInTriggerRef = useRef(null)

  // Handles logo animation scroll transition effect
  // effectRef needs to be passed to LogoAnimation below as:
  // <LogoAnimation effectRef={effectRef} />
  // const { effectRef, updateFadeEffect } = useFadeEffect()
  const effectRef = useRef()

  const [backgroundColor, setBackgroundColor] = useState('#000000')
  const [backgroundImage] = useState('none')

  useEffect(() => {
    setTimeout(() => {
      document.querySelector('.fade-in-up-element').classList.add('visible')
    }, 1000)

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        // document.querySelector('.fade-in-up-element').classList.add('no-more')

        // console.log('hide canvas')
        // update canvas on hide
        // updateFadeEffect(1)

        if (effectRef.current) {
          if (effectRef.current.uniforms.uTransition.value.x !== 1) {
            const { uTransition, uTime, uFadeLast } = effectRef.current.uniforms
            uFadeLast.value = uTransition.value.y
            uTransition.value.x = 1
            uTransition.value.w = uTransition.value.z
            uTransition.value.z = uTime.value
          }
        }
      }
    })

    observer.observe(fadeInRef.current)

    // return () => {
    //   observer.disconnect()
    // }
    // }, [updateFadeEffect])
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        // document
        //   .querySelector('.fade-in-up-element')
        //   .classList.remove('no-more')

        // console.log('show canvas')

        // update canvas on show
        // updateFadeEffect(0)

        if (effectRef.current) {
          if (effectRef.current.uniforms.uTransition.value.x !== 0) {
            const { uTransition, uTime, uFadeLast } = effectRef.current.uniforms
            uFadeLast.value = uTransition.value.y
            uTransition.value.x = 0
            uTransition.value.w = uTransition.value.z
            uTransition.value.z = uTime.value
          }
        }
      }
    })

    observer.observe(fadeInTriggerRef.current)

    // return () => {
    //   observer.disconnect()
    // }
    // }, [updateFadeEffect])
  }, [])

  return (
    <div
      style={{
        backgroundColor: backgroundColor,
        backgroundImage: `url(${backgroundImage})`,
        position: 'relative',
      }}
      className="home__container hover-background"
    >
      <div
        style={{
          // position: 'relative',
          position: 'absolute',
          top: '50vh',
          height: '20px',
          width: '100%',
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
          height: '300vh',
          marginBottom: '100px',
          position: 'relative',
          zIndex: 99999,
        }}
        onScroll={() => {
          console.log('scroll')
          // console.log(project0.current)
        }}
      >
        <div
          onMouseEnter={() => {
            setBackgroundColor('#00a742')
          }}
          onMouseLeave={() => {
            setBackgroundColor('#000000')
          }}
          className="project"
          style={{
            height: '40vw',
            width: '30vw',
            background: '#999999',
            margin: '0 auto',
            zIndex: 99999,
            position: 'relative',
          }}
        ></div>
      </div>
    </div>
  )
}

export default Home
