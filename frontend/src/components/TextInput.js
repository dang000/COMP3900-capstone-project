import React from 'react';
import styled from 'styled-components';

const StyledTextInput = styled.input.attrs((props) => ({
  height: props.height || 'inherit',
  width: props.width || 'inherit',
  marginLeft: props.marginLeft || 'auto',
  padding: '4px',
}))`
  height: ${(props) => props.height};
  width: ${(props) => props.width};
  margin-left: ${(props) => props.marginLeft};
  padding: ${(props) => props.padding};
  margin-right: ${(props) => props.marginRight};
  font-family: Helvetica,serif;
`;

const TextInput = (props) => (
  <StyledTextInput {...props} />
);

export default TextInput;
