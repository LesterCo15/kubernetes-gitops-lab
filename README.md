# Kubernetes GitOps Lab — Helm + Argo CD

A hands-on DevOps portfolio project demonstrating Kubernetes application deployment, Helm templating, Git-based configuration management, and automated reconciliation using Argo CD.

## Project Goals

- Package a Kubernetes application using Helm.
- Store desired application configuration in GitHub.
- Use Argo CD to synchronize Kubernetes resources from Git.
- Demonstrate automated synchronization and self-healing.
- Practice troubleshooting and explaining Kubernetes GitOps workflows.

## Architecture

```text
GitHub Repository
       |
       | Helm chart and desired configuration
       v
     Argo CD
       |
       | Reconciliation and synchronization
       v
Local Kubernetes Cluster (kind)
       |
       +-- Deployment: gitops-lab-web-app
       |      +-- NGINX Pod replicas
       |
       +-- Service: gitops-lab-web-app
```

## Technology Stack

- Kubernetes
- kind
- Helm
- Argo CD
- Git and GitHub
- NGINX
- Windows, PowerShell, and Docker Desktop

## Repository Structure

```text
kubernetes-gitops-lab/
├── argocd/
│   └── application.yaml
├── helm/
│   └── web-app/
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
│           ├── deployment.yaml
│           └── service.yaml
├── .gitignore
└── README.md
```

## Implemented Features

### Helm Deployment

- Configurable replica count and container image.
- Kubernetes Deployment with resource requests and limits.
- ClusterIP Service for internal cluster access.

### GitOps with Argo CD

- Argo CD Application references the Helm chart in this repository.
- GitHub `main` branch is the source of desired configuration.
- Automated synchronization applies committed configuration changes.
- Self-healing reconciles manual changes to managed resources.
- Automatic pruning is disabled.

## Verified Experiments

1. Validated the Helm chart with `helm lint` and `helm template`.
2. Deployed the application to a local kind cluster.
3. Connected Argo CD to the GitHub repository.
4. Changed the desired replica count from two to three and synchronized it.
5. Enabled automated synchronization and verified scaling to four replicas after a Git push.
6. Enabled self-healing, manually scaled the live Deployment down to two replicas, and observed it return to four.
7. Verified the final Deployment was `4/4` ready and the Argo CD Application was `Synced` and `Healthy`.

## Useful Commands

Validate the chart:

```powershell
helm lint .\helm\web-app
helm template gitops-lab .\helm\web-app
```

Inspect the application:

```powershell
kubectl get deployments
kubectl get pods
kubectl get services
kubectl get applications -n argocd
```

Inspect Argo CD application details:

```powershell
kubectl describe application web-app-gitops -n argocd
```

## Current Scope and Limitations

- Runs locally using kind rather than a production cloud cluster.
- Uses the public NGINX image rather than a custom application image.
- The Service is ClusterIP and is not exposed externally by default.
- Automated pruning is disabled.
- This is a learning and portfolio lab, not a production-ready platform.

## Future Improvements

- Add a custom containerized web application.
- Add GitOps deployment of a dedicated application namespace.
- Demonstrate pruning and controlled rollback.
- Add CI validation for Helm chart changes.
- Document troubleshooting scenarios and architecture decisions.
- Explore deploying the same pattern to AWS EKS.
