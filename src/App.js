import React, { useEffect, useState } from 'react';
import { Amplify, Auth, Hub, Logger } from 'aws-amplify';

const logger = new Logger('gvn-Logger');

Amplify.configure({
  Auth: {
    region: 'ap-south-1',
    userPoolId: 'ap-south-1_O6J6OzLJE',
    userPoolWebClientId: '7qubli0032hl9c9n75tj4c36ek',
    mandatorySignIn: true,
    oauth: {
      domain: 'idsk-ideskcoreservicewave1id-dev-internal.auth.ap-south-1.amazoncognito.com',
      scope: ['email', 'openid', 'profile'],
      redirectSignIn: 'http://localhost:3000/',
      redirectSignOut: 'http://localhost:3000/',
      responseType: 'code',
    },
  },
});

function App() {

  const [user, setUser] = useState(null);
  const [customState, setCustomState] = useState(null);

  const listener = (dataFromAuthEvent) => {
    console.log("listener dataFromAuthEvent : ", dataFromAuthEvent)
    const { event, data } = dataFromAuthEvent.payload;
    switch (event) {
      case "signIn":
      case 'cognitoHostedUI':
        setUser(data);
        logger.info('user signed in');
        break;
      case "signOut":
        logger.info('user signed out');
        setUser(null);
        break;
      case "customOAuthState":
        logger.error('customOAuthState');
        setCustomState(data);
        break;
      case 'signIn_failure':
        logger.error('user sign in failed');
        break;
      case 'tokenRefresh':
        logger.info('token refresh succeeded');
        break;
      case 'tokenRefresh_failure':
        logger.error('token refresh failed');
        break;
      case 'autoSignIn':
        logger.info('Auto Sign In after Sign Up succeeded');
        break;
      case 'autoSignIn_failure':
        logger.error('Auto Sign In after Sign Up failed');
        break;
      case 'configured':
        logger.info('the Auth module is configured');
        break;
    }
  };
  useEffect(() => {
    console.log("useEffect")
    // const unsubscribe = 
    Hub.listen("auth", listener);

    Auth.currentAuthenticatedUser()
      .then(currentUser => { 
        console.log("currentAuthenticatedUser", currentUser)
        setUser(currentUser)
      })
      .catch(() => console.log("Not signed in"));

    // return unsubscribe;
  }, []);
  
  function signOut() {
    console.log("signOut")
    Auth.signOut()
      .then(data => console.log(data))
      .catch(err => console.log(err));
  }

    return (
      <div className="App">
        
        <div>
          <p>User: {user ? JSON.stringify(user) : 'None'}</p>
          {user ? (
            <button onClick={signOut}>Sign Out</button>
          ) : (
            <button onClick={() => Auth.federatedSignIn()}>Federated Sign In by Opening Hosted UI</button>
          )}
      </div>

      </div>
    );
}

export default App;
