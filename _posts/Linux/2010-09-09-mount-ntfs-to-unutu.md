---
layout: post
title: "Ubuntu에 NTFS 파티션 자동으로 마운트 설정"
date: 2010-09-09 19:33:00+0900
categories: Linux
tags: Linux Utility NTFS
mathjax: true
---

우분투 9.04 이후에는 NTFS를 마운트 시키기 위해 별다른 작업을 하지 않더라도 이미 인식은 되어 있어서 윈도우창에서 한번만 NTFS 파티션에 접속하기만 하면 자동으로 마운트됩니다.  

하지만 한번이라도 NTFS 파티션에 접속을 해야 마운트 되기 때문에 부팅때부터 NTFS 파티션을 자동으로 마운트 하기 위해서는 /etc/fstab  파일에 한줄만 추가해주면 됩니다.  

/etc/fstab 파일은 부팅시 마운트 시킬 장치들에 대한 정보를 가지고 있는 설정 파일입니다.  

우선 마운트 시킬 NTFS 파티션의 UUID를 알아야 합니다.  

```
$sudo blkid
```

명령어를 실행 시키면 모든 파티션의 대한 정보가 나타납니다.  
![img](/resource/20100909/20100909-img-1.png)

여기서 보면 NTFS 파티션의 UUID가 "3E6EA9836EA93495"이란 것을 알 수 있습니다.  
이정보를 /etc/fstab파일에 추가시켜주면 끝입니다.  

추가하기 전에 먼저 마운트 시킬 디렉토리를 생성해주겠습니다.  
```
$sudo mkdir /home/mong/Data
```

명령어로 /etc/fstab파일을 엽니다  

```
$sudo vim /etc/fstab
```

설정 파일의 맨 밑에  
UUID=[마운트시킬 UUID] [마운트시킬위치] [타입] [옵션], [설정]  
를 추가해주시면 됩니다.  
![img](/resource/20100909/20100909-img-2.png)  

이제부터는 부팅할때 자동으로 NTFS 파티션이 /home/mong/Data디렉토리에 마운트되어있게 됩니다.
