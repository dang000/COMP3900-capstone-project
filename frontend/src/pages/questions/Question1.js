import React from 'react';
import styled from 'styled-components';
import Title from '../../components/Title';
import TextInput from '../../components/TextInput';

const QuestionDiv = styled.div`
  width: 600px;
  margin: 0 auto;
`;

const FieldText = styled.h3`
  font-family: Helvetica;
`;

const FieldDiv = styled.div`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  display: flex;
`;

const fields = [
  'Title',
  'Discipline',
  'Code',
  'Faculty',
];

const Question1 = (props) => {
  const { courseDetails, setCourseDetails } = props;

  const updateObjField = (text, field) => {
    console.log('here');
    setCourseDetails((prevState) => ({
      ...prevState,
      [field.toLowerCase()]: text,
    }));
    console.log(courseDetails);
  };
  return (
    <QuestionDiv>
      <Title>
        Please fill in the following fields
      </Title>
      {
        fields.map((field) => (
          <FieldDiv key={field}>
            <FieldText>{field}</FieldText>
            <TextInput
              onBlur={(e) => updateObjField(e.target.value, field)}
              defaultValue={courseDetails[field.toLowerCase()]}
              width="200px"
              marginLeft="auto"
            />
          </FieldDiv>
        ))
      }
    </QuestionDiv>
  );
};

export default Question1;
