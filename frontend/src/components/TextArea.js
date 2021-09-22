import React from 'react';
import styled from 'styled-components';

const StyledTextArea = styled.textarea.attrs((props) => ({
  height: props.height || 'inherit',
  width: props.width || 'inherit',
  marginLeft: props.marginLeft || 'auto',
  padding: '4px',
}))`
  height: ${(props) => props.height};
  width: ${(props) => props.width};
  margin-left: ${(props) => props.marginLeft};
  padding: ${(props) => props.padding};
  font-family: Helvetica,serif;
  resize: none;
`;

const TextArea = (props) => (
  <StyledTextArea {...props} />
);

export default TextArea;
