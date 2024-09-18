import axios from 'axios';
import buildClient from '../api/buildClient';

const LandingPage = ({ currentUser }) => {
  return (
    <div>
      {currentUser ? (
        <h1> You are signed in </h1>
      ) : (
        <h1>You are not signed in</h1>
      )}
    </div>
  );
};

LandingPage.getInitialProps = async ({ req }) => {
  const client = buildClient({ req });

  const { data } = await client.get('/api/users/currentuser');

  return data;
};

export default LandingPage;
