# hotdog

Deploy tensorflow serving image:

```bash
oc new-project tfdemo --display-name="tensorflow demo" --description="tensorflow demo"
oc adm policy add-scc-to-user privileged system:serviceaccount:$(oc project -q):default
oc create -f seed-inception-pvc.yml
oc create -f tf-server.yml
oc expose deployment tensorflow-serving --port=8500
```

Deploy upload app:

```bash
cd file-uploader
oc new-build . --to='tfdemo/tfdemo' --name=tfdemo --binary
oc start-build tfdemo --from-dir=. --follow
oc new-app tfdemo/tfdemo
oc expose svc tfdemo --hostname=hotdog.apps.eformat.me
oc set env dc tfdemo MODEL_SERVER=tensorflow-serving:8500

```
