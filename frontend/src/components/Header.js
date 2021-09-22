import React from 'react';
import styled from 'styled-components';
import SpeechButton from './SpeechButton';

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: black;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-family: Helvetica;
`;

const HeaderDiv = styled.div`
  flex-direction: column;
  align-items: center;
`;

const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const Header = (props) => (
  <HeaderDiv>
    <RowContainer>
      <Title>{props.title}</Title>
      <SpeechButton text={props.title} />
    </RowContainer>
    <Divider />
  </HeaderDiv>
);

export default Header;
