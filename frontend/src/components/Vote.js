import React, { useState } from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
  background-color: ${(props) => (props.backgroundColor ? props.backgroundColor : '#FF6363')};
  border: none;
  color: white;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  cursor: pointer;
  border-radius: 16px;
  width: ${(props) => (props.width ? props.width : undefined)};
  height: ${(props) => (props.height ? props.height : undefined)};
  font-family: Helvetica,serif;
  font-size: ${(props) => (props.fontSize ? props.fontSize : undefined)};
  outline: none;
  margin: 4px 2px 4px ${(props) => (props.marginLeft ? props.marginLeft : undefined)};
`;

const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

/* green:#00a965
   deep red:#ae0000
   off grey:#83878d
   neutral grey: #c8c8c8
*/
const Vote = (props) => {
  const { obj } = props;
  const [vote, setVote] = useState(0);
  // const [upColour, setUpColour] = useState('#c8c8c8');
  // const [downColour, setDownColour] = useState('#c8c8c8');

  const upvoteToggle = () => {
    console.log(vote);
    if (vote === 1) {
      setVote(0);
      obj.rating = 'neutral';
      // setUpColour('#c8c8c8');
      // setDownColour('#c8c8c8');
    } else {
      setVote(1);
      obj.rating = 'positive';
      // setUpColour('#00a965');
      // setDownColour('#83878d');
    }
  };

  const downvoteToggle = () => {
    if (vote === -1) {
      setVote(0);
      obj.rating = 'neutral';
      // setUpColour('#c8c8c8');
      // setDownColour('#c8c8c8');
    } else {
      setVote(-1);
      obj.rating = 'negative';
      // setUpColour('#83878d');
      // setDownColour('#ae0000');
    }
  };

  // (vote === 1) ? '#00a965' : (vote === -1) ? '#83878d' : '#c8c8c8'
  // (vote === 1) ? '#83878d' : (vote === -1) ? '#ae0000' : '#c8c8c8'
  return (
    <RowContainer>
      <div>
        <StyledButton {...props} onClick={upvoteToggle} backgroundColor={(vote === 1) ? '#00a965' : ((vote === -1) ? '#83878d' : '#c8c8c8')}>
          <span aria-label="upvote button" role="img" {...props}>👍</span>
        </StyledButton>
      </div>
      <div>
        <StyledButton {...props} onClick={downvoteToggle} backgroundColor={(vote === 1) ? '#83878d' : ((vote === -1) ? '#ae0000' : '#c8c8c8')}>
          <span aria-label="downvote button" role="img" {...props}>👎</span>
        </StyledButton>
      </div>
    </RowContainer>
  );
};

export default Vote;
