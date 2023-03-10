import styled from 'styled-components'
import { css } from 'styled-components'

const buttonStyle = css`
  color: ${(props) => (props.light ? '#def052' : '#1b1b1d')};
  // background-color: rgba(255, 255, 255, 0.5);
  background: ${(props) => (props.light ? 'none' : 'rgba(255, 255, 255, 0.5)')};
  border-radius: 0;
  border: none;
  border: ${(props) => (props.light ? '1px solid #def052' : 'none')};
  padding: 12px 15px;
  font-size: 16px;
  cursor: pointer;

  &.selected {
    color: #1b1b1d;
    background: #def052;
  }
`

export const Title = styled.h2`
  font-weight: 400;
  margin: 0 0 30px;
`

export const Title2 = styled.h3`
  font-weight: 400;
  margin: 0 0 20px;
`

export const Text = styled.p`
  font-size: 14px;
  margin: -15px 0 30px;
`

export const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
`

export const Input = styled.input`
  font-weight: normal;
  font-size: 16px;
  margin: 0 0 1px 0;
  border: none;
  border-left: 2px solid;
  border-right: 2px solid;
  border-color: transparent;
  padding: 12px 15px;
  border-radius: 0;

  &:focus {
    outline: none;
    border-color: rgba(27, 27, 29, 0.85);
  }
`

export const Button = styled.button`
  ${buttonStyle}

  @media screen and (max-width: 960px) {
    font-size: 14px;
    padding: 8px;
  }
`

export const ButtonInput = styled.input`
  ${buttonStyle}
`

export const TextButton = styled(Button)`
  padding: 0;
  text-decoration: underline;
  background: none;
  font-size: 14px;
  margin-top: 20px;
`

export const SmallButton = styled(Button)`
  padding: 10px;
  font-size: 14px;
  height: fit-content;
`

export const IFrame = styled.iframe`
  width: 100%;
  // height: 100%;
  flex-grow: 1;
  background: #000000;
  border: none;
`

export const FormError = styled.span`
  margin-top: -1px;
  margin-bottom: 10px;
  padding: 10px 15px;
  color: #fcfcfd;
  font-size: 14px;
  background: rgba(255, 100, 0, 1);
  border-left: 2px solid;
  border-right: 2px solid;
  border-color: orangered;
`

export const Message = styled.div`
  padding: 10px 15px;
  color: #1b1b1d;
  font-size: 14px;
  margin-top: 10px;
  background: #def052;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0 5px;
  border-left: 2px solid;
  border-right: 2px solid;
  border-color: transparent;

  &.error {
    background: rgba(255, 100, 0, 1);
    border-color: orangered;
    color: #fcfcfd;
  }

  &.success {
    background: #4cb500;
    border-color: forestgreen;
    color: #fcfcfd;
  }
`
