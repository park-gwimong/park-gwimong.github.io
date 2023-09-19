---
layout: post
title: "Gitlab-runner 특정 계정으로 실행하기"
subtitle: "gitlab-runner 실행 권한"
date: 2023-09-19 17:21:00+0900
categories: [ TroubleShooting ]
tags: [ Gitlab CI/CD ]
mathjax: true
---

# 오류 내용
Gitlab runner에서 job 실행 시, 설정한 계정이 아닌 root로 실행 되는 경우 발생  

## 환경
### gitlab-runner 설치
### gitlab-runner 서비스 등록
gitlab-runner를 특정 계정으로 실행하기 위해 service에 등록합니다.  
([gitlab-runner install](https://docs.gitlab.com/runner/commands/#gitlab-runner-install)은 gitlab-runner을 설치하는 것이 아닌, 서비스에 등록하기 위한 명령어입니다.)

```shell
# 계정 생성
$ sudo useradd --create-home uatm --shell /bin/bash

# 서비스 생성
$ sudo gitlab-runner install --user=uatm --working-directory=/home/uatm

# 서비스 실행
$ sudo gitlab-runner start
```

### gitlab-runner 실행
[gitlab-runner run](https://docs.gitlab.com/runner/commands/#gitlab-runner-run)은 job을 실행키기 위한 명령어입니다.  
명령은 실행되어 신호를 받을 때까지 대기합니다.  
```shell
$ sudo gitlab-runner run
```

### .gitlab-ci.yml
Gradle을 이용하여 test와 build를 수행하는 job을 생성합니다.  
```yaml
stages:
  - test
  - build
  - deploy
cache:
  paths:
    - build/

test:
  stage: test
  script:
    - echo 'Testing...'
    - chmod +x gradlew
    - ./gradlew test
  tags:
    - build

build:
  stage: build
  script:
    - echo 'Building...'
    - chmod +x gradlew
    - ./gradlew clean
    - ./gradlew assemble
  tags:
    - build
```  

## 현상  
![img](/resource/2023/20230919/20230919-img-1.png)  
일부 디렉토리(build, .gradle) 및 파일(gradlew)의 소유자가 root로 변경되어 있습니다.  
2번째로 실행 된, build job에서 실행한 script 명령어가 root의 권한으로 수행된 것입니다.  

---

# 오류 원인
gitlab-runner의 start와 run 명령을 모두 실행 시켜 발생한 현상입니다.

`서비스에 등록된 gitlab-runner`가 job 실행시키면 **설정된 계정**으로 실행되지만,  
`gitlab-runner의 run 명령어로 생성된 프로세스`가 job을 실행하게 되면 **root 권한**으로 실행 된 것입니다.  

# 회고
gitlab-runner의 명령어(run / start / install)를 제대로 이해하지 못하고 사용하다보니 문제 해결에 오랜 시간이 걸렸습니다.  
공식 메뉴얼을 좀 더 상세히 읽어야하겠습니다.  