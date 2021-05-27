
MY_PATH="`dirname \"$0\"`"              # relative
MY_PATH="`( cd \"$MY_PATH\" && pwd )`"  # absolutized and normalized
if [ -z "$MY_PATH" ] ; then
  # error; for some reason, the path is not accessible
  # to the script (e.g. permissions re-evaled after suid)
  exit 1  # fail
fi
echo "$MY_PATH"

# Run Keycloak and Import example-realm.json
export CONTAINER_ID=$(docker run -d -p 8080:8080 -e KEYCLOAK_USER=admin -e KEYCLOAK_PASSWORD=admin \
    jboss/keycloak)

echo "export CONTAINER_ID=$CONTAINER_ID" > $MY_PATH/myvar.sh
chmod +x $MY_PATH/myvar.sh
# in case of failure follow this link

attempt_counter=0
max_attempts=10
until $(curl --output /dev/null --silent --head --fail http://localhost:8080); do
    if [ ${attempt_counter} -eq ${max_attempts} ];then
      echo "Max attempts reached"
      exit 1
    fi

    printf '.'
    attempt_counter=$(($attempt_counter+1))
    sleep 5
done

docker exec -i $CONTAINER_ID \
  /bin/bash -c "export JDBC_PARAMS=?currentSchema=keycloak_service && 
  /opt/jboss/keycloak/bin/standalone.sh \
  -Dkeycloak.migration.action=export \
  -Dkeycloak.migration.provider=singleFile \
  -Dkeycloak.migration.realmName=master \
  -Dkeycloak.migration.usersExportStrategy=REALM_FILE \
  -Dkeycloak.migration.file=/tmp/my_realm.json"
