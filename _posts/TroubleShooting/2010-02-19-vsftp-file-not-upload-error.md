---
layout: post
title: "vsfpt에서 파일 업로드가 되지 않는 현상"
subtitle: "553 Could not create file."
date: 2010-11-07 17:35:00+0900
categories: TroubleShooting
tags: vsftp linux
mathjax: true
---

서버와 클라이언트 환경 둘 다 우분투 9.04이다.

서버에 vsftp 서버를 돌려놓고 클라이언트 컴퓨터에서 콘솔로 ftp 접속을 하였는데, 리스트도 보여지고 파일도 다운이 가능한데 파일 업로드만 되지 않았다. (윈도우에서 알ftp로 접속시에는 파일 업로드와 다운로드 모두 잘 되었다)  

<Br>

# 장애 현상
> 200 PORT command successful. Consider using PASV.  
553 Could not create file.


# 해결 방법
서버쪽 문제인가 해서 vsftp.conf를 몇번이고 보았지만 잘못 설정된 부분은 없었고, 해당 에러 메시지를 토대로 검색을 하였다.  

위 처럼 에러 메세지가 뜨는 경우는 2가지, passve모드와 active 모드 설정 문제인 경우와 SuSelinux 정책 때문이란다.  

결론은 접근 디렉토리의 권한이 root로 되어 있어서 접근 아이디의 소유권 문제였다.  
chown, chogrp 명령어를 이용해 소유권을 해당 접근 아이디로 바꾸어주니 해결 되었다..-_-;;  

하지만 후에 해당 문제가 발생할 수 있으므로 위의 2가지 문제에 대해 포스팅 해놓는다.  

## SuSeLinux 정책 수정
### 방법 1:
```
# setenforce 0 <-- 일식적으로 SuSeLinux 정책을 끔
# setenforce 1 <-- 일식적으로 SuSeLinux 정책을 끔
```

### 방법 2:
```
# setsebool  -P ftpd_disable_trans 1<--일시적으로 SuSeLinux 정책을 끔
# /etc/rc.d/init.d/vsftpd restart
```

> ps: 우분투9.04에서는 SuSeLinux 정책을 사용하지 않는것 같다.  
해당 명령어를 입력하면 해당 패키지가 없다고 하고, 해당 패키지를 설치하여 명령어를 수행해도 이미 SuSeLinux는 적용되어 있지 않다고 뜬다.

# Active모드와 Pasv 모드
ftp 프로토콜에서는 Active모드와 Passive 모드, 이렇게 2가지 모드를 지원한다.  
이는 서버와 클라이언트 중에서 어느 것이 연결 요청을 하는 것이냐의 차이다.  

연결을 하기 위해선 IP주소와 포트가 필요하다. Active모드에서는 클라이언트와 서버 둘 다 서로의 대한 Ip주소와 포트 번호를 모두 알고 있고 클라이언트에서 서버측으로 정해진 포트로 연결을 요청한다.  

하지만 Passive모드에서는 서버 측에서 클라이언트 측으로 자신의 아이피와 포트 번호로 연결을 요청한다.  
이는 공유기처럼 가상 아이피를 사용하는 경우나 유동 아이피인 경우 유용하게 사용 될 수 있다.  


## 사용방법
```
$sudo gedit /etc/vsftpd/vsftpd.conf
pasv_enable=YES
pasv_min_port=50001
pasv_max_port=51000
```

> 현재 vsftp 2.0.7 버전에서는 기본적으로 PASV 모드로 전송하는 것 같다.  

vsftpd.conf에 pasv_enable 부분 자체가 없는데 ftp 접속해보면 200 PORT command successful. Consider using PASV.<-- 이렇게 뜬다.  

물론 pasv_enble 부분을 추가해줘도 변화는 없다.