---
layout: post
title: "CentOS openJDK 삭제 및 Oracle JDK 설치"
date: 2017-04-13 20:41:00+0900
categories: Linux
tags: CentOS JDK
mathjax: true
---

CentOS에 기본적으로 설치되어 있는 OpenJDK는 OracleJDK 보다 낮은 안정성을 제공합니다.
아무래도 Java가 Oracle에 인수되고 나온 OracleJDK보다 OpenJDK가 안정화가 조금 떨어지는것 같습니다.



1. 기존에 설치되어 있는 OpenJDK를 검색하여 삭제

```bash
[root@localhost /] rpm -qa | grep
java-1.6.0-openjdk-devel-1.6.0.0-11.1.13.4.el6.x86_64
java-1.8.0-openjdk-1.8.0.20-3.b26.el6.x86_64java-1.7.0-openjdk-1.7.0.65-2.5.1.2.el6_5.x86_64


java-1.8.0-openjdk-headless-1.8.0.20-3.b26.el6.x86_64
[root@localhost /] yum remove java-1.6.0-openjdk-devel-1.6.0.0-11.1.13.4.el6.x86_64
[root@localhost /] yum remove java-1.8.0-openjdk-1.8.0.20-3.b26.el6.x86_64
[root@localhost /] yum remove java-1.7.0-openjdk-1.7.0.65-2.5.1.2.el6_5.x86_64
[root@localhost /] yum remove java-1.8.0-openjdk-headless-1.8.0.20-3.b26.el6.x86_64
```

2. JDK 다운로드  
oracle 홈페이지에 접속하여 설치하고자 하는 JDK를 다운로드받습니다.  
URL : http://www.oracle.com/technetwork/java/javase/downloads   
다운로드 파일 : jdk-8u111-linux-x64.tar.gz  


3. 다운로드한 JDK의 압축을 해제  

```bash
[root@localhost /] mv  jdk-8u111-linux-x64.tar.gz /usr/local/
[root@localhost /] cd /usr/local
[root@localhost /] gunzip jdk-8u111-linux-x64.tar.gz
[root@localhost /] tar -xvf jdk-8u111-linux-x64.tar.gz
```


4. 심볼링 링크를 생성  
이 후 여러개의 JDK 버전을 관리하기 편하게 하기 위해서 java라는 이름으로 심볼링 링크를 생성합니다.

```bash
[root@localhost /]ln -s jdk1.8.0_111 java 
```

5. 환경변수 설정  
환경변수에 위에서 생성한 심볼링 링크를 등록합니다.   
```bash
[root@localhost /]vi /etc/profile
```
> \# 다음 내용 추가  
export JAVA_HOME=/usr/local/java  
export PATH=$PATH:$JAVA_HAME/bin  
export CLASSPATH="."  

6. 환경변수 적용
```bash
[root@localhost /]source /etc/profile
```

7. 설치된 버전 확인
```bash
[root@localhost /]java -version
```

---

## OpenJDK가 아닌 Jvm이 설치되어 있는 경우.

1. java 위치 확인
```bash
[root@localhost /]which java
/usr/bin/java

[root@localhost /]ls -al /usr/bin/java
lrwxrwxrwx 1 root root 22 Apr 13 18:52 /usr/bin/java -> /etc/alternatives/java

[root@localhost /]ls -al /etc/alternatives/java
lrwxrwxrwx 1 root root 35 Apr 13 18:52 /etc/alternatives/java -> /usr/lib/jvm/jre-1.5.0-gcj/bin/java
```


2. java 심볼링 링크 변경  
jvm이 삭제할 필요 없이 java 링크만 위에서 설치한 jdk로 변경하겠습니다.
위에서 2~5번까지 수행하여 심볼링 링크 /usr/local/java  생성.  
```bash
[root@localhost /]rm /etc/alternatives/java
[root@localhost /]ln -s /usr/local/java /etc/alternatives/java
```