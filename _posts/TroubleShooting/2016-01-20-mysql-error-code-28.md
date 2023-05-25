---
layout: post
title: "MySQL Error code: 28"
date: 2016-01-20 15:28:00+0900
categories: TroubleShooting
tags: mysql
mathjax: true
---

MySQL이 다음과 같이 실행되지 않는 경우가 발생하였습니다.
![error](/resource/2016/20160120/20160120-mysql-error-28-1.png)

\* apt-get으로 설치한 경우 다음의 파일에 log가 기록됩니다.
> /var/log/mysql.err  
/var/log/mysql.log



mysql.err를 확인해 보니,

> [ERROR] mysqld: Error writing file '/home/mong/mysql/test/' (Errcode: 28)  
[ERROR] Can't start server: can't create PID file : No space left on device.  
[Warning] mysqld: Disk is full writing  
'/home/mong/mysql/test/test.MAI' (Errcode: 28). Waiting for someone to free space... (Expect up to 60 secs delay for server to continue after freeing disk space)  
160120 15:21:39 [Warning] mysqld: Retry in 60 secs. Message reprinted in 600 secs


오류 메세지에 나오듯이 디스크 공간이 부족해서 mysql이 정상적으로 start가 되지 않는 것이었습니다.

디스크 용량을 확인해 보니,  
![error](/resource/2016/20160120/20160120-mysql-error-28-2.png)  
디스크 옹량이 8.8G 중 8.6G를 사용하고 있어서 용량 문제가 아닌줄 알았는데,,뒤에 숫자와 %가 중요한것이었습니다.  
결국사용가능한 디스크가 없어서 문제가 발생한 것이였습니다.  

log파일들을 지워주고 용량을 확보한 후 실행하니 잘 수행됩니다.
