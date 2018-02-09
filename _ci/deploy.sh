sudo docker login -u $ACR_USER -p $ACR_PWD https://$ACR_HOST
sudo docker build -t $ACR_HOST/"$(cat NAME)":"$(cat VERSION)" .
sudo docker push $ACR_HOST/"$(cat NAME)":"$(cat VERSION)"