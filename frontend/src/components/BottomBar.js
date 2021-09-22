import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Button from './Button';

const Container = styled.div`
  display: inline-block;
  margin: auto 30px;
`;

const BottomBar = (props) => {
  const { accountObj } = props;
  const location = useLocation();

  const onLogOut = async () => {
    await accountObj.logoff();
    accountObj.setLoggedIn(false);
  };

  useEffect(async () => {
    localStorage.clear();
    console.log('bottom bar update!', location);
    const ret = await accountObj.checkLogStatus();
    accountObj.setLoggedIn(ret);
  }, [location]);

  return (
    (!accountObj.loggedIn)
      ? (
        <Container>
          <Link to="/login">
            <Button title="LOGIN PAGE" width="150px" />
          </Link>
          <Link to="/register">
            <Button
              title="REGISTER PAGE"
              width="150px"
              style={{ marginLeft: 40 }}
            />
          </Link>
        </Container>
      )
      : (
        <Container>
          <Button
            title="LOGOUT"
            backgroundColor="#FF6363"
            onClick={() => { onLogOut(); }}
          >
            Log Out
          </Button>
        </Container>
      )
  );
};

export default BottomBar;
