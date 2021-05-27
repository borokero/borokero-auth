
MY_PATH="`dirname \"$0\"`"              # relative
MY_PATH="`( cd \"$MY_PATH\" && pwd )`"  # absolutized and normalized
if [ -z "$MY_PATH" ] ; then
  # error; for some reason, the path is not accessible
  # to the script (e.g. permissions re-evaled after suid)
  exit 1  # fail
fi
# echo "$MY_PATH"

# Run Keycloak and Import example-realm.json
export CONTAINER_ID=$(docker run -d -p 8080:8080 -e KEYCLOAK_USER=admin -e KEYCLOAK_PASSWORD=admin \
    -e KEYCLOAK_IMPORT=$MY_PATH/example-realm.json -v $MY_PATH/example-realm.json:$MY_PATH/example-realm.json jboss/keycloak)
# in case of failure follow this link
# https://stackoverflow.com/questions/42817789/how-to-import-a-realm-in-keycloak-and-exit

echo "export CONTAINER_ID=$CONTAINER_ID" > $MY_PATH/myvar.sh
chmod +x $MY_PATH/myvar.sh

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

npm run test

docker stop $CONTAINER_ID