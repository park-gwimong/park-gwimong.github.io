---
layout: post
title: "SCP 사용법"
date: 2018-04-20 10:43:00+0900
categories: Linux
tags: Linux Utility
mathjax: true
---

SCP
===

SCP : Secure Copy Protocol

SSH 프로토콜을 이용해 파일을 전송하는 유틸리티입니다.   



* 로컬 -> 원격서버로 파일 전송   
>scp [옵션] [전송파일] [원격서버계정명]@[원격주소]:[전송경로]   
로컬 서버의 test.txt 파일을 192.168.10.1의 서버에 gmpark로 접속해서 홈디렉토리로 파일 전송.  
```
[root@localhost /]scp test.txt gmpark@192.168.10.1:~/
```

* 원격 -> 로컬서버로 파일 전송    
>scp [옵션] [원격서버계정명]@[원격주소]:[전송할 파일] [전송받을 경로]   
원격 서버의 /home/gmpark/test.txt파일을 현재 디렉토리로 송신.   
```
[root@localhost /]scp gmpark@192.168.10.1:~/test.txt .
```

* 옵션   
> 
-P : 포트번호를 지정   
-p : 원본파일의 상태정보(수정, 사용시간, 권한 등)을 유지   
-r : 하위 디렉토리 및 파일 모두를 전송  
-c : 압축하여 전송   
-v : 전송 과정을 출력   
-a : 아카이브 모드로 전송   
