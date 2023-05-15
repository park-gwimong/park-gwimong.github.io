---
layout: post
title: "OracleJDK 설치"
date: 2018-04-20 13:22:00+0900
categories: Linux
tags: Linux CentOS JDK
mathjax: true
---

OpenJDK?
===
OpenJDK는 Sun이 Oracle에 합병되기 전에 JDK를 오픈소스화하기 위해 2007년에  시작된 프로젝트입니다.  
Sun이 Thrid-party 라이브러리 저작권자에 오픈 소스로 공개할 수 있도록 설득하였으나, 잘되지 않았고 저작권자가 오픈소스화를 거부한 일부 컴포넌트를 제외한 나머지 JDK 소스코드를 기반으로 OpenJDK 프로젝트가 수행 되었습니다.

이 후 Oracle이 Sun을 합병하면서 OpenJDK에 몇 가지 기능들을 더 추가하여 OracleJDK를 제공하고있습니다.

JDK6에서는 OpenJDK와 OracleJDK의 성능 차이 및 이슈들이 좀 많다고 합니다.   
하지만 JDK7부터는 거의 동일하다고 하네요.   
(Oracle은 OpenJDK 프로젝트를 주도하는 주체이며, OracleJDK는 OpenJDK를 기반으로 구현)


OracleJDK 설치
===

1. 기존에 설치 되어 있는 OpenJDK 삭제   
```
[root@localhost /] rpm -qa | grep
java-1.6.0-openjdk-devel-1.6.0.0-11.1.13.4.el6.x86_64
java-1.8.0-openjdk-1.8.0.20-3.b26.el6.x86_64
java-1.7.0-openjdk-1.7.0.65-2.5.1.2.el6_5.x86_64
java-1.8.0-openjdk-headless-1.8.0.20-3.b26.el6.x86_64
[root@localhost /] yum remove java-1.6.0-openjdk-devel-1.6.0.0-11.1.13.4.el6.x86_64
[root@localhost /] yum remove java-1.8.0-openjdk-1.8.0.20-3.b26.el6.x86_64
[root@localhost /] yum remove java-1.7.0-openjdk-1.7.0.65-2.5.1.2.el6_5.x86_64
[root@localhost /] yum remove java-1.8.0-openjdk-headless-1.8.0.20-3.b26.el6.x86_64
```

2. JDK 다운로드   
	Oracle 홈페이지에서 설치하고자하는 JDK를 [<U>다운로드</U>](http://www.oracle.com/technetwork/java/javase/downloads)

3. 다운로드한 JDK 압축 해제   
```
[root@localhost /]mv  jdk-8u111-linux-x64.tar.gz /usr/local/
[root@localhost /]cd /usr/local
[root@localhost /]gunzip jdk-8u111-linux-x64.tar.gz
[root@localhost /]tar -xvf jdk-8u111-linux-x64.tar.gz
```
4. 심볼링 링크 생성
```
[root@localhost /]ln -s jdk1.8.0_111 java 
```
5. 환경변수 설정
```
[root@localhost /]vi /etc/profile
```
>.... 생략 ...   
#가장 아래에 다음 내용 추가   
export JAVA_HOME=/usr/local/java   
export PATH=$PATH:$JAVA_HAME/bin   
export CLASSPATH="."   
6. 환경변수 적용
```
[root@localhost /]source /etc/profile
```
7. 설치된 Java 버전 확인
```
[root@localhost /]java -version
```

---------------------------------------

OpenJDK를 삭제하지 않고 변경하는 방법
===

1. OracleJDK 설치.

2. 현재 설치된 java 위치 확인
```
[root@localhost /]which java
/usr/bin/java
[root@localhost /]ls -al /usr/bin/java
lrwxrwxrwx 1 root root 22 Apr 13 18:52 /usr/bin/java -> /etc/alternatives/java
[root@localhost /]ls -al /etc/alternatives/java
lrwxrwxrwx 1 root root 35 Apr 13 18:52 /etc/alternatives/java -> /usr/lib/jvm/jre-1.5.0-gcj/bin/java
```
3. java 심볼링 링크 변경
```
[root@localhost /]rm /etc/alternatives/java
[root@localhost /]ln -s /usr/local/java /etc/alternatives/java
```
4. 변경된 Java 버전 확인
```
[root@localhost /]java -version
```

