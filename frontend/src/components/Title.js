import React from 'react';
import styled from 'styled-components';

const StyledTitle = styled.h2`
  font-family: Helvetica;
`;

const Title = (props) => (
  <StyledTitle {...props} />
);

export default Title;
