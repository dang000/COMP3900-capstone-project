import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/Button';
import Text from '../components/Text';
import TextArea from '../components/TextArea';

const ResultsDiv = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const FeedbackPage = (props) => {
  const { sendMessage } = props;
  const [input, setInput] = useState('');
  const [serverResponse, setServerResponse] = useState('');

  const onSubmit = async () => {
    const result = await sendMessage(input);
    setInput('');
    if (result.status === 200) {
      const resultJSON = await result.json();
      if (resultJSON.success) {
        setServerResponse(resultJSON.result);
      }
    }
  };

  return (
    <ResultsDiv>
      <Header title="Contact Us" />
      <Text>
        We're here to help. Whether you need assistance on utilising our
        service, or simply have bright ideas about how we can better assist you
        in future. Feel free to reach out to us via our email:
        wastedpotentialdevs@gmail.com. Alternatively, feel free to send us
        a message below:
      </Text>
      <div>
        <TextArea
          placeholder="Leave a message here"
          width="40em"
          height="20em"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>
      {serverResponse}
      <div>
        <Link to="/home">
          <Button title="BACK" width="300px" height="60px" fontSize="24px" />
        </Link>
        <Button title="SUBMIT" width="300px" height="60px" fontSize="24px" onClick={() => onSubmit()} />
      </div>
    </ResultsDiv>
  );
};

export default FeedbackPage;
