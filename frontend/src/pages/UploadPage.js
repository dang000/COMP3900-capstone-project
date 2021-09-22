import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../components/Header';
import Button from '../components/Button';
import { saveCourse } from '../utils/courseHandles';

const UploadDiv = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Divider = styled.div`
  max-width: 450px;
  margin: 30px auto;
`;

const UploadPage = (props) => {
  const { upload } = props;
  const [uploadInput, setUploadInput] = useState(null);
  const [serverResponse, setServerResponse] = useState('');

  /**
   * Upload JSON file representation of a course
   * @param e
   */
  const handleUpload = (e) => {
    e.preventDefault();
    if (uploadInput === null) {
      setServerResponse('No file chosen, please choose a JSON file to upload before submitting');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = await upload(e.target.result);
      if (result.status === 200) {
        const resultJSON = await result.json();
        setServerResponse(resultJSON.result);
      }
    };
    reader.onerror = (e) => alert(e.target.error.name);
    reader.readAsBinaryString(uploadInput);
  };

  return (
    <UploadDiv>
      <Header title="Load Course from JSON" />
      <Divider />
      <form onSubmit={handleUpload} method="POST">
        <Divider>
          <input accept=".json" name="file" type="file" onChange={(e) => setUploadInput(e.target.files[0])} />
        </Divider>
        {serverResponse}
        <Divider />
        <Button title="LOAD NEW COURSE" width="250px" fontSize="24px" onClick={(ev) => handleUpload(ev)} />
      </form>
      <Button
        title="SAVE CURRENT COURSE"
        width="250px"
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
      <Divider />
      <Link to="/home">
        <Button title="BACK" width="250px" fontSize="24px" />
      </Link>
    </UploadDiv>
  );
};

export default UploadPage;
