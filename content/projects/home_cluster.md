---
title: "Building the ultimate home cluster with k3s, traefik, etc."
date: 2021-09-07T20:52:25+02:00
draft: false
---

# Building the ultimate home cluster with k3s, traefik, etc.
## Overview
Container Orchestration, Kubernetes and load balancing are all things most home clusters, or even hobby workloads will never require.
Nevertheless, it's still pretty cool to boast about how complex and scalable your home cluster architecture is.

This guide will show you how to set up such a single node home cluster using, k3s and traefik.
The general goal here will be to get you up and going to quickly be able to deploy and host most applications with a basic CI/CD workflow.

## Preparation
Nessicary prerequisite is a public server running some type of linux distribution.
Important to note here is how not all distros will are compatible with k3s.
For example many RHEL-based distros (such as CentOS, Alma, Fedora, etc.) come with SELINUX, which messes up networking.

So when chosing your system, make sure it doesn't have any networking/firewall configuration that messes with k3s and supports legacy cgroups (which k3s depeds on).
In this example, Debian minimal was chosen, but feel free to experiment with whatever you prefer.

## 3, 2, 1, Kubernetes
Installing k3s pretty much boils down to running a single command:
```bash
curl -sfL https://get.k3s.io | sh -s - --disable=traefik
```

The disable traefik flag might seem counterintuitive at first, however since we want to use a modern version of traefik, we'll have to reinstall it ourselves anyhow.

Now check if everything is up and running by calling:
```bash
kubectl get nodes
```

If you get some type of permission error just run:
```bash
chmod 644 /etc/rancher/k3s/k3s.yaml
```

Furthermore, if you prefer to run ``kubectl`` from a local machine you can also copy the aformentioned file at ``/etc/rancher/k3s/k3s.yaml``, change its adress to the adress of your server and use it locally as your kubeconfig.

But yeah, congrats, you now have a self-managed kubernetes cluster!

## Setup traefik
Now let's try to get something published in our k3s-cluster.
Traefik will be used as the ingress for kubernetes, it's pretty neat as it allows for inbuilt letsencrypt certificate generation, without cert-manager and the sorts.

To install traefik apply the following file with ``kubectl apply -f crd.yml``
```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: ingressroutes.traefik.containo.us

spec:
  group: traefik.containo.us
  version: v1alpha1
  names:
    kind: IngressRoute
    plural: ingressroutes
    singular: ingressroute
  scope: Namespaced

---
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: middlewares.traefik.containo.us

spec:
  group: traefik.containo.us
  version: v1alpha1
  names:
    kind: Middleware
    plural: middlewares
    singular: middleware
  scope: Namespaced

---
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: ingressroutetcps.traefik.containo.us

spec:
  group: traefik.containo.us
  version: v1alpha1
  names:
    kind: IngressRouteTCP
    plural: ingressroutetcps
    singular: ingressroutetcp
  scope: Namespaced

---
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: ingressrouteudps.traefik.containo.us

spec:
  group: traefik.containo.us
  version: v1alpha1
  names:
    kind: IngressRouteUDP
    plural: ingressrouteudps
    singular: ingressrouteudp
  scope: Namespaced

---
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: tlsoptions.traefik.containo.us

spec:
  group: traefik.containo.us
  version: v1alpha1
  names:
    kind: TLSOption
    plural: tlsoptions
    singular: tlsoption
  scope: Namespaced

---
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: tlsstores.traefik.containo.us

spec:
  group: traefik.containo.us
  version: v1alpha1
  names:
    kind: TLSStore
    plural: tlsstores
    singular: tlsstore
  scope: Namespaced

---
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: traefikservices.traefik.containo.us

spec:
  group: traefik.containo.us
  version: v1alpha1
  names:
    kind: TraefikService
    plural: traefikservices
    singular: traefikservice
  scope: Namespaced

---
kind: ClusterRole
apiVersion: rbac.authorization.k8s.io/v1beta1
metadata:
  name: traefik-ingress-controller

rules:
  - apiGroups:
      - ""
    resources:
      - services
      - endpoints
      - secrets
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - extensions
    resources:
      - ingresses
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - extensions
    resources:
      - ingresses/status
    verbs:
      - update
  - apiGroups:
      - traefik.containo.us
    resources:
      - middlewares
      - ingressroutes
      - traefikservices
      - ingressroutetcps
      - ingressrouteudps
      - tlsoptions
      - tlsstores
    verbs:
      - get
      - list
      - watch

---
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1beta1
metadata:
  name: traefik-ingress-controller

roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: traefik-ingress-controller
subjects:
  - kind: ServiceAccount
    name: traefik-ingress-controller
    namespace: default
```

Then alter the following file with your email and details and apply it in the same manner:
```yaml
apiVersion: v1
kind: Service
metadata:
 name: traefik
spec:
 ports:
 - protocol: TCP
   name: web
   port: 80
 - protocol: TCP
   name: admin
   port: 8080
 - protocol: TCP
   name: websecure
   port: 443
 type: LoadBalancer
 selector:
  app: traefik
---
apiVersion: v1
kind: ServiceAccount
metadata:
 namespace: default
 name: traefik-ingress-controller

---
apiVersion: apps/v1
kind: Deployment
metadata:
  namespace: default
  name: traefik
  labels:
    app: traefik

spec:
  replicas: 1
  selector:
    matchLabels:
      app: traefik
  template:
    metadata:
      labels:
        app: traefik
    spec:
      serviceAccountName: traefik-ingress-controller
      containers:
       - name: traefik
         image: traefik:v2.2
         args:
            - --api.insecure
            - --accesslog
            - --entrypoints.web.Address=:80
            - --entrypoints.websecure.Address=:443
            - --providers.kubernetescrd
            - --certificatesresolvers.myresolver.acme.tlschallenge
            - --certificatesresolvers.myresolver.acme.email=ultra@man.com # insert email here...
            - --certificatesresolvers.myresolver.acme.storage=acme.json
         ports:
            - name: web
              containerPort: 80
            - name: websecure
              containerPort: 443
            - name: admin
              containerPort: 8080
```

If all pods are sucessfully running, you now have an ingress controller with support for tls!
Don't belive me? Let's put it to the test.
Using the following ingress configuration, we'll spin up an whoami app and access it through the specified domain (here obviously please use yours...).

```yaml
kind: Deployment
apiVersion: apps/v1
metadata:
   name: whoami-app
spec:
   replicas: 1
   selector:
      matchLabels:
         app: whoami-app
   template:
      metadata:
         labels:
            app: whoami-app
      spec:
         containers:
            - name: whoami-app
              image: containous/whoami
---
apiVersion: v1
kind: Service
metadata:
   name: whoami-app
   labels:
      app: whoami-app
spec:
   ports:
      - port: 80
        name: whoami-app
   selector:
      app: whoami-app
---
apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: ingressroutenotls
spec:
  entryPoints:
    - web
  routes:
  - match: Host(`ultraman.com`)
    kind: Rule
    services:
    - name: whoami-app
      port: 80
---
apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: ingressroutetls
spec:
  entryPoints:
    - websecure
  routes:
  - match: Host(`ultraman.com`)
    kind: Rule
    services:
    - name: whoami-app
      port: 80
  tls:
    certResolver: myresolver
```

If we were to now go to ``https://ultraman.com``, we can see it's verified using a letsencrypt certificate.
Congrats, you can now publish applications in kubernetes and have other people access them!

## Registry
From time to time however, it might get boring to just publish other peoples apps. We want to be able to publish our own.
This is where hosting a docker registry comes into play. 
Obviously building or importing images on your remote machine is also an option, but it's less clean.

First things first, you have to generate a password for your registry:
```bash
docker run --rm --entrypoint htpasswd httpd:2 -Bbn testuser testpassword | Set-Content -Encoding ASCII auth/htpasswd
```

Then create a docker-compose file as follows:
```yaml
version: '3'

services:
  registry:
    restart: always
    image: registry:2
    ports:
      - 5000:5000
    environment:
      REGISTRY_AUTH: htpasswd
      REGISTRY_HTTP_SECRET: blub
      REGISTRY_AUTH_HTPASSWD_PATH: /auth/htpasswd
      REGISTRY_AUTH_HTPASSWD_REALM: Registry Realm
    volumes:
      - ./data:/var/lib/registry
      - ./auth:/auth
```

Now simply start said docker container using ``docker-compose up -d``.
The docker registry is now running.

Since we might be moving sensitive data, it'll be best to also secure our registry using the tls setup we have in traefik. 
This can be done by applying the following file:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: docker-registry-ip
spec:
  ports:
  - name: docker-registry
    port: 5000
    protocol: TCP
    targetPort: 5000
  clusterIP: None
  type: ClusterIP
---
apiVersion: v1
kind: Endpoints
metadata:
  name: docker-registry-ip
subsets:
- addresses:
  - ip: 1.1.1.1 # YOUR IP
  ports:
  - name: docker-registry
    port: 5000
    protocol: TCP
---
apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: registryingressroutetls
spec:
  entryPoints:
    - websecure
  routes:
  - match: Host(`registry.ultraman.com`) # YOUR HOSTNAME
    kind: Rule
    services:
    - name: docker-registry-ip
      port: 5000
  tls:
    certResolver: myresolver
```

If no errors come, you should now have a working docker registry you can login, push and pull from.

To intigrate it into k3s, create a file named ``/etc/rancher/k3s/registries.yaml`` and add the following content:

```yaml
mirrors:
  "registry.ultraman.com":
    endpoint:
      - "https://registry.ultraman.com"
configs:
  "registry.ultraman.com":
    auth:
      username: XXXXXX
      password: XXXXXX
```

After you restart k3s, you should now be able to create pods based on the custom images in you registry.

## Summary
And that's pretty much it.
You've sucessfully created a single node home cluster, can access it with tls certificates from letsencrypt and can even publish custom imaes in your kubernetes cluster.

So, in summary, good job and have fun experimenting in your very own kubernetes cluster!

## Sources
- k3s and traefik installation: https://medium.com/@fache.loic/k3s-traefik-2-9b4646393a1c
- docker registry: https://docs.docker.com/registry/deploying/
- k3s private registry: https://rancher.com/docs/k3s/latest/en/installation/private-registry/
