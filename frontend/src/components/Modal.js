import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Text from './Text';
import Button from './Button';

const Dialog = styled.dialog`
  position: fixed;
  top: 40%;
  left: 50%;
  width: 300px;
  margin-left: -175px;
`;

const ModalContentDiv = styled.div`
  width: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: -15px;
`;

const Menu = styled.menu`
  display: flex;
  justify-content: space-between;
`;

const TextDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  margin-left: 30px;
`;

const Modal = (props) => {
  const {
    message,
    redText,
    greenText,
    onRed,
    onGreen,
    greenPath,
  } = props;

  return (
    <Dialog {...props}>
      <ModalContentDiv>
        <TextDiv>
          <Text>{message}</Text>
        </TextDiv>
        <Menu>
          <Button title={redText} onClick={onRed} width="100px" backgroundColor="#FF6363" />
          <Link to={greenPath || '#'}>
            <Button title={greenText} onClick={onGreen} backgroundColor="#4AC948" width="100px" />
          </Link>
        </Menu>
      </ModalContentDiv>
    </Dialog>
  );
};

export default Modal;
