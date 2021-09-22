import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useHistory } from 'react-router-dom';
import Header from '../components/Header';
import TextArea from '../components/TextArea';
import Button from '../components/Button';
import SpeechButton from '../components/SpeechButton';

const HomeDiv = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Divider = styled.div`
  max-width: 450px;
  height: 1px;
  background-color: black;
  margin: 30px auto;
`;

const BodyDiv = styled.div`
  max-width: 1200px;
  flex-direction: column;
  justify-content: stretch;
  align-items: center;
  padding: 15px;
`;

const SearchDiv = styled.div`
  flex-direction: row;
  align-items: center;
`;

const HomePage = (props) => {
  const {
    handleSubmit,
    saveCourse,
    addDesc,
  } = props;
  const [input, setInput] = useState('');
  const [serverResponse, setServerResponse] = useState('');
  const history = useHistory();

  const descSubmit = async (input, history) => {
    addDesc(input);
    await handleSubmit(input, history);
  };

  return (
    <HomeDiv>
      <Header title="CLOG" />
      <BodyDiv>
        <SpeechButton text="Enter course description" />
        <SearchDiv>
          <TextArea
            placeholder="Enter course description"
            width="40em"
            height="20em"
            onChange={(e) => setInput(e.target.value)}
          />
        </SearchDiv>
        {serverResponse}
        <Divider />
        <Button title="GENERATE" width="300px" height="60px" fontSize="24px" onClick={() => descSubmit(input, history)} />
        <SpeechButton text="generate" />
        <Divider />
        <Link to="/question">
          <Button title="UPDATE COURSE DETAILS" width="300px" fontSize="24px" />
        </Link>
        <SpeechButton text="update course details" />
        <Divider />
        <Button
          title="SAVE CURRENT COURSE"
          width="300px"
          fontSize="24px"
          onClick={async () => {
            const result = await saveCourse();
            if (result.status === 200) {
              const resultJSON = await result.json();
              if (resultJSON.success) {
                setServerResponse(resultJSON.result);
              }
            }
          }}
        />
        <SpeechButton text="save current course" />
        <Divider />
        <Link to="/upload">
          <Button title="LOAD NEW COURSE" width="300px" height="60px" fontSize="24px" />
        </Link>
        <SpeechButton text="load new course" />
        <Divider />
        <Link to="/evaluator">
          <Button title="EVALUATE CLOS" width="300px" height="60px" fontSize="24px" />
        </Link>
        <SpeechButton text="evaluate course learning outcomes" />
        <Divider />
        <Link to="/history">
          <Button title="COURSE HISTORY" width="300px" height="60px" fontSize="24px" />
        </Link>
        <SpeechButton text="course history" />
        <Divider />
        <Link to="/contact_us">
          <Button title="CONTACT US" width="300px" height="60px" fontSize="24px" />
        </Link>
        <SpeechButton text="contact us" />
        <Divider />
      </BodyDiv>
    </HomeDiv>
  );
};

export default HomePage;
