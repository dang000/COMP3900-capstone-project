import React from 'react';
import styled from 'styled-components';

const Select = styled.select`
`;

const Option = styled.option`
`;

const Dropdown = (props) => {
  const { options } = props;

  return (
    <Select {...props}>
      {
        options.map((option) => <Option value={option}>{option}</Option>)
      }
    </Select>
  );
};

export default Dropdown;
