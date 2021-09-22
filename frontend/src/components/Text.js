import React from 'react';
import styled from 'styled-components';

const StyledText = styled.p`
  font-family: Helvetica;
  text-align: ${(props) => (props.textAlign ? props.textAlign : undefined)};
`;

const Text = (props) => (
  <StyledText {...props} />
);

export default Text;
