---
title: "EC2 인스턴스 접속 방법"
pubDate: 2025-12-30T18:47:00+09:00
category: "aws"
tags: ["EC2", "SSH", "AWS-CLI"]
math: true
---

# 개요

AWS EC2 인스턴스에 접속하는 방법을 정리하였습니다.

---

# 사전 요구사항

* EC2 인스턴스가 실행 중이어야 합니다.
* 보안 그룹에서 SSH(22번 포트) 또는 SSM 접근이 허용되어야 합니다.

---

# mssh

AWS SSO/IAM 인증 기반 접속 방식입니다.  
키 파일 관리가 필요 없으며, 조직 단위 권한 관리가 가능합니다.

## 설치

세 가지를 설치해야 합니다.

**AWS CLI v2**
* https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

```bash
aws --version
```

**Session Manager Plugin**
* https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html

```bash
session-manager-plugin --version
```

**EC2 Instance Connect CLI**

```bash
pip install ec2instanceconnectcli
mssh --version
```

## 접속

```bash
# SSO 로그인
aws sso login --profile <SSO_PROFILE>

# 인스턴스 접속
mssh i-0fe6de40241a44021 --region ap-northeast-2 --profile <SSO_PROFILE>
```

> region과 profile은 생략 가능하지만 명시하는 것을 권장합니다.

---

# OpenSSH

EC2 생성 시 발급받은 키 페어(.pem)를 사용합니다.  
Linux/macOS는 기본 설치, Windows 10 이상에서도 사용 가능합니다.

## 접속

```bash
ssh -i my-key.pem ec2-user@<PUBLIC_IP>
```

* Ubuntu: ubuntu
* Amazon Linux: ec2-user

권한 에러 발생 시

```bash
chmod 600 my-key.pem
```

---

# PuTTY

Windows용 SSH 클라이언트입니다.

> Windows 10 이상은 OpenSSH를 기본 제공하므로 PuTTY가 필수는 아닙니다.

## 키 변환

PuTTY는 .pem을 직접 사용할 수 없어 .ppk로 변환이 필요합니다.

**PuTTYgen 사용**
1. Load 버튼으로 .pem 파일 선택
2. Save private key로 .ppk 저장

## 접속

1. PuTTY 실행
2. Host Name: ec2-user@\<PUBLIC_IP\>
    * Ubuntu는 ubuntu@\<PUBLIC_IP\>
3. Connection → SSH → Auth에서 .ppk 선택
4. Open

---

# 웹 콘솔

브라우저만으로 접속 가능합니다.

**필요 권한**
* ssm:StartSession
* ec2-instance-connect:SendSSHPublicKey

## EC2 Instance Connect

EC2 콘솔 → 인스턴스 선택 → Connect → EC2 Instance Connect → Connect

가장 간단한 방법입니다.

## Session Manager

EC2 콘솔 → 인스턴스 선택 → Connect → Session Manager → Connect

* SSM Agent 설치 및 IAM Role 필요
* SSH 22번 포트 차단 시에도 접속 가능

## Serial Console

네트워크 불통 시에도 접속 가능합니다.  
EC2 설정에서 활성화가 필요합니다.

---

# 접속 방법 비교

| 방법 | 인증 | 설치 | 장점 | 단점 |
|------|------|------|------|------|
| mssh | IAM/SSO | 필요 | 키 관리 불필요 | 설치 복잡 |
| OpenSSH | PEM | 거의 없음 | 빠르고 단순 | 키 관리 필요 |
| PuTTY | PPK | 필요 | GUI 제공 | 키 변환 필요 |
| 웹 콘솔 | IAM | 없음 | 즉시 접속 | 기능 제한적 |

---

# 권장 사항

* **조직 환경**: mssh - IAM 기반 권한 관리로 보안성 향상
* **개인 환경**: OpenSSH - 빠르고 간단
* **임시 접속**: 웹 콘솔 - 설치 없이 즉시 사용

---

[참고 문서]

* https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
* https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html
* https://aws.amazon.com/ec2/instance-connect/