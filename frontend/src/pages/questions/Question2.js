import React, { useState } from 'react';
import styled from 'styled-components';
import Title from '../../components/Title';
import TextInput from '../../components/TextInput';
import Dropdown from '../../components/Dropdown';
import Button from '../../components/Button';

const QuestionDiv = styled.div`
  width: 1000px;
  margin: 0 auto;
`;

const InputDiv = styled.div`
  flex-direction: row;
  flex: 1;
  margin-bottom: 10px;
`;

// TODO: consider different options for finks taxonomy
const options = [
  'Know',
  'Comprehend',
  'Apply',
  'Analyse',
  'Synthesise',
  'Evaluate',
];

const Question2 = (props) => {
  const { questionData, setQuestionData } = props;
  const [inputCount, setInputCount] = useState(1);

  const decInputCount = () => {
    const newQuest = [...questionData];
    console.log(newQuest.length, inputCount - 1);
    while (newQuest.length > inputCount - 1) {
      newQuest.pop();
    }
    setQuestionData(newQuest);
    if (inputCount > 1) {
      setInputCount(inputCount - 1);
    }
  };

  return (
    <QuestionDiv>
      <Title>
        What do you expect students to know upon completion, and how well should they know it?
      </Title>
      {
        (new Array(inputCount).fill()).map((e, index) => (
          <Input
            key={e}
            ind={index}
            questionData={questionData}
            setQuestionData={setQuestionData}
            width="50px"
          />
        ))
      }
      <Button title="-" onClick={decInputCount} />
      <Button title="+" onClick={() => setInputCount(inputCount + 1)} />
    </QuestionDiv>
  );
};

export default Question2;

const Input = (props) => {
  const { ind, questionData, setQuestionData } = props;

  const updateQuestionData = (change, field, ind) => {
    console.log('question data changed');
    const newQuest = [...questionData];
    const newElement = { ...questionData[ind] };
    newElement[field] = change;
    console.log(newElement);
    newQuest[ind] = newElement;
    console.log(newQuest);
    setQuestionData(newQuest);
  };

  return (
    <InputDiv>
      <TextInput marginRight="10px" onBlur={(e) => updateQuestionData(e.target.value, 'desc', ind)} />
      <Dropdown options={options} marginLeft="10px" onChange={(e) => updateQuestionData(e.target.value, 'qual', ind)} />
    </InputDiv>
  );
};
