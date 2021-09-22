import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
  background-color: ${(props) => (props.backgroundColor ? props.backgroundColor : '#4d4dff')};
  border: none;
  color: white;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 16px;
  width: ${(props) => (props.width ? props.width : undefined)};
  height: ${(props) => (props.height ? props.height : undefined)};
  font-family: Helvetica,serif;
  font-size: ${(props) => (props.fontSize ? props.fontSize : undefined)};
  outline: none;
  margin-left: ${(props) => (props.marginLeft ? props.marginLeft : undefined)};
  margin-top: ${(props) => (props.marginTop ? props.marginTop : undefined)};
`;

const Button = (props) => {
  const { title } = props;

  return (
    <StyledButton {...props}>
      {title}
    </StyledButton>
  );
};

export default Button;
