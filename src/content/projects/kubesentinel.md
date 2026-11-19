---
title: "KubeSentinel"
slug: "kubesentinel"
date: "2026-09-13"
description: "A local Kubernetes lab for testing workload isolation, security policies, and runtime alerts."
tags:
  - kubernetes
  - container-security
  - runtime-detection
technologies:
  - docker
  - k3d
  - kyverno
  - falco
  - elasticsearch
codeUrl: "https://github.com/dedsec-terminal/KubeSentinel"
published: true
---

## What I built

KubeSentinel models three logical edge sites in a local Kubernetes cluster. I used separate namespaces to demonstrate workload isolation and a shared pipeline to make application activity and runtime alerts searchable in Kibana.

## How it works

Nine Kyverno admission policies, Kubernetes access and network controls, and Redis permissions limit what workloads can run and access. Falco produces runtime alerts, and Fluent Bit forwards those alerts alongside structured application events to Elasticsearch.

## What I verified

The [lab evidence](https://github.com/dedsec-terminal/KubeSentinel#validation) records five passing controlled scenarios covering runtime detection, Redis access, Kubernetes permissions, admission policy, and isolation between edge sites. The scenarios and measurements come from the local lab.
