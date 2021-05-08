---
tags: COMP 4651, 4651 Project
---

[TOC]

## Pre-preparation

### Sign up account
* [Docker Hub](https://hub.docker.com/)
* [Google Cloud](https://cloud.google.com/free/)

### Environment Setup
**Google Cloud**
* Create a project
* Enable billing for the project

## Prepare for OpenFaaS

### Install Docker CE

**Set up the repository**

```
sudo apt-get update

sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
    
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

**Install Docker Engine**
```
sudo apt-get update
 
sudo apt-get install docker-ce docker-ce-cli containerd.io
```

**Log into Docker Hub**
```
export OPENFAAS_PREFIX="<Docker Hub username>"

sudo docker login
```

### Install OpenFaas CLI
```
curl -sLSf https://cli.openfaas.com | sudo sh
```

## Set-up OpenFaaS with Kubernetes
### Install kubectl
```
export VER=$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)

curl -LO https://storage.googleapis.com/kubernetes-release/release/$VER/bin/linux/amd64/kubectl

chmod +x kubectl

mv kubectl /usr/local/bin/
```
### Create a remote cluster on Google Kubernetes Engine
**Install Google Cloud SDK**
```
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list

sudo apt-get install apt-transport-https ca-certificates gnupg

curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -

sudo apt-get update && sudo apt-get install google-cloud-sdk
```

**Configure project**
```
gcloud init

gcloud config set project <PROJECT_ID>

gcloud config set compute/region <region>

gcloud config set compute/zone <zone>
```

**Enable the Kubernetes service**
```
gcloud services enable container.googleapis.com
```

**Install kubectl**
```
gcloud components install kubectl
```

**Create a Kubernetes cluster**
```
gcloud container clusters create openfaas \
--zone=<zone> \
--num-nodes=1 \
--machine-type=n1-standard-2 \
--disk-size=30 \
--no-enable-cloud-logging
```

**Set up credentials for kubectl**
```
gcloud container clusters get-credentials openfaas
```

**Create a cluster admin role binding**
```
kubectl create clusterrolebinding "cluster-admin-$(whoami)" \
--clusterrole=cluster-admin \
--user="$(gcloud config get-value core/account)"
```

### Install OpenFaaS with arkade
**Install arkade**
```
curl -SLsf https://dl.get-arkade.dev/ | sudo sh
```
**Get external ip**
```
kubectl get svc -o wide gateway-external -n openfaas
```
**Log in**
```
export OPENFAAS_URL="<external ip>"

PASSWORD=$(kubectl get secret -n openfaas basic-auth -o jsonpath="{.data.basic-auth-password}" | base64 --decode; echo)

echo -n $PASSWORD | faas-cli login --username admin --password-stdin
```



