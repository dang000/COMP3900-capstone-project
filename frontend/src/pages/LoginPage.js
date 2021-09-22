import React, { useState } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import Text from '../components/Text';

const HomeDiv = styled.div`
  width: 1200px;
  margin: 0 auto;
`;

const Divider = styled.div`
  width: 450px;
  height: 1px;
  background-color: black;
  margin: 30px auto;
`;

const LoginForm = styled.form`
  width: 350px;
  margin: 0 auto;
`;

const LoginPage = (props) => {
  const { accountObj, login } = props;
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const [errorMessage, setErrorMessage] = useState();
  const history = useHistory();

  const onLogin = async (user, pass) => {
    const result = await login(user, pass);
    if (result.status === 200) {
      const resultJSON = await result.json();
      if (resultJSON.success) {
        accountObj.setLoggedIn(true);
        history.push('/home');
      } else {
        setErrorMessage(resultJSON.result);
      }
    }
  };

  return (
    <HomeDiv>
      <Header title="LOGIN" />
      <LoginForm>
        <div style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          display: 'flex',
        }}
        >
          <Text>
            Username
          </Text>
          <TextInput
            id="username"
            placeholder="Username"
            width="200px"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          display: 'flex',
        }}
        >
          <Text>
            Password
          </Text>
          <TextInput
            placeholder="Password"
            type="password"
            width="200px"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </LoginForm>
      {errorMessage}
      <Divider />
      <Button title="LOGIN" width="200px" fontSize="20px" onClick={() => onLogin(username, password)} />
      <Divider />
    </HomeDiv>
  );
};

export default LoginPage;
