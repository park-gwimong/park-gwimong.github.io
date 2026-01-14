---
title: "CentOS yum 저장소 변경하기"
pubDate: 2016-10-17T16:26:00+09:00
category: "linux"
tags: ["CentOS", "YUM"]
math: true
---


1. 기존 저장소 백업
```shell
[root@localhost /] #bzip2 /etc/yum.repos.d/CentOS-*.repo
```


2. 국내 저장소( daumkakako) 파일 추가
```shell
[root@localhost /] echo '[base]
name=CentOS-$releasever - Base
baseurl=http://ftp.daumkakao.com/centos/$releasever/os/$basearch/

gpgcheck=0 

[updates]

name=CentOS-$releasever - Updates

baseurl=http://ftp.daumkakao.com/centos/$releasever/updates/$basearch/

gpgcheck=0

[extras]

name=CentOS-$releasever - Extras

baseurl=http://ftp.daumkakao.com/centos/$releasever/extras/$basearch/

gpgcheck=0' > /etc/yum.repos.d/Daum.repo
```

3. 확인
```shell
[root@localhost /] #yum repolist
```