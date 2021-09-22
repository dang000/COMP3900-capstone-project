import React from 'react';
import Speech from 'react-speech';

const SpeechButton = (props) => {
  const { text } = props;

  const style = {
    container: {},
    text: {},
    buttons: {},
    play: {
      hover: {
        color: 'white',
      },
      button: {
        height: 30,
        width: 30,
        padding: 4,
        fontFamily: 'Helvetica',
        fontSize: 15,
        cursor: 'pointer',
        pointerEvents: 'none',
        outline: 'none',
        backgroundColor: 'inherit',
        border: 'none',
      },
    },
    pause: {
      hover: {},
      button: {},
    },
    stop: {
      hover: {},
      button: {},
    },
    resume: {
      hover: {},
      button: {},
    },
  };

  return (
    <Speech styles={style} text={text} textAsButton displayText="▶️" rate="0.9" voice="Google UK English Female" />
  );
};

export default SpeechButton;
