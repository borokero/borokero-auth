var Keycloak = require('keycloak-connect')

const config = {
    "server-url" : "http://localhost:8080/auth",
    "realm" : "nodejs-test",
    "min-time-between-jwks-requests" : 0,
    "resource" : "public-client",
    "public-client" : true,
    "verify-token-audience" : true
  }

  const kcConfig = {
    "realm": "master",
    "auth-server-url": "http://localhost:8080/auth",
    "ssl-required": "external",
    "resource": "admin-cli",
    "public-client": true,
    "confidential-port": 0
  }

    
  async function kc (username, password) {
    const keycloak = new Keycloak({}, kcConfig)
    keycloak.grantManager.obtainDirectly(username, password).then(grant => {
        console.log(grant)
        //return grant;
      }
      , error => {
        console.log(error);
    });
  }

  kc('hadi','1234')
