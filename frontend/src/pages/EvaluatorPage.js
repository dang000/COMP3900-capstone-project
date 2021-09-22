import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Title from '../components/Title';
import Button from '../components/Button';
import Header from '../components/Header';
import TextArea from '../components/TextArea';
import { evaluate } from '../utils/courseHandles';

const EvaluatorDiv = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const EvaluatorPage = (props) => {
  const { setIsLoading } = props;
  const [input, setInput] = useState('');
  const [text, setText] = useState('');
  const handleSubmit = async () => {
    // No idea if this is a good way of getting and posting data
    // please review
    // good!
    setIsLoading(true);
    const result = await evaluate(input);
    if (result.status === 200) {
      const resultJSON = await result.json();
      setText(resultJSON.result);
    }
    setIsLoading(false);
  };

  return (
    <EvaluatorDiv>
      <Header title="Evaluator" />
      <EvaluatorDiv>
        <Title>
          Please fill in the CLO to be evaluated
        </Title>
        <TextArea
          placeholder="Course Learning Outcome Text"
          height="20em"
          width="40em"
          onChange={(e) => setInput(e.target.value)}
        />
        <div>{text}</div>
      </EvaluatorDiv>
      <Link to="/home">
        <Button title="BACK" width="250px" height="60px" fontSize="24px" />
      </Link>
      <Button title="SUBMIT" width="250px" height="60px" fontSize="24px" onClick={handleSubmit} />
    </EvaluatorDiv>
  );
};

export default EvaluatorPage;
