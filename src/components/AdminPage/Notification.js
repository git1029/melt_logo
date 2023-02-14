import { Message } from './Styled'

const Notification = ({ message }) => {
  if (!message) return null

  const classList = message.type ? `message ${message.type}` : 'message'

  return <Message className={classList}>{message.text}</Message>
}

export default Notification
