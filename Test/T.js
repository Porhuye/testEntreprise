import { LogtoProvider } from '@logto/react';

const App = () => {
  return (
    <LogtoProvider
      config={{
        // ...other configurations
        resources: ['https://getToken'],
      }}
    >
      <Content />
    </LogtoProvider>
  );
};

import { useLogto } from '@logto/react';

const Content = () => {
  const { isAuthenticated } = useLogto();

  console.log(isAuthenticated); // true
};

/////DANS API CALL////
const Content = () => {
  const { getAccessToken, isAuthenticated } = useLogto();

  useEffect(() => {
    if (isAuthenticated) {
      const accessToken = await getAccessToken('https://getToken');
      console.log(accessToken); // eyJhbG...
    }
  }, [isAuthenticated, getAccessToken]);
};


const Content = () => {
  const { getAccessToken, isAuthenticated } = useLogto();

  useEffect(() => {
    if (isAuthenticated) {
      const accessToken = await getAccessToken('https://getToken');
      // Assuming you have a '/api/products' endpoint on your express server
      const response = await fetch('https://gettoken/api/products', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }
  }, [isAuthenticated, getAccessToken]);
};

/////Verify the access token in your API
import { IncomingHttpHeaders } from 'http';

const extractBearerTokenFromHeaders = ({ authorization }: IncomingHttpHeaders) => {
  if (!authorization) {
    throw new Error('Authorization header is missing');
  }

  if (!authorization.startsWith('Bearer')) {
    throw new Error('Authorization header is not in the Bearer scheme');
  }

  return authorization.slice(7); // The length of 'Bearer ' is 7
};

import { createRemoteJWKSet, jwtVerify } from 'jose';

// Generate a JWKS using jwks_uri obtained from the Logto server
const jwks = createRemoteJWKSet(new URL('https://wtl9wf.logto.app/oidc/jwks'));

export const authMiddleware = async (req, res, next) => {
  // Extract the token using the helper function defined above
  const token = extractBearerTokenFromHeaders(req.headers);

  const { payload } = await jwtVerify(
    // The raw Bearer Token extracted from the request header
    token,
    jwks,
    {
      // Expected issuer of the token, issued by the Logto server
      issuer: 'https://wtl9wf.logto.app/oidc',
      // Expected audience token, the resource indicator of the current API
      audience: 'https://getToken',
    }
  );

  // Sub is the user ID, used for user identification
  const { scope, sub } = payload;

  // For role-based access control, we'll discuss it later
  assert(scope.split(' ').includes('read:products'));

  return next();
};


// Assuming you have a '/api/products' endpoint on your express server
app.get('/api/products', authMiddleware, (req, res) => {
  // API business logic
  // ...
});

///Role-based access control

<LogtoProvider
  config={{
    // ...other configurations
    resources: ['https://getToken'],
    scopes: ['read:products', 'write:products'], // Replace with the actual scope(s)
  }}
></LogtoProvider>
{
  "scope": "read:products",
  "sub": "1234567890"
}
