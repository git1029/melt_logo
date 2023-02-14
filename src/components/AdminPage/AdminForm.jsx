import { useState, useContext } from 'react'
import { useForm } from 'react-hook-form'
import { AuthContext } from './AuthContext'
import {
  Title,
  Text,
  Form,
  Input,
  ButtonInput,
  TextButton,
  FormError,
} from './Styled'
import Notification from './Notification'

const RecoveryForm = ({ updateMode }) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm()

  const [message, setMessage] = useState(null)

  const { recovery } = useContext(AuthContext)

  const handleRecovery = async (data) => {
    // event.preventDefault()

    setMessage(null)

    try {
      await recovery(data.email)
      setMessage({
        text: `Recovery email sent to ${data.email}`,
        type: 'success',
      })
      setValue('email', '')
    } catch (error) {
      setMessage({
        text: `${JSON.parse(error).json.msg}`,
        type: 'error',
      })
    }
  }

  return (
    <>
      <div className="admin-recovery-form">
        <Title>Reset Password</Title>
        <Text>
          Enter an email address associated with your Netlify Account:
        </Text>

        <Form onSubmit={handleSubmit(handleRecovery)}>
          <Input
            {...register('email', { required: true })}
            style={{ borderColor: errors.email ? 'orangered' : 'transparent' }}
            placeholder="Email"
            type="email"
          />
          {errors.email && <FormError>Email is required</FormError>}
          <ButtonInput type="submit" value="Submit" />
        </Form>

        <Notification message={message} />

        <TextButton type="button" onClick={() => updateMode('login')}>
          Cancel
        </TextButton>
      </div>
    </>
  )
}

const LoginForm = ({ updateMode }) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm()

  const [message, setMessage] = useState(null)

  const { login } = useContext(AuthContext)

  const handleLogin = async (data) => {
    // event.preventDefault()

    setMessage(null)

    try {
      await login(data.email, data.password)
      setValue('email', '')
      setValue('password', '')
    } catch (error) {
      setMessage({
        text: `${JSON.parse(error).json.error_description}`,
        type: 'error',
      })
    }
  }

  return (
    <>
      <div className="admin-login-form">
        <Title>Login to admin panel</Title>
        {/* "handleSubmit" will validate your inputs before invoking "onSubmit" */}
        <Form onSubmit={handleSubmit(handleLogin)}>
          {/* register your input into the hook by invoking the "register" function */}
          <Input
            {...register('email', { required: true })}
            style={{ borderColor: errors.email ? 'orangered' : 'transparent' }}
            placeholder="Email"
            type="email"
          />
          {errors.email && <FormError>Email is required</FormError>}
          {/* include validation with required or other standard HTML validation rules */}
          <Input
            {...register('password', { required: true })}
            style={{
              borderColor: errors.password ? 'orangered' : 'transparent',
            }}
            placeholder="Password"
            type="password"
          />
          {errors.password && <FormError>Password is required</FormError>}
          {/* errors will return when field validation fails  */}
          <ButtonInput type="submit" value="Login" />
        </Form>

        <Notification message={message} />

        <TextButton type="button" onClick={() => updateMode('recovery')}>
          Forgot password?
        </TextButton>
      </div>
    </>
  )
}

const AdminForm = () => {
  const [mode, setMode] = useState('login')
  const updateMode = (value) => setMode(value)

  if (mode === 'recovery') {
    return <RecoveryForm updateMode={updateMode} />
  }

  return <LoginForm updateMode={updateMode} />
}

export default AdminForm