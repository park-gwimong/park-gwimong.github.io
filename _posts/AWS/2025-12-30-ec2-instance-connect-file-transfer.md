---
layout: post
title: EC2 Instance Connect를 활용한 파일 전송
date: 2025-12-30 19:18:00+0900
categories: [AWS]
tags: [EC2, SSH, SCP, AWS-CLI, EIC]
mathjax: true
---

## 개요

EC2 Instance Connect를 활용한 파일 전송 방법입니다.

`.pem` 키 파일 관리 없이 임시 공개키를 주입하여 SCP로 파일을 전송합니다.
유효기간은 60초입니다.

EC2 접속은 [이전 글](/2025/12/30/AWS-EC2-connection/)을 참고합니다.

## 전제 조건

### EC2 인스턴스

- EC2 Instance Connect 지원 AMI (Amazon Linux 2/2023, Ubuntu LTS)
- 보안 그룹 인바운드 22/TCP 허용

### IAM 권한

- `ec2-instance-connect:SendSSHPublicKey`
- `ec2:DescribeInstances`

### 도구

- AWS CLI v2 설치
- 조직 계정은 AWS SSO 로그인 필요

### 접속 계정

- Amazon Linux / RHEL: `ec2-user`
- Ubuntu: `ubuntu`

## 키 생성

최초 1회만 실행합니다.

```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""
```

공개키: `~/.ssh/id_ed25519.pub`
개인키: `~/.ssh/id_ed25519`

## 인스턴스 AZ 확인

```bash
aws ec2 describe-instances --instance-ids <INSTANCE_ID> \
  --query "Reservations[0].Instances[0].Placement.AvailabilityZone" \
  --region ap-northeast-2 --profile <SSO_PROFILE>
```

예: `ap-northeast-2a`

## 임시 공개키 주입

유효기간 60초로 공개키를 주입합니다.

```bash
aws ec2-instance-connect send-ssh-public-key \
  --instance-id <INSTANCE_ID> \
  --availability-zone <AZ> \
  --instance-os-user <ubuntu|ec2-user> \
  --ssh-public-key file://~/.ssh/id_ed25519.pub \
  --region ap-northeast-2 --profile <SSO_PROFILE>
```

## 파일 전송

### 업로드

```bash
scp -i ~/.ssh/id_ed25519 ./localfile ubuntu@<PUBLIC_IP>:~/
```

### 다운로드

```bash
scp -i ~/.ssh/id_ed25519 ubuntu@<PUBLIC_IP>:~/logs/app.log ./app.log
```

### 디렉토리

```bash
scp -r -i ~/.ssh/id_ed25519 ./local_dir ubuntu@<PUBLIC_IP>:~/remote_dir
```

## 프라이빗 인스턴스

배스천 호스트 경유:

```bash
scp -i ~/.ssh/id_ed25519 -o ProxyJump=ubuntu@<BASTION_IP> \
  ./localfile ubuntu@<PRIVATE_IP>:~/
```

## 자동화

```bash
#!/bin/bash
INSTANCE_ID="i-xxxxxxxxx"
AZ="ap-northeast-2a"
TARGET_IP="x.x.x.x"

aws ec2-instance-connect send-ssh-public-key \
  --instance-id $INSTANCE_ID \
  --availability-zone $AZ \
  --instance-os-user ubuntu \
  --ssh-public-key file://~/.ssh/id_ed25519.pub \
  --region ap-northeast-2

scp -i ~/.ssh/id_ed25519 $1 ubuntu@$TARGET_IP:~/
```

큰 파일 전송 시 60초 제한에 주의합니다.
공개키 주입과 SCP를 연속 실행하는 스크립트로 만듭니다.

## 보안

임시 키는 60초 후 자동 무효화됩니다.

모든 접속 시도가 CloudTrail에 기록됩니다.

빈번한 파일 전송이 필요하면 SSM Session Manager 사용을 검토합니다.

## 참고

- [EC2 인스턴스 접속 방법](/2025/12/30/AWS-EC2-connection/)